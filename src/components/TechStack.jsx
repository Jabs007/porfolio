import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { hero } from '../data/content';
import { prefersReducedMotion } from '../utils/motion.js';
import useFocusTrap from '../hooks/useFocusTrap';
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
  const orbsRef = useRef(null);
  const portalRef = useRef(null);
  const portalCardRef = useRef(null);
  const burstRef = useRef(null);
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

  // Portal open / close: mirrors Projects.jsx exactly
  useGSAP(
    () => {
      const portal = portalRef.current;
      if (!portal) return;
      const hasReduced = prefersReducedMotion();

      if (selected === null) {
        const burst = burstRef.current;
        const pos = burstPosRef.current;
        if (burst && pos && !hasReduced) {
          gsap.set(burst, { x: pos.x, y: pos.y, scale: 0.35, opacity: 0.9 });
          gsap.to(burst, { scale: 1.6, opacity: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
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

      const burst = burstRef.current;
      const pos = burstPosRef.current;
      if (burst && pos) {
        gsap.set(burst, { x: pos.x, y: pos.y, scale: 0.3, opacity: 1 });
        gsap.to(burst, { scale: 1.7, opacity: 0, duration: hasReduced ? 0.1 : 0.7, ease: 'power2.out', overwrite: 'auto' });
      }

      gsap.fromTo(
        portal,
        { scale: 0.3, rotation: hasReduced ? 0 : -5, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: hasReduced ? 0.2 : 0.55, ease: 'back.out(1.6)', overwrite: 'auto' }
      );

      const card = portalCardRef.current;
      if (card) {
        gsap.fromTo(card, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: hasReduced ? 0.15 : 0.4, delay: hasReduced ? 0 : 0.12, ease: 'power3.out', overwrite: 'auto' });
        const items = gsap.utils.toArray('.ts-portal-card > :not(.ts-portal-shimmer):not(.ts-portal-close)', card);
        if (items.length) {
          gsap.fromTo(items, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, delay: hasReduced ? 0 : 0.28, ease: 'power3.out', stagger: 0.055, overwrite: 'auto' });
        }
        const shimmer = card.querySelector('.ts-portal-shimmer');
        if (shimmer && !hasReduced) {
          gsap.fromTo(shimmer, { xPercent: -140 }, { xPercent: 140, duration: 1.1, delay: 0.28, ease: 'power2.inOut', overwrite: 'auto' });
        }
      }
    },
    { scope: sectionRef, dependencies: [selected] }
  );

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

  // 3D tilt + spotlight on each orb
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const grid = gridRef.current;
      if (!grid) return;
      const orbs = gsap.utils.toArray('.ts-orb', grid);
      const cleanups = orbs.map((orb) => {
        const tX = gsap.quickTo(orb, 'rotationX', { duration: 0.55, ease: 'power3.out' });
        const tY = gsap.quickTo(orb, 'rotationY', { duration: 0.55, ease: 'power3.out' });
        const spot = { x: 0, y: 0 };
        const sX = gsap.quickTo(spot, 'x', { duration: 0.4, ease: 'power3.out', onUpdate: () => orb.style.setProperty('--spot-x', `${spot.x}px`) });
        const sY = gsap.quickTo(spot, 'y', { duration: 0.4, ease: 'power3.out', onUpdate: () => orb.style.setProperty('--spot-y', `${spot.y}px`) });

        const onMove = (e) => {
          const r = orb.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          tY(px * 14);
          tX(py * -14);
          sX(e.clientX - r.left);
          sY(e.clientY - r.top);
        };
        const onLeave = () => { tX(0); tY(0); };
        orb.addEventListener('mousemove', onMove);
        orb.addEventListener('mouseleave', onLeave);
        return () => { orb.removeEventListener('mousemove', onMove); orb.removeEventListener('mouseleave', onLeave); };
      });
      return () => cleanups.forEach((c) => c());
    },
    { scope: gridRef, dependencies: [filteredTech.length] }
  );

  // Ambient sigil rotation + mouse parallax on background orbs
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      if (orbsRef.current) {
        const killDrifts = gsap.utils.toArray('.ts-bg-orb-core', orbsRef.current).map((orb, i) => {
          const tw = gsap.to(orb, { x: gsap.utils.random(-38, 38), y: gsap.utils.random(-24, 24), scale: gsap.utils.random(0.88, 1.12), duration: gsap.utils.random(7, 11), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.6 });
          return () => tw.kill();
        });
        const wraps = gsap.utils.toArray('.ts-bg-orb', orbsRef.current);
        const depths = [72, 48, 96];
        const parallax = wraps.map((w, i) => ({ xTo: gsap.quickTo(w, 'x', { duration: 1.4, ease: 'power2.out' }), yTo: gsap.quickTo(w, 'y', { duration: 1.4, ease: 'power2.out' }), depth: depths[i % depths.length] }));
        const section = sectionRef.current;
        const onMouse = (e) => {
          const r = section.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          parallax.forEach((p) => { p.xTo(nx * p.depth); p.yTo(ny * p.depth); });
        };
        section.addEventListener('mousemove', onMouse);
        return () => { killDrifts.forEach((k) => k()); section.removeEventListener('mousemove', onMouse); };
      }
    },
    { scope: sectionRef }
  );

  return (
    <section id="techstack" className="ts-section" ref={sectionRef}>
      {/* Background ambient orbs */}
      <div className="ts-bg-orbs" ref={orbsRef} aria-hidden="true">
        <span className="ts-bg-orb ts-bg-orb--1"><span className="ts-bg-orb-core" /></span>
        <span className="ts-bg-orb ts-bg-orb--2"><span className="ts-bg-orb-core" /></span>
        <span className="ts-bg-orb ts-bg-orb--3"><span className="ts-bg-orb-core" /></span>
      </div>

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

      {/* Dr. Strange portal - opens on orb click */}
      <div
        className="ts-portal"
        ref={portalRef}
        role="dialog"
        aria-modal="true"
        aria-label={selectedTech ? `${selectedTech.name} details` : 'Tech details'}
        style={selectedTech ? { '--portal-accent': selectedTech.accent } : undefined}
      >
        <div className="ts-portal-backdrop" onClick={closePortal} aria-hidden="true" />

        <div className="ts-portal-rig">
          {/* Conic-gradient fire */}
          <span className="ts-portal-fire" aria-hidden="true" />

          {/* Spinning SVG arcs */}
          <svg className="ts-portal-arcs" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <circle className="ts-portal-arc ts-portal-arc--1" cx="50" cy="50" r="48" pathLength={1} />
            <circle className="ts-portal-arc ts-portal-arc--2" cx="50" cy="50" r="43" pathLength={1} />
            <circle className="ts-portal-arc ts-portal-arc--3" cx="50" cy="50" r="38" pathLength={1} />
          </svg>

          <span className="ts-portal-ring ts-portal-ring--outer" aria-hidden="true" />
          <span className="ts-portal-ring ts-portal-ring--inner" aria-hidden="true" />

          {selectedTech && (
            <div className="ts-portal-card" ref={portalCardRef}>
              <span className="ts-portal-shimmer" aria-hidden="true" />

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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
