import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  about,
  aboutCards,
  cv,
  education,
  experience,
  certifications,
  skills,
} from '../data/content.js';
import cvPdf from '../../cv/CV.pdf';
import { prefersReducedMotion } from '../utils/motion.js';
import CharacterGuide from './CharacterGuide';
import GitHubStats from './GitHubStats';
import useFocusTrap from '../hooks/useFocusTrap';
import SlingRingPortal from '../shared/SlingRingPortal';
import AmbientOrbs from '../shared/AmbientOrbs';
import './About.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Card id -> the entry list its portal renders (edit data/content.js to swap content).
const ENTRY_SETS = { education, experience, certifications };

// The CV sits in the same numbered index as the three credential portals.
const CV_ROW = { ...cv, id: 'cv' };
const INDEX_ROWS = [...aboutCards, CV_ROW];
const PORTAL_TABS = [...aboutCards, { id: 'cv', title: 'Curriculum Vitae', index: cv.index }];

// Static CV summary - drawn from the same content data the sections use, so
// the portal preview can never drift out of sync with the rest of the page.
const CV_SUMMARY = {
  education: education[0],
  experience: experience[0],
  certCount: certifications.length,
  issuers: [...new Set(certifications.map((c) => c.issuer))].join(' · '),
  stack: skills.slice(0, 10),
};

