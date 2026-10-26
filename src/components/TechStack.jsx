import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { hero } from '../data/content';
import { prefersReducedMotion } from '../utils/motion.js';
import useFocusTrap from '../hooks/useFocusTrap';
import SlingRingPortal from '../shared/SlingRingPortal';
import AmbientOrbs from '../shared/AmbientOrbs';
import './TechStack.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const { techstack } = hero;

// Every category present in the data, in first-seen order.
const CATEGORIES = Array.from(new Set(techstack.map((t) => t.category)));

// SVG glyphs per portalType - stroke-based, 20x20 viewBox, colored via currentColor.
const PORTAL_GLYPHS = {
  'data-vortex': (
    <>
      <circle cx="10" cy="10" r="8" strokeDasharray="2 3" />
      <circle cx="10" cy="10" r="4" />
      <line x1="10" y1="2" x2="10" y2="18" />
      <line x1="2" y1="10" x2="18" y2="10" />
    </>
  ),
  'component-universe': (
    <>
      <circle cx="10" cy="10" r="2.5" />
      <ellipse cx="10" cy="10" rx="8" ry="3.5" />
      <ellipse cx="10" cy="10" rx="8" ry="3.5" transform="rotate(60 10 10)" />
      <ellipse cx="10" cy="10" rx="8" ry="3.5" transform="rotate(120 10 10)" />
    </>
  ),
  'black-hole': (
    <>
      <circle cx="10" cy="10" r="3" />
      <circle cx="10" cy="10" r="6" strokeDasharray="1.5 2" />
      <circle cx="10" cy="10" r="9" strokeDasharray="0.8 2.4" />
    </>
  ),
  'data-vault': (
    <>
      <rect x="3" y="5" width="14" height="10" rx="2" />
      <line x1="3" y1="9" x2="17" y2="9" />
      <circle cx="10" cy="12" r="1.2" />
    </>
  ),
  'event-propagation': (
    <>
      <polyline points="2 10 7 5 13 15 18 10" />
      <circle cx="7" cy="5" r="1.5" />
      <circle cx="13" cy="15" r="1.5" />
    </>
  ),
  'branching-timeline': (
    <>
      <line x1="10" y1="2" x2="10" y2="18" />
      <polyline points="10 7 6 4 3 4" />
      <polyline points="10 13 14 16 17 16" />
      <circle cx="10" cy="10" r="1.5" />
    </>
  ),
};

function TechGlyph({ portalType, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PORTAL_GLYPHS[portalType] || PORTAL_GLYPHS['data-vault']}
    </svg>
  );
}

