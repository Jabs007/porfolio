import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { projects } from '../data/content';
import { prefersReducedMotion } from '../utils/motion.js';
import CharacterGuide from './CharacterGuide';
import useFocusTrap from '../hooks/useFocusTrap';
import SlingRingPortal from '../shared/SlingRingPortal';
import AmbientOrbs from '../shared/AmbientOrbs';
import useTiltMagnet from '../shared/useTiltMagnet';
import './Projects.css';

gsap.registerPlugin(useGSAP);

// Themed SVG glyphs for the project cards (replaces the old emoji field).
// Stroke-based, 24x24, colored via currentColor so each card tints its icon
// with --card-accent. Matches the hand-rolled SVG style of the portal arcs.
const PROJECT_ICON_PATHS = {
  'chart-bars': (
    <>
      <path d="M3 21h18" />
      <line x1="7" y1="21" x2="7" y2="11" />
      <line x1="12" y1="21" x2="12" y2="5" />
      <line x1="17" y1="21" x2="17" y2="14" />
    </>
  ),
  'chart-line': (
    <>
      <polyline points="3 17 8.5 11.5 13 15 21 6" />
      <polyline points="15 6 21 6 21 12" />
    </>
  ),
  'shopping-cart': (
    <>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </>
  ),
  'shield-check': (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  cpu: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </>
  ),
};

const DOMAIN_FILTERS = [
  { id: 'all', label: 'All Works' },
  { id: 'ml', label: 'Machine Learning & AI' },
  { id: 'web', label: 'Full Stack & Web' },
  { id: 'bi', label: 'Data Science & BI' },
];

function ProjectIcon({ name, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PROJECT_ICON_PATHS[name] || null}
    </svg>
  );
}

