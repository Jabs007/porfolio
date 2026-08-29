import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { about, aboutCards, cv, education, experience, certifications } from '../data/content.js';
import cvPdf from '../../cv/CV.pdf';
import { prefersReducedMotion } from '../utils/motion.js';
import CharacterGuide from './CharacterGuide';
import GitHubStats from './GitHubStats';
import useFocusTrap from '../hooks/useFocusTrap';
import './About.css';

gsap.registerPlugin(useGSAP);

// Card id -> the entry list its portal renders (edit data/content.js to swap content).
const ENTRY_SETS = { education, experience, certifications };

export default function About() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const orbsRef = useRef(null);
  const portalRef = useRef(null);
  const portalCardRef = useRef(null);
  const burstRef = useRef(null);
  const burstPosRef = useRef(null);

  const [selected, setSelected] = useState(null); // aboutCards id or null

  const closePortal = useCallback(() => setSelected(null), []);

  useFocusTrap(selected !== null, portalCardRef, closePortal);

  // Clicking a card opens the portal from the card's position (sling-ring style).
  // The last burst position is kept so the closing ripple can originate from
  // the same card.
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

  // ESC closes the portal.
  useEffect(() => {
    if (selected == null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  // The CV banner card isn't part of the ENTRY_SETS list - it gets its own
  // portal view (embedded PDF) instead of an entry list.
  const selectedCard =
    selected === 'cv' ? { ...cv, id: 'cv' } : aboutCards.find((c) => c.id === selected) || null;
  const selectedEntries = selected ? ENTRY_SETS[selected] : [];

  // Dr. Strange sling-ring portal - opens on card click with a burst at the card.
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

        // Kicker slides in, list items stagger up, PDF frame fades in.
        const kicker = card.querySelector('.about-portal-kicker');
        if (kicker) {
          gsap.fromTo(
            kicker,
            { x: -10, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.4,
              delay: hasReduced ? 0 : 0.2,
              ease: 'power2.out',
              overwrite: 'auto',
            }
          );
        }
        const items = gsap.utils.toArray('.about-portal-item', card);
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
              stagger: 0.07,
              overwrite: 'auto',
            }
          );
        }
        const frame = card.querySelector('.cv-frame');
        if (frame) {
          gsap.fromTo(
            frame,
            { y: 14, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.45,
              delay: hasReduced ? 0 : 0.25,
              ease: 'power3.out',
              overwrite: 'auto',
            }
          );
        }
        const shimmer = card.querySelector('.about-portal-shimmer');
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

  // Card grid: 3D staggered entrance, then cursor tilt + magnet + spotlight.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const grid = gridRef.current;
      if (!grid) return;

      const cards = gsap.utils.toArray('.about-card, .about-cv-card', grid);
      const entryTargets = gsap.utils.toArray(
        '.about-card, .about-cv-card, .about-cv-download',
        grid
      );
      const indexes = gsap.utils.toArray('.about-card-index, .about-cv-index', grid);
      if (!entryTargets.length) return;

      let live = false;

      // --- Entrance choreography: cards unfold in from above with a spring ---
      const entrance = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
        onComplete: () => {
          live = true;
        },
        onReverseComplete: () => {
          live = false;
        },
      });
      entrance.fromTo(
        entryTargets,
        { y: 90, rotationX: -16, opacity: 0, transformOrigin: '50% 0%' },
        {
          y: 0,
          rotationX: 0,
          opacity: 1,
          duration: 0.95,
          ease: 'back.out(1.2)',
          stagger: 0.11,
        }
      );
      if (indexes.length) {
        entrance.fromTo(
          indexes,
          { x: -14, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.8)', stagger: 0.1 },
          0.35
        );
      }

      // --- Tilt + magnet + cursor spotlight (active after the entrance) ---
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
          if (!live) return;
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          tiltY(px * 10);
          tiltX(py * -10);
          moveX(px * 14);
          moveY(py * 14 - 4); // slight lift while hovering
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

  // Ambient orbs - each drifts on its own, and the whole set parallaxes with the mouse.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      if (!orbsRef.current) return;

      const killDrifts = gsap.utils.toArray('.about-orb-core', orbsRef.current).map((orb, i) => {
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

      const wraps = gsap.utils.toArray('.about-orb', orbsRef.current);
      const depths = [70, 44, 96];
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

  // Status dots in the highlights pulse with a random stagger.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const dots = gsap.utils.toArray('.highlight-dot', sectionRef.current);
      if (!dots.length) return;
      const tween = gsap.to(dots, {
        scale: 1.5,
        opacity: 0.55,
        duration: () => gsap.utils.random(0.9, 1.6),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.35, from: 'random' },
        delay: 0.8,
      });
      return () => tween.kill();
    },
    { scope: sectionRef }
  );

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      {/* Ambient orbs - drift + mouse parallax (GSAP) */}
      <div className="about-orbs" ref={orbsRef} aria-hidden="true">
        <span className="about-orb about-orb--1"><span className="about-orb-core" /></span>
        <span className="about-orb about-orb--2"><span className="about-orb-core" /></span>
        <span className="about-orb about-orb--3"><span className="about-orb-core" /></span>
      </div>

      <div className="section-container">
        <div className="about-grid">
          <div className="about-left">
            <h2 className="section-label" data-reveal="left">
              ABOUT
            </h2>
            <h3 className="about-heading" data-reveal="up" data-reveal-delay="0.1">
              {about.heading[0]}
              <br />
              <span className="about-accent">{about.heading[1]}</span>
            </h3>
            <CharacterGuide
              src="/characters/character-about.png"
              alt="Adams Jabali coding on laptop"
              hint="Engineering Intelligent Systems"
              direction="left"
              triggerRef={sectionRef}
              size="md"
              className="about-guide-embed"
            />
          </div>
          <div className="about-right">
            {about.bio.map((para, i) => (
              <p
                key={para}
                className="about-text"
                data-reveal="up"
                data-reveal-delay={String(0.15 + i * 0.1)}
              >
                {para}
              </p>
            ))}
            <div className="about-highlights" data-reveal="up" data-reveal-delay="0.45">
              {about.highlights.map((h) => (
                <div className="highlight-item" key={h.label}>
                  <div className="highlight-top">
                    <span className="highlight-dot" aria-hidden="true" />
                    <span className="highlight-label">{h.label}</span>
                  </div>
                  <span className="highlight-value">{h.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portal cards - Education / Experience / Certifications + CV banner.
            Entrance + tilt are GSAP-driven (see the grid useGSAP above). */}
        <div className="about-cards-block" ref={gridRef}>
          <div className="about-cards">
            {aboutCards.map((card) => (
              <button
                key={card.id}
                type="button"
                className={`about-card ${selected === card.id ? 'about-card--selected' : ''}`}
                style={{ '--card-accent': card.accent }}
                onClick={(e) => handleSelect(card.id, e)}
                aria-expanded={selected === card.id}
                aria-label={`${card.title}, ${card.summary}. Click to open the portal.`}
              >
                <span className="about-card-index">{card.index}</span>
                <span className="about-card-title">{card.title}</span>
                <p className="about-card-summary">{card.summary}</p>
                <span className="about-card-hint">
                  Open portal <span aria-hidden="true">→</span>
                </span>
              </button>
            ))}
          </div>

          {/* CV / Resume - wide banner with a one-click download, plus the
              same sling-ring portal (embedded PDF viewer) on click */}
          <div className="about-cv-row">
            <button
              type="button"
              className={`about-cv-card ${selected === 'cv' ? 'about-cv-card--selected' : ''}`}
              style={{ '--card-accent': cv.accent }}
              onClick={(e) => handleSelect('cv', e)}
              aria-expanded={selected === 'cv'}
              aria-label={`${cv.title}, ${cv.summary} Click to open the portal.`}
            >
              <span className="about-cv-index">{cv.index}</span>
              <span className="about-cv-body">
                <span className="about-cv-title">{cv.title}</span>
                <span className="about-cv-summary">{cv.summary}</span>
              </span>
              <span className="about-cv-hint">
                Open portal <span aria-hidden="true">→</span>
              </span>
            </button>
            <a className="about-cv-download" href={cvPdf} download={cv.downloadName}>
              <span aria-hidden="true">↓</span> Download PDF
            </a>
          </div>
        </div>

        {/* Live GitHub stats and language distribution */}
        <GitHubStats />
      </div>

      {/* Dr. Strange portal - opens when a card is clicked */}
      <div
        className="about-portal"
        ref={portalRef}
        role="dialog"
        aria-modal="true"
        aria-label={selectedCard ? `${selectedCard.title} details` : 'About details'}
        style={selectedCard ? { '--portal-accent': selectedCard.accent } : undefined}
      >
        <div className="about-portal-backdrop" onClick={closePortal} aria-hidden="true" />
        <span className="about-portal-burst" ref={burstRef} aria-hidden="true" />
        <div className="about-portal-rig">
          <span className="about-portal-fire" aria-hidden="true" />
          <svg
            className="about-portal-arcs"
            viewBox="0 0 100 100"
            aria-hidden="true"
            focusable="false"
          >
            <circle
              className="about-portal-arc about-portal-arc--1"
              cx="50"
              cy="50"
              r="48"
              pathLength={1}
            />
            <circle
              className="about-portal-arc about-portal-arc--2"
              cx="50"
              cy="50"
              r="43"
              pathLength={1}
            />
            <circle
              className="about-portal-arc about-portal-arc--3"
              cx="50"
              cy="50"
              r="38"
              pathLength={1}
            />
          </svg>
          <span className="about-portal-ring about-portal-ring--outer" aria-hidden="true" />
          <span className="about-portal-ring about-portal-ring--inner" aria-hidden="true" />
          {selectedCard && (
            <div
              className={`about-portal-card ${
                selected === 'cv' ? 'about-portal-card--cv' : ''
              }`}
              ref={portalCardRef}
            >
              <span className="about-portal-shimmer" aria-hidden="true" />
              
              {/* In-Portal Category Navigation Tabs */}
              <div className="about-portal-nav">
                <div className="about-portal-tabs">
                  {[...aboutCards, { id: 'cv', title: 'Curriculum Vitae', index: '04', accent: '#6ee7b7' }].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`about-portal-tab-btn ${selected === tab.id ? 'about-portal-tab-btn--active' : ''}`}
                      onClick={() => setSelected(tab.id)}
                    >
                      {tab.title}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="about-portal-close-pill"
                  onClick={closePortal}
                  aria-label="Close portal"
                >
                  ESC <span aria-hidden="true">✕</span>
                </button>
              </div>

              <div className="about-portal-header">
                <span className="about-portal-kicker" style={{ color: selectedCard.accent }}>
                  CREDENTIALS &amp; QUALIFICATIONS · {selectedCard.index}
                </span>
                <h3 className="about-portal-title">{selectedCard.title}</h3>
              </div>

              {selected === 'cv' ? (
                <div className="cv-viewer">
                  <iframe
                    className="cv-frame"
                    src={cvPdf}
                    title="Adams Jabali, Curriculum Vitae"
                    loading="lazy"
                  />
                  <div className="cv-actions">
                    <a
                      className="cv-action cv-action--primary"
                      href={cvPdf}
                      download={cv.downloadName}
                    >
                      Download PDF <span aria-hidden="true">↓</span>
                    </a>
                    <a
                      className="cv-action"
                      href={cvPdf}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in New Tab <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <ul className="about-portal-list">
                    {selectedEntries.map((item) => (
                      <li key={item.id ?? item.name} className="about-portal-item">
                        <div className="about-portal-item-top">
                          <span className="about-portal-item-main">
                            {item[selectedCard.fields[0]]}
                          </span>
                          {item.period && (
                            <span className="about-portal-item-badge">{item.period}</span>
                          )}
                        </div>
                        {item.details?.length > 0 && (
                          <span className="about-portal-item-detail">{item.details[0]}</span>
                        )}
                        <span className="about-portal-item-sub">
                          {selectedCard.fields
                            .slice(1)
                            .map((f) => item[f])
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <span className="about-portal-note">
                    Verified Academic &amp; Professional Credentials
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