export default function TechStack() {
  const sectionRef = useRef(null);
  const boardRef = useRef(null);
  const portalCardRef = useRef(null);
  const burstPosRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState(null); // tech name or null

  const closePortal = useCallback(() => setSelected(null), []);

  useFocusTrap(selected !== null, portalCardRef, closePortal);

  // Groups for the board: one per category, filtered by the active tab.
  const groups = CATEGORIES.filter(
    (category) => activeCategory === 'All' || category === activeCategory
  ).map((category) => ({
    category,
    items: techstack.filter((tech) => tech.category === category),
  }));

  const handleSelect = useCallback(
    (name, e) => {
      const next = selected === name ? null : name;
      if (next !== null && e?.currentTarget) {
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

  useEffect(() => {
    if (selected === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const selectedTech = techstack.find((t) => t.name === selected) || null;

  // Entries rise as one wave the first time the board enters view; re-runs on
  // filter change so a new set arrives with the same rhythm. Transform +
  // opacity only - no blur, no per-item loops.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const entries = gsap.utils.toArray('.ts-entry', boardRef.current);
      if (!entries.length) return;

      gsap.fromTo(
        entries,
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          ease: 'power3.out',
          stagger: 0.035,
          scrollTrigger: { trigger: boardRef.current, start: 'top 88%', once: true },
        }
      );
    },
    { scope: sectionRef, dependencies: [activeCategory] }
  );

  return (
    <section id="techstack" className="ts-section" ref={sectionRef}>
      {/* Ambient orbs - drift + mouse parallax (shared component) */}
      <AmbientOrbs wrapClass="ts-bg-orbs" orbClass="ts-bg-orb" depths={[72, 48, 96]} />

      <div className="section-container">
        <header className="ts-header">
          <span className="section-label" data-reveal="left">
            CONJURED DISCIPLINES
          </span>
          <h2 className="ts-title" data-reveal="up" data-reveal-delay="0.08">
            TECH <span className="ts-title-accent">STACK</span>
          </h2>
          <p className="ts-sublabel" data-reveal="up" data-reveal-delay="0.14">
            Every tool is a spell. These are the ones I've mastered.
          </p>
        </header>

        {/* Category filter - text tabs on one rule */}
        <div
          className="ts-filter"
          role="group"
          aria-label="Filter technologies by category"
          data-reveal="up"
          data-reveal-delay="0.18"
        >
          {['All', ...CATEGORIES].map((category) => {
            const count =
              category === 'All'
                ? techstack.length
                : techstack.filter((t) => t.category === category).length;
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                className={`ts-filter-btn ${isActive ? 'ts-filter-btn--active' : ''}`}
                onClick={() => setActiveCategory(category)}
                aria-pressed={isActive}
              >
                {category}
                <span className="ts-filter-count">{String(count).padStart(2, '0')}</span>
              </button>
            );
          })}
        </div>

        {/* Board: category groups flowing in columns */}
        <div className="ts-board" ref={boardRef}>
          {groups.map((group) => (
            <section className="ts-group" key={group.category} aria-label={group.category}>
              <h3 className="ts-group-title">
                <span>{group.category}</span>
                <span className="ts-group-count">{String(group.items.length).padStart(2, '0')}</span>
              </h3>

              <ul className="ts-list">
                {group.items.map((tech) => (
                  <li className="ts-item" key={tech.name}>
                    <button
                      type="button"
                      className={`ts-entry ${selected === tech.name ? 'ts-entry--active' : ''}`}
                      onClick={(e) => handleSelect(tech.name, e)}
                      aria-expanded={selected === tech.name}
                      aria-label={`${tech.name}, ${tech.category}. Open details.`}
                    >
                      <TechGlyph portalType={tech.portalType} className="ts-entry-glyph" />
                      <span className="ts-entry-name">{tech.name}</span>
                      <span className="ts-entry-mark" aria-hidden="true">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <line x1="4" y1="16" x2="16" y2="4" />
                          <polyline points="8 4 16 4 16 12" />
                        </svg>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {/* Sling-ring portal - shared chrome, single bronze accent. */}
      <SlingRingPortal
        baseClass="ts-portal"
        cardClass="ts-portal-card"
        open={selected}
        ariaLabel={selectedTech ? `${selectedTech.name} details` : 'Technology details'}
        onClose={closePortal}
        cardRef={portalCardRef}
        burstPosRef={burstPosRef}
        animateChildren
      >
        {selectedTech && (
          <>
            <button type="button" className="ts-portal-close" onClick={closePortal} aria-label="Close portal">
              ESC{' '}
              <svg className="ts-portal-close-icon" viewBox="0 0 20 20" aria-hidden="true">
                <line x1="3" y1="3" x2="17" y2="17" />
                <line x1="3" y1="17" x2="17" y2="3" />
              </svg>
            </button>

            <div className="ts-portal-header">
              <TechGlyph portalType={selectedTech.portalType} className="ts-portal-glyph" />
              <div>
                <span className="ts-portal-kicker">{selectedTech.category}</span>
                <h3 className="ts-portal-title">{selectedTech.name}</h3>
              </div>
            </div>

            <p className="ts-portal-desc">{selectedTech.description}</p>

            {selectedTech.involvement && (
              <>
                <div className="ts-portal-section-label">Where it's used</div>
                <p className="ts-portal-involvement">{selectedTech.involvement}</p>
              </>
            )}

            {selectedTech.repos?.length > 0 && (
              <>
                <div className="ts-portal-section-label">Repositories</div>
                <div className="ts-portal-repos">
                  {selectedTech.repos.map((repo) => (
                    <a
                      key={repo}
                      className="ts-portal-repo-link"
                      href={`https://github.com/Jabs007/${repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {repo}
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <line x1="4" y1="16" x2="16" y2="4" />
                        <polyline points="8 4 16 4 16 12" />
                      </svg>
                    </a>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </SlingRingPortal>
    </section>
  );
}