export default function About() {
  const sectionRef = useRef(null);
  const portalCardRef = useRef(null);
  const burstPosRef = useRef(null);

  const [selected, setSelected] = useState(null); // aboutCards id | 'cv' | null

  const closePortal = useCallback(() => setSelected(null), []);

  useFocusTrap(selected !== null, portalCardRef, closePortal);

  // Clicking an index row opens the portal from that row's position
  // (sling-ring style). The last burst position is kept so the closing ripple
  // originates from the same row.
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

  // ESC closes the portal.
  useEffect(() => {
    if (selected == null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const selectedCard =
    selected === 'cv' ? CV_ROW : aboutCards.find((c) => c.id === selected) || null;
  const selectedEntries = selected ? ENTRY_SETS[selected] : [];

  // Index rows rise as one wave the first time they enter the viewport.
  // Nothing else in the section animates on scroll - the rail and bio use the
  // site-wide data-reveal.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const rows = gsap.utils.toArray('.about-index-item');
      if (!rows.length) return;

      gsap.fromTo(
        rows,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: { trigger: '.about-index', start: 'top 88%', once: true },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      {/* Ambient orbs - drift + mouse parallax (shared component) */}
      <AmbientOrbs wrapClass="about-orbs" orbClass="about-orb" depths={[70, 44, 96]} />

      <div className="section-container">
        <div className="about-grid">
          {/* ── Rail: identity + facts ─────────────────────────────────── */}
          <aside className="about-rail">
            <h2 className="section-label" data-reveal="left">
              ABOUT
            </h2>
            <h3 className="about-heading" data-reveal="up" data-reveal-delay="0.08">
              {about.heading[0]}
              <br />
              <span className="about-accent">{about.heading[1]}</span>
            </h3>

            <dl className="about-meta" data-reveal="up" data-reveal-delay="0.2">
              {about.highlights.map((h) => (
                <div className="about-meta-row" key={h.label}>
                  <dt>{h.label}</dt>
                  <dd>{h.value}</dd>
                </div>
              ))}
            </dl>
          </aside>

          {/* ── Main: bio + numbered index ─────────────────────────────── */}
          <div className="about-main">
            <div className="about-bio">
              {/* Portrait inset beside the bio - keeps the rail short enough
                  to actually be sticky. */}
              <CharacterGuide
                src="/characters/character-about.png"
                alt="Adams Jabali coding on laptop"
                hint="Engineering Intelligent Systems"
                direction="left"
                triggerRef={sectionRef}
                size="sm"
                className="about-guide-inline"
              />

              {about.bio.map((para, i) => (
                <p
                  key={para}
                  className={`about-text${i === 0 ? ' about-text--lead' : ''}`}
                  data-reveal="up"
                  data-reveal-delay={String(0.12 + i * 0.08)}
                >
                  {para}
                </p>
              ))}
            </div>

            <ol className="about-index" aria-label="Credentials and CV">
              {INDEX_ROWS.map((row) => {
                const isCv = row.id === 'cv';
                return (
                  <li className="about-index-item" key={row.id}>
                    <button
                      type="button"
                      className={`about-row ${selected === row.id ? 'about-row--active' : ''}`}
                      onClick={(e) => handleSelect(row.id, e)}
                      aria-expanded={selected === row.id}
                      aria-label={`${row.title}: ${row.summary} ${
                        isCv ? 'Open the CV preview.' : 'Open the portal.'
                      }`}
                    >
                      <span className="about-row-index" aria-hidden="true">
                        {row.index}
                      </span>
                      <span className="about-row-body">
                        <span className="about-row-title">{row.title}</span>
                        <span className="about-row-summary">{row.summary}</span>
                      </span>
                      <span className="about-row-action" aria-hidden="true">
                        {isCv ? 'Preview' : 'Open'}
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <line x1="3" y1="10" x2="16" y2="10" />
                          <polyline points="11 5 16 10 11 15" />
                        </svg>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <p className="about-index-foot">
              <span className="about-index-foot-label">Prefer the document?</span>
              <a className="about-index-download" href={cvPdf} download={cv.downloadName}>
                Download CV <span aria-hidden="true">↓</span>
              </a>
            </p>

            {/* Live GitHub ledger */}
            <GitHubStats />
          </div>
        </div>
      </div>

      {/* Dr. Strange portal - shared component; accent comes from the row's color. */}
      <SlingRingPortal
        baseClass="about-portal"
        cardClass={`about-portal-card ${selected === 'cv' ? 'about-portal-card--cv' : ''}`}
        open={selected}
        ariaLabel={selectedCard ? `${selectedCard.title} details` : 'About details'}
        onClose={closePortal}
        cardRef={portalCardRef}
        burstPosRef={burstPosRef}
        animateChildren
      >
        {selectedCard && (
          <>
            {/* In-portal navigation between credentials */}
            <div className="about-portal-nav">
              <div className="about-portal-tabs">
                {PORTAL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`about-portal-tab-btn ${
                      selected === tab.id ? 'about-portal-tab-btn--active' : ''
                    }`}
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
              <span className="about-portal-kicker">
                CREDENTIALS &amp; QUALIFICATIONS · {selectedCard.index}
              </span>
              <h3 className="about-portal-title">{selectedCard.title}</h3>
            </div>

            {selected === 'cv' ? (
              <div className="cv-summary">
                <div className="cv-summary-grid">
                  <div className="cv-summary-block">
                    <span className="cv-summary-label">EDUCATION</span>
                    <span className="cv-summary-value">{CV_SUMMARY.education.degree}</span>
                    <span className="cv-summary-sub">{CV_SUMMARY.education.institution}</span>
                    <span className="cv-summary-sub">{CV_SUMMARY.education.period}</span>
                  </div>

                  <div className="cv-summary-block">
                    <span className="cv-summary-label">CURRENT ROLE</span>
                    <span className="cv-summary-value">{CV_SUMMARY.experience.role}</span>
                    <span className="cv-summary-sub">{CV_SUMMARY.experience.company}</span>
                    <span className="cv-summary-sub">{CV_SUMMARY.experience.period}</span>
                  </div>

                  <div className="cv-summary-block">
                    <span className="cv-summary-label">CERTIFICATIONS</span>
                    <span className="cv-summary-value">{CV_SUMMARY.certCount} credentials</span>
                    <span className="cv-summary-sub">{CV_SUMMARY.issuers}</span>
                  </div>

                  <div className="cv-summary-block cv-summary-block--wide">
                    <span className="cv-summary-label">CORE STACK</span>
                    <div className="cv-summary-tags">
                      {CV_SUMMARY.stack.map((tech) => (
                        <span className="cv-summary-tag" key={tech}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="cv-summary-note">
                  The PDF carries the full detail: every role, project and certification.
                </p>

                <div className="cv-actions">
                  <a className="cv-action cv-action--primary" href={cvPdf} download={cv.downloadName}>
                    Download PDF <span aria-hidden="true">↓</span>
                  </a>
                  <a className="cv-action" href={cvPdf} target="_blank" rel="noreferrer">
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
                <span className="about-portal-note">Verified academic &amp; professional credentials</span>
              </>
            )}
          </>
        )}
      </SlingRingPortal>
    </section>
  );
}
