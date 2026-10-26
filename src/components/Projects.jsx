import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { projects } from '../data/content';
import { prefersReducedMotion } from '../utils/motion.js';
import CharacterGuide from './CharacterGuide';
import useFocusTrap from '../hooks/useFocusTrap';
import SlingRingPortal from '../shared/SlingRingPortal';
import AmbientOrbs from '../shared/AmbientOrbs';
import './Projects.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const DOMAIN_FILTERS = [
  { id: 'all', label: 'All Works' },
  { id: 'ml', label: 'Machine Learning' },
  { id: 'web', label: 'Full Stack' },
  { id: 'bi', label: 'Data & BI' },
];

export default function Projects() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const portalCardRef = useRef(null);
  const burstPosRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState(null); // project id or null

  const closePortal = useCallback(() => setSelected(null), []);

  useFocusTrap(selected !== null, portalCardRef, closePortal);

  const visibleProjects = projects.filter(
    (project) => activeFilter === 'all' || project.domain === activeFilter
  );

  // Clicking a case file opens the portal from that card's position
  // (sling-ring style). The last burst position is kept so the closing ripple
  // originates from the same card.
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

  // Case files rise as one wave the first time they enter. Re-runs when the
  // filter changes, so a new set of cards arrives with the same rhythm instead
  // of snapping in. Transform + opacity only.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cards = gsap.utils.toArray('.case-card', gridRef.current);
      if (!cards.length) return;

      gsap.fromTo(
        cards,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: { trigger: gridRef.current, start: 'top 86%', once: true },
        }
      );
    },
    { scope: sectionRef, dependencies: [activeFilter] }
  );

  return (
    <section id="projects" className="projects-section" ref={sectionRef}>
      {/* Ambient orbs - drift + mouse parallax (shared component) */}
      <AmbientOrbs wrapClass="projects-orbs" orbClass="project-orb" depths={[64, 40, 88]} />

      <div className="section-container">
        <header className="projects-header">
          <div className="projects-header-copy">
            <span className="section-label" data-reveal="left">
              PORTFOLIO
            </span>
            <h2 className="projects-title" data-reveal="up" data-reveal-delay="0.08">
              SELECTED <span className="projects-title-accent">WORKS</span>
            </h2>
            <p className="projects-sublabel" data-reveal="up" data-reveal-delay="0.14">
              Production architectures, ML pipelines &amp; scalable full-stack applications.
            </p>
          </div>

          <CharacterGuide
            src="/characters/character-projects.png"
            alt="Adams Jabali pointing to selected projects"
            hint="Featured Engineering Work"
            direction="right"
            triggerRef={sectionRef}
            size="sm"
            className="projects-guide"
          />
        </header>

        {/* Domain filter - text tabs on a single rule, not pills */}
        <div
          className="projects-filter"
          role="group"
          aria-label="Filter projects by domain"
          data-reveal="up"
          data-reveal-delay="0.18"
        >
          {DOMAIN_FILTERS.map((filter) => {
            const count =
              filter.id === 'all'
                ? projects.length
                : projects.filter((p) => p.domain === filter.id).length;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                className={`projects-filter-btn ${isActive ? 'projects-filter-btn--active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
                aria-pressed={isActive}
              >
                {filter.label}
                <span className="projects-filter-count">{String(count).padStart(2, '0')}</span>
              </button>
            );
          })}
        </div>

        <div className="case-grid" ref={gridRef}>
          {visibleProjects.map((project) => {
            const number = String(projects.indexOf(project) + 1).padStart(2, '0');
            const shownTech = project.tech.slice(0, 4);
            const extraTech = project.tech.length - shownTech.length;
            const isOpen = selected === project.id;

            return (
              <article key={project.id} className={`case-card ${isOpen ? 'case-card--open' : ''}`}>
                <div className="case-media">
                  {project.screenshot && (
                    <img
                      className="case-shot"
                      src={project.screenshot}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="case-media-grid" aria-hidden="true" />
                  <span className="case-numeral" aria-hidden="true">
                    {number}
                  </span>
                  <span className="case-media-caption">{project.category}</span>
                </div>

                <div className="case-body">
                  <h3 className="case-title">{project.title}</h3>
                  <p className="case-desc">{project.description}</p>

                  <p className="case-data">
                    <span className="case-data-metric">{project.metric}</span>
                    <span className="case-data-sep" aria-hidden="true">
                      /
                    </span>
                    <span className="case-data-status">{project.status}</span>
                  </p>

                  <p className="case-tech">
                    {shownTech.map((tech) => (
                      <span key={tech} className="case-tech-tag">
                        {tech}
                      </span>
                    ))}
                    {extraTech > 0 && (
                      <span className="case-tech-tag case-tech-tag--more">+{extraTech}</span>
                    )}
                  </p>

                  <span className="case-cta" aria-hidden="true">
                    Open case file
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="3" y1="10" x2="16" y2="10" />
                      <polyline points="11 5 16 10 11 15" />
                    </svg>
                  </span>
                </div>

                {/* Single focusable target for the whole card: no interactive
                    content nested inside another interactive element. */}
                <button
                  type="button"
                  className="case-open"
                  onClick={(e) => handleSelect(project.id, e)}
                  aria-expanded={isOpen}
                  aria-label={`Open ${project.title} case file`}
                />
              </article>
            );
          })}
        </div>
      </div>

      {/* Themed Dr. Strange portal - shared component; bronze accent from theme. */}
      <SlingRingPortal
        baseClass="project-portal"
        cardClass="project-portal-card"
        open={selected}
        ariaLabel={selectedProject ? `${selectedProject.title} details` : 'Project details'}
        onClose={closePortal}
        cardRef={portalCardRef}
        burstPosRef={burstPosRef}
        animateChildren
      >
        {selectedProject && (
          <>
            {/* In-portal stepper navigation */}
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
                {String(selectedIndex + 1).padStart(2, '0')} /{' '}
                {String(projects.length).padStart(2, '0')}
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
              <span className="project-portal-kicker">{selectedProject.category}</span>
              <h3 className="project-portal-title">{selectedProject.title}</h3>
            </div>

            <p className="project-portal-desc">{selectedProject.description}</p>

            <div className="project-portal-section-label">Key architectural highlights</div>
            <ul className="project-portal-features">
              {selectedProject.features.map((feature) => (
                <li key={feature} className="project-portal-feature">
                  {feature}
                </li>
              ))}
            </ul>

            <div className="project-portal-section-label">Engineered with</div>
            <div className="project-portal-tech">
              {selectedProject.tech.map((tech) => (
                <span key={tech} className="project-portal-tag">
                  {tech}
                </span>
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
