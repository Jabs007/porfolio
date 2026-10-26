import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { about, aboutCards, cv, education, experience, certifications } from '../data/content.js';
import cvPdf from '../../cv/CV.pdf';
import { prefersReducedMotion } from '../utils/motion.js';
import CharacterGuide from './CharacterGuide';
import GitHubStats from './GitHubStats';
import useFocusTrap from '../hooks/useFocusTrap';
import SlingRingPortal from '../shared/SlingRingPortal';
import AmbientOrbs from '../shared/AmbientOrbs';
import useTiltMagnet from '../shared/useTiltMagnet';
import './About.css';

gsap.registerPlugin(useGSAP);

// Card id -> the entry list its portal renders (edit data/content.js to swap content).
const ENTRY_SETS = { education, experience, certifications };

export default function About() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const portalCardRef = useRef(null);
  const burstPosRef = useRef(null);
  const tiltGateRef = useRef(false);

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

  // Dr. Strange sling-ring portal open/close animation is owned by the
  // shared SlingRingPortal component (rendered below).

  // Card grid: 3D staggered entrance. The cursor tilt/magnet/spotlight that
  // used to live here is now the shared useTiltMagnet hook below, gated
  // until the entrance has played so the two don't fight over transforms.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const grid = gridRef.current;
      if (!grid) return;

      const entryTargets = gsap.utils.toArray(
        '.about-card, .about-cv-card, .about-cv-download',
        grid
      );
      const indexes = gsap.utils.toArray('.about-card-index, .about-cv-index', grid);
      if (!entryTargets.length) return;

      // --- Entrance choreography: cards unfold in from above with a spring ---
      const entrance = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
        onComplete: () => {
          tiltGateRef.current = true;
        },
        onReverseComplete: () => {
          tiltGateRef.current = false;
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
    },
    { scope: gridRef }
  );

  // Cursor tilt + magnet + spotlight on cards (shared hook).
  useTiltMagnet(gridRef, '.about-card, .about-cv-card', {
    tilt: 10,
    magnet: 14,
    lift: 4,
    liveRef: tiltGateRef,
  });

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
      {/* Ambient orbs - drift + mouse parallax (shared component) */}
      <AmbientOrbs wrapClass="about-orbs" orbClass="about-orb" depths={[70, 44, 96]} />

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

      {/* Dr. Strange portal - shared component; accent comes from the card's color. */}
      <SlingRingPortal
        baseClass="about-portal"
        cardClass={`about-portal-card ${selected === 'cv' ? 'about-portal-card--cv' : ''}`}
        open={selected}
        accentColor={selectedCard ? selectedCard.accent : undefined}
        ariaLabel={selectedCard ? `${selectedCard.title} details` : 'About details'}
        onClose={closePortal}
        cardRef={portalCardRef}
        burstPosRef={burstPosRef}
        animateChildren
      >
        {selectedCard && (
          <>
              
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
          </>
        )}
      </SlingRingPortal>
    </section>
  );
}
