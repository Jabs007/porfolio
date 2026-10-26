import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { hero } from '../data/content';
import { prefersReducedMotion } from '../utils/motion.js';
import useFocusTrap from '../hooks/useFocusTrap';
import SlingRingPortal from '../shared/SlingRingPortal';
import AmbientOrbs from '../shared/AmbientOrbs';
import useTiltMagnet from '../shared/useTiltMagnet';
import './TechStack.css';

gsap.registerPlugin(ScrollTrigger);

const { techstack } = hero;

// Group tech by category for the filter bar
const CATEGORIES = ['All', ...Array.from(new Set(techstack.map((t) => t.category)))];

// SVG glyphs per portalType - stroke-based, 20x20 viewBox, colored via currentColor
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
  const gridRef = useRef(null);
  const portalCardRef = useRef(null);
  const burstPosRef = useRef(null);
  const sigil1Ref = useRef(null);

  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState(null); // tech name

  const closePortal = useCallback(() => setSelected(null), []);

  useFocusTrap(selected !== null, portalCardRef, closePortal);

  const handleSelect = useCallback(
    (name, e) => {
      const next = selected === name ? null : name;
      if (next !== null && e?.currentTarget) {
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

  useEffect(() => {
    if (selected === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const selectedTech = techstack.find((t) => t.name === selected) || null;
  const filteredTech = activeCategory === 'All'
    ? techstack
    : techstack.filter((t) => t.category === activeCategory);

  // Portal open / close is owned by the shared SlingRingPortal component
  // (rendered below); it replays on every `selected` change exactly like the
  // previous per-section implementation.

  // Scroll reveal: scale-in + stagger batch for tech orbs
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const grid = gridRef.current;
      if (!grid) return;

      gsap.fromTo(
        grid,
        { scale: 0.94, opacity: 0.4, filter: 'blur(6px)' },
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 90%', end: 'top 50%', scrub: 0.5 },
        }
      );

      ScrollTrigger.batch('.ts-orb', {
        onEnter: (els) => gsap.fromTo(els, { y: 32, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.06, ease: 'back.out(1.7)', overwrite: 'auto' }),
        start: 'top 88%',
        once: true,
      });
    },
    { scope: sectionRef }
  );

  // 3D tilt + spotlight on each orb (shared hook; re-runs when the filter changes)
  useTiltMagnet(gridRef, '.ts-orb', {
    tilt: 14,
    magnet: 0,
    lift: 0,
    deps: [filteredTech.length],
  });

  // Ambient orb drift + mouse parallax are owned by the shared AmbientOrbs
  // component (rendered below).

  return (
    <section id="techstack" className="ts-section" ref={sectionRef}>
      {/* Background ambient orbs (shared component) */}
      <AmbientOrbs wrapClass="ts-bg-orbs" orbClass="ts-bg-orb" depths={[72, 48, 96]} />

      {/* Decorative background sigil rings */}
      <div className="ts-sigil-wrap" aria-hidden="true">
        <svg className="ts-sigil" viewBox="0 0 200 200" ref={sigil1Ref}>
          <circle className="ts-sigil-ring ts-sigil-ring--1" cx="100" cy="100" r="95" pathLength={1} />
          <circle className="ts-sigil-ring ts-sigil-ring--2" cx="100" cy="100" r="80" pathLength={1} />
          <circle className="ts-sigil-ring ts-sigil-ring--3" cx="100" cy="100" r="65" pathLength={1} />
          <circle className="ts-sigil-ring ts-sigil-ring--4" cx="100" cy="100" r="50" pathLength={1} />
        </svg>
      </div>

      <div className="section-container">
        {/* Header */}
        <div className="ts-header" data-reveal="left">
          <span className="section-label">CONJURED DISCIPLINES</span>
          <h2 className="ts-title-main">
            TECH <span className="ts-title-accent">STACK</span>
          </h2>
          <p className="ts-sublabel" data-reveal="up" data-reveal-delay="0.1">
            Every tool is a spell. These are the ones I've mastered.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="ts-filter-bar" data-reveal="up" data-reveal-delay="0.18">
          {CATEGORIES.map((cat) => {
            const count = cat === 'All' ? techstack.length : techstack.filter((t) => t.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                className={`ts-filter-pill ${activeCategory === cat ? 'ts-filter-pill--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
                <span className="ts-filter-count">({String(count).padStart(2, '0')})</span>
              </button>
            );
          })}
        </div>

        {/* Tech orb grid */}
        <div className="ts-grid" ref={gridRef}>
          {filteredTech.map((tech) => (
            <button
              key={tech.name}
              type="button"
              className={`ts-orb ${selected === tech.name ? 'ts-orb--selected' : ''}`}
              style={{ '--orb-accent': tech.accent }}
              onClick={(e) => handleSelect(tech.name, e)}
              aria-expanded={selected === tech.name}
              aria-label={`${tech.name}, ${tech.category}. Open portal for details.`}
            >
              {/* Inner glow core */}
              <span className="ts-orb-core" aria-hidden="true" />

              {/* Spinning arc rings */}
              <svg className="ts-orb-arcs" viewBox="0 0 100 100" aria-hidden="true">
                <circle className="ts-orb-arc ts-orb-arc--1" cx="50" cy="50" r="46" pathLength={1} />
                <circle className="ts-orb-arc ts-orb-arc--2" cx="50" cy="50" r="38" pathLength={1} />
                <circle className="ts-orb-arc ts-orb-arc--3" cx="50" cy="50" r="30" pathLength={1} />
              </svg>

              {/* Cursor spotlight */}
              <span className="ts-orb-spotlight" aria-hidden="true" />

              {/* Content */}
              <span className="ts-orb-inner">
                <TechGlyph portalType={tech.portalType} className="ts-orb-glyph" />
                <span className="ts-orb-name">{tech.name}</span>
                <span className="ts-orb-cat">{tech.category}</span>
              </span>

              <span className="ts-orb-shine" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {/* Sling-ring burst flare */}
      <span className="ts-burst" ref={burstRef} aria-hidden="true" />

      {/* Dr. Strange portal - shared component; accent from the tech's color. */}
      <SlingRingPortal
        baseClass="ts-portal"
        cardClass="ts-portal-card"
        open={selected}
        accentColor={selectedTech ? selectedTech.accent : undefined}
        ariaLabel={selectedTech ? `${selectedTech.name} details` : 'Tech details'}
        onClose={closePortal}
        cardRef={portalCardRef}
        burstPosRef={burstPosRef}
        animateChildren
      >
        {selectedTech && (
          <>

              {/* Close */}
              <button type="button" className="ts-portal-close" onClick={closePortal} aria-label="Close portal">
                ESC <svg className="ts-portal-close-icon" viewBox="0 0 20 20" aria-hidden="true"><line x1="1" y1="1" x2="19" y2="19"/><line x1="1" y2="19" x2="19" y1="1"/></svg>
              </button>

              {/* Tech glyph + header */}
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
                  <div className="ts-portal-section-label">REAL-WORLD INVOLVEMENT</div>
                  <p className="ts-portal-involvement">{selectedTech.involvement}</p>
                </>
              )}

              {selectedTech.repos && selectedTech.repos.length > 0 && (
                <>
                  <div className="ts-portal-section-label">LINKED REPOSITORIES</div>
                  <div className="ts-portal-repos">
                    {selectedTech.repos.map((repo) => (
                      <a
                        key={repo}
                        className="ts-portal-repo-link"
                        href={`https://github.com/Jabs007/${repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {repo} <span aria-hidden="true" className="ts-repo-arrow">
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="15" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
</span>
                      </a>
                    ))}
                  </div>
                </>
              )}

              <div className="ts-portal-portal-type">
                <span className="ts-portal-section-label">PORTAL TYPE</span>
                <span className="ts-portal-type-badge">{selectedTech.portalType?.replace(/-/g, ' ')}</span>
              </div>
          </>
        )}
      </SlingRingPortal>
    </section>
  );
}
