import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { projects } from '../data/content';
import { prefersReducedMotion } from '../utils/motion.js';
import CharacterGuide from './CharacterGuide';
import useFocusTrap from '../hooks/useFocusTrap';
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
  const orbsRef = useRef(null);
  const portalRef = useRef(null);
  const portalCardRef = useRef(null);
  const burstRef = useRef(null);
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
        const s = sectionRef.current.getBoundingClientRect();
        burstPosRef.current = {
          x: r.left + r.width / 2 - s.left,
          y: r.top + r.height / 2 - s.top,
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

  // Themed sling-ring portal - opens on card click with a burst at the card.
  useGSAP(
    () => {
      const portal = portalRef.current;
      if (!portal) return;
      const hasReduced = prefersReducedMotion();

      if (selected == null) {
        // Closing ripple from the last opened card, then collapse + spin away.
        const burst = burstRef.current;
        const pos = burstPosRef.current;
        if (burst && pos && !hasReduced) {
          gsap.set(burst, { x: pos.x, y: pos.y, scale: 0.35, opacity: 0.9 });
          gsap.to(burst, {
            scale: 1.6,
            opacity: 0,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
        gsap.set(portal, { visibility: 'visible' });
        gsap.to(portal, {
          scale: 0.25,
          rotation: hasReduced ? 0 : 8,
          opacity: 0,
          duration: hasReduced ? 0.1 : 0.35,
          ease: 'power2.in',
          overwrite: 'auto',
          onComplete: () => gsap.set(portal, { visibility: 'hidden', rotation: 0 }),
        });
        return;
      }

      gsap.set(portal, { visibility: 'visible' });

      // Sling-ring flare at the clicked card, then the portal expands.
      const burst = burstRef.current;
      const pos = burstPosRef.current;
      if (burst && pos) {
        gsap.set(burst, { x: pos.x, y: pos.y, scale: 0.3, opacity: 1 });
        gsap.to(burst, {
          scale: 1.7,
          opacity: 0,
          duration: hasReduced ? 0.1 : 0.7,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }

      gsap.fromTo(
        portal,
        { scale: 0.3, rotation: hasReduced ? 0 : -5, opacity: 0 },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: hasReduced ? 0.2 : 0.6,
          ease: 'back.out(1.6)',
          overwrite: 'auto',
        }
      );

      const card = portalCardRef.current;
      if (card) {
        gsap.fromTo(
          card,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: hasReduced ? 0.15 : 0.45,
            delay: hasReduced ? 0 : 0.15,
            ease: 'power3.out',
            overwrite: 'auto',
          }
        );

        // Kicker + title + description + features + tags + links stagger up.
        const items = gsap.utils.toArray(
          '.project-portal-card > :not(.project-portal-shimmer):not(.project-portal-close)',
          card
        );
        if (items.length) {
          gsap.fromTo(
            items,
            { y: 18, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              delay: hasReduced ? 0 : 0.32,
              ease: 'power3.out',
              stagger: 0.06,
              overwrite: 'auto',
            }
          );
        }

        const shimmer = card.querySelector('.project-portal-shimmer');
        if (shimmer && !hasReduced) {
          gsap.fromTo(
            shimmer,
            { xPercent: -140 },
            {
              xPercent: 140,
              duration: 1.15,
              delay: 0.3,
              ease: 'power2.inOut',
              overwrite: 'auto',
            }
          );
        }
      }
    },
    { scope: sectionRef, dependencies: [selected] }
  );

  // Card grid: cursor tilt + magnet + colored spotlight.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const grid = gridRef.current;
      if (!grid) return;

      const cards = gsap.utils.toArray('.project-card', grid);
      if (!cards.length) return;

      const cleanups = cards.map((card) => {
        const tiltX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
        const tiltY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
        const moveX = gsap.quickTo(card, 'x', { duration: 0.45, ease: 'power3.out' });
        const moveY = gsap.quickTo(card, 'y', { duration: 0.45, ease: 'power3.out' });
        const spot = { x: 0, y: 0 };
        const spotX = gsap.quickTo(spot, 'x', {
          duration: 0.4,
          ease: 'power3.out',
          onUpdate: () => card.style.setProperty('--spot-x', `${spot.x}px`),
        });
        const spotY = gsap.quickTo(spot, 'y', {
          duration: 0.4,
          ease: 'power3.out',
          onUpdate: () => card.style.setProperty('--spot-y', `${spot.y}px`),
        });

        const onMove = (e) => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          tiltY(px * 9);
          tiltX(py * -9);
          moveX(px * 12);
          moveY(py * 12 - 4); // slight lift while hovering
          spotX(e.clientX - rect.left);
          spotY(e.clientY - rect.top);
        };
        const onLeave = () => {
          tiltX(0);
          tiltY(0);
          moveX(0);
          moveY(0);
        };

        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
        return () => {
          card.removeEventListener('mousemove', onMove);
          card.removeEventListener('mouseleave', onLeave);
        };
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope: gridRef }
  );

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

  // Ambient orbs - each drifts on its own, and the set parallaxes with the mouse.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      if (!orbsRef.current) return;

      const killDrifts = gsap.utils.toArray('.project-orb-core', orbsRef.current).map((orb, i) => {
        const tween = gsap.to(orb, {
          x: gsap.utils.random(-44, 44),
          y: gsap.utils.random(-28, 28),
          scale: gsap.utils.random(0.85, 1.15),
          duration: gsap.utils.random(6, 10),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.5,
        });
        return () => tween.kill();
      });

      const wraps = gsap.utils.toArray('.project-orb', orbsRef.current);
      const depths = [64, 40, 88];
      const parallax = wraps.map((wrap, i) => {
        const xTo = gsap.quickTo(wrap, 'x', { duration: 1.3, ease: 'power2.out' });
        const yTo = gsap.quickTo(wrap, 'y', { duration: 1.3, ease: 'power2.out' });
        return { xTo, yTo, depth: depths[i % depths.length] };
      });

      const section = sectionRef.current;
      const onMouse = (e) => {
        const r = section.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        parallax.forEach((p) => {
          p.xTo(nx * p.depth);
          p.yTo(ny * p.depth);
        });
      };
      section.addEventListener('mousemove', onMouse);

      return () => {
        killDrifts.forEach((kill) => kill());
        section.removeEventListener('mousemove', onMouse);
      };
    },
    { scope: sectionRef }
  );

  return (
    <section id="projects" className="projects-section" ref={sectionRef}>
      {/* Ambient orbs - drift + mouse parallax (GSAP) */}
      <div className="projects-orbs" ref={orbsRef} aria-hidden="true">
        <span className="project-orb project-orb--1"><span className="project-orb-core" /></span>
        <span className="project-orb project-orb--2"><span className="project-orb-core" /></span>
        <span className="project-orb project-orb--3"><span className="project-orb-core" /></span>
      </div>

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

      {/* Themed Dr. Strange portal - opens when a project card is clicked.
          Accent (--portal-accent) comes from the project's color. */}
      <div
        className="project-portal"
        ref={portalRef}
        role="dialog"
        aria-modal="true"
        aria-label={selectedProject ? `${selectedProject.title} details` : 'Project details'}
        style={selectedProject ? { '--portal-accent': selectedProject.color } : undefined}
      >
        <div className="project-portal-backdrop" onClick={closePortal} aria-hidden="true" />
        <span className="project-portal-burst" ref={burstRef} aria-hidden="true" />
        <div className="project-portal-rig">
          <span className="project-portal-fire" aria-hidden="true" />
          <svg
            className="project-portal-arcs"
            viewBox="0 0 100 100"
            aria-hidden="true"
            focusable="false"
          >
            <circle
              className="project-portal-arc project-portal-arc--1"
              cx="50"
              cy="50"
              r="48"
              pathLength={1}
            />
            <circle
              className="project-portal-arc project-portal-arc--2"
              cx="50"
              cy="50"
              r="43"
              pathLength={1}
            />
            <circle
              className="project-portal-arc project-portal-arc--3"
              cx="50"
              cy="50"
              r="38"
              pathLength={1}
            />
          </svg>
          <span className="project-portal-ring project-portal-ring--outer" aria-hidden="true" />
          <span className="project-portal-ring project-portal-ring--inner" aria-hidden="true" />
          {selectedProject && (
            <div className="project-portal-card" ref={portalCardRef}>
              <span className="project-portal-shimmer" aria-hidden="true" />
              
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