export default function Projects() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const portalCardRef = useRef(null);
  const burstPosRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState(null); // project id or null

  const closePortal = useCallback(() => setSelected(null), []);

  useFocusTrap(selected !== null, portalCardRef, closePortal);

  // Clicking a card opens the themed portal from the card's position
  // (sling-ring style). The last burst position is kept so the closing
  // ripple can originate from the same card.
  const handleSelect = useCallback(
    (id, e) => {
      const next = selected === id ? null : id;
      if (next != null && e?.currentTarget) {
        const r = e.currentTarget.getBoundingClientRect();
        // Viewport coordinates: the burst lives inside the fixed portal
        // overlay (SlingRingPortal), so its containing block is the viewport.
        burstPosRef.current = {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
        };
      }
      setSelected(next);
    },
    [selected]
  );

  const handlePrev = useCallback(() => {
    if (selected == null) return;
    const currIdx = projects.findIndex((p) => p.id === selected);
    const prevIdx = (currIdx - 1 + projects.length) % projects.length;
    setSelected(projects[prevIdx].id);
  }, [selected]);

  const handleNext = useCallback(() => {
    if (selected == null) return;
    const currIdx = projects.findIndex((p) => p.id === selected);
    const nextIdx = (currIdx + 1) % projects.length;
    setSelected(projects[nextIdx].id);
  }, [selected]);

  // ESC and Arrow keys for portal navigation.
  useEffect(() => {
    if (selected == null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, handlePrev, handleNext]);

  const selectedIndex = projects.findIndex((p) => p.id === selected);
  const selectedProject = selectedIndex >= 0 ? projects[selectedIndex] : null;

  // Card grid: cursor tilt + magnet + colored spotlight (shared hook).
  useTiltMagnet(gridRef, '.project-card', { tilt: 9, magnet: 12, lift: 4 });


  // Cinematic scroll: the grid scales forward into focus as the section
  // enters (STACK -> PROJECTS depth zoom), then the whole grid drifts
  // laterally while the user keeps scrolling (horizontal drift). Cards get
  // a tiny alternating tilt so the row reads as moving in depth, not just
  // sliding. rotationZ is used, which never collides with the cursor tilt
  // (rotationX/rotationY) or the magnet (x/y quickTo).
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const section = sectionRef.current;
      const grid = gridRef.current;
      if (!section || !grid) return;

      // STACK -> PROJECTS: scale forward into focus (blur clears to sharp).
      gsap.fromTo(
        grid,
        { scale: 0.94, opacity: 0.55, filter: 'blur(6px)' },
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 95%',
            end: 'top 45%',
            scrub: 0.5,
          },
        }
      );

      // Horizontal drift while the page continues vertically.
      const drift = gsap.fromTo(
        grid,
        { xPercent: 2.4 },
        {
          xPercent: -2.4,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      );

      // Alternating micro-tilt per card for depth while drifting.
      const cards = gsap.utils.toArray('.project-card', grid);
      const tilts = cards.map((card, i) =>
        gsap.to(card, {
          rotation: i % 2 ? 1.1 : -1.1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        })
      );

      return () => {
        drift.scrollTrigger?.kill();
        tilts.forEach((t) => t.scrollTrigger?.kill());
      };
    },
    { scope: sectionRef }
  );



  return (
    <section id="projects" className="projects-section" ref={sectionRef}>
      {/* Ambient orbs - drift + mouse parallax (shared component) */}
      <AmbientOrbs wrapClass="projects-orbs" orbClass="project-orb" depths={[64, 40, 88]} />

      <div className="section-container">
        <div className="projects-header-wrap">
          <div>
            <span className="section-label" data-reveal="left">PORTFOLIO</span>
            <h2 className="projects-title-main" data-reveal="up" data-reveal-delay="0.1">
              SELECTED <span className="projects-title-accent">WORKS</span>
            </h2>
            <p className="projects-sublabel" data-reveal="up" data-reveal-delay="0.15">
              Production architectures, ML pipelines & scalable full-stack applications.
            </p>
          </div>
          <CharacterGuide
            src="/characters/character-projects.png"
            alt="Adams Jabali pointing to selected projects"
            hint="Featured Engineering Work"
            direction="right"
            triggerRef={sectionRef}
            size="md"
            className="projects-guide-embed"
          />
        </div>

        {/* Interactive Domain Filter Bar */}
        <div className="projects-filter-bar" data-reveal="up" data-reveal-delay="0.2">
          {DOMAIN_FILTERS.map((f) => {
            const count = f.id === 'all' ? projects.length : projects.filter((p) => p.domain === f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                className={`projects-filter-pill ${activeFilter === f.id ? 'projects-filter-pill--active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
                <span className="projects-filter-count">({String(count).padStart(2, '0')})</span>
              </button>
            );
          })}
        </div>

        <div className="projects-grid" ref={gridRef}>
          {projects
            .filter((p) => activeFilter === 'all' || p.domain === activeFilter)
            .map((project, index) => (
            <button
              key={project.id}
              type="button"
              className={`project-card ${selected === project.id ? 'project-card--selected' : ''}`}
              style={{ '--card-accent': project.color }}
              data-reveal="clip"
              data-reveal-delay={String((index % 2) * 0.12)}
              onClick={(e) => handleSelect(project.id, e)}
              aria-expanded={selected === project.id}
              aria-label={`${project.title}, ${project.category}. Click to open the portal.`}
            >
              <div className="project-card-header">
                <span className="project-status-badge">
                  <span className="project-status-dot" aria-hidden="true" />
                  {project.status || 'FEATURED WORK'}
                </span>
                <span className="project-card-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <span className="project-visual">
                {project.screenshot && (
                  <img
                    className="project-screenshot"
                    src={project.screenshot}
                    alt=""
                    loading="lazy"
                    aria-hidden="true"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <span className="project-visual-inner" aria-hidden="true" />
                <span className="project-emoji-float" aria-hidden="true">
                  <ProjectIcon name={project.icon} className="project-emoji" />
                </span>
                {project.metric && (
                  <span className="project-metric-pill" aria-hidden="true">
                    {project.metric}
                  </span>
                )}
                <span className="project-shine" aria-hidden="true" />
              </span>

              <span className="project-body">
                <span className="project-category">{project.category}</span>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                <span className="project-tech">
                  {project.tech.map((t) => (
                    <span key={t} className="tech-tag">{t}</span>
                  ))}
                </span>

                <div className="project-card-footer">
                  <span className="project-hint">
                    Open portal <span aria-hidden="true">→</span>
                  </span>
                  <div className="project-quick-actions">
                    {project.github && (
                      <a
                        className="project-quick-link"
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="View Source Code"
                      >
                        Code <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    {project.live && (
                      <a
                        className="project-quick-link project-quick-link--live"
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="View Live Demo"
                      >
                        Live <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Themed Dr. Strange portal - shared component; accent comes from the project's color. */}
      <SlingRingPortal
        baseClass="project-portal"
        cardClass="project-portal-card"
        open={selected}
        accentColor={selectedProject ? selectedProject.color : undefined}
        ariaLabel={selectedProject ? `${selectedProject.title} details` : 'Project details'}
        onClose={closePortal}
        cardRef={portalCardRef}
        burstPosRef={burstPosRef}
        animateChildren
      >
        {selectedProject && (
          <>
              
              {/* In-Portal Stepper Navigation */}
              <div className="project-portal-nav">
                <button
                  type="button"
                  className="project-portal-step-btn"
                  onClick={handlePrev}
                  aria-label="Previous project"
                >
                  <span aria-hidden="true">←</span> Prev
                </button>
                <span className="project-portal-step-counter">
                  {String(selectedIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  className="project-portal-step-btn"
                  onClick={handleNext}
                  aria-label="Next project"
                >
                  Next <span aria-hidden="true">→</span>
                </button>
                <button
                  type="button"
                  className="project-portal-close-pill"
                  onClick={closePortal}
                  aria-label="Close portal"
                >
                  ESC <span aria-hidden="true">✕</span>
                </button>
              </div>

              <div className="project-portal-header">
                <span className="project-portal-kicker">
                  {selectedProject.category}
                </span>
                <h3 className="project-portal-title">{selectedProject.title}</h3>
              </div>

              <p className="project-portal-desc">{selectedProject.description}</p>
              
              <div className="project-portal-section-label">KEY ARCHITECTURAL HIGHLIGHTS</div>
              <ul className="project-portal-features">
                {selectedProject.features.map((feature) => (
                  <li key={feature} className="project-portal-feature">{feature}</li>
                ))}
              </ul>

              <div className="project-portal-section-label">ENGINEERED WITH</div>
              <div className="project-portal-tech">
                {selectedProject.tech.map((t) => (
                  <span key={t} className="project-portal-tag">{t}</span>
                ))}
              </div>

              <div className="project-portal-links">
                <a
                  className="project-portal-link project-portal-link--primary"
                  href={selectedProject.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source Code <span aria-hidden="true">↗</span>
                </a>
                {selectedProject.live && (
                  <a
                    className="project-portal-link"
                    href={selectedProject.live}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live Deployment <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
          </>
        )}
      </SlingRingPortal>
    </section>
  );
}
