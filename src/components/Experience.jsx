import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { experience, education } from '../data/content';
import { prefersReducedMotion } from '../utils/motion.js';
import './Experience.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const degree = education[0];

export default function Experience() {
  const rootRef = useRef(null);

  // The ledger reads top to bottom; entries rise once as they enter. Nothing
  // dims, blurs or un-draws as you scroll past it.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const entries = gsap.utils.toArray('.xp-entry', rootRef.current);
      if (!entries.length) return;

      gsap.fromTo(
        entries,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: '.xp-record', start: 'top 86%', once: true },
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <section id="experience" className="xp-section" ref={rootRef}>
      <div className="section-container">
        <header className="xp-head">
          <span className="section-label" data-reveal="left">
            CAREER &amp; IMPACT
          </span>
          <h2 className="xp-title" data-reveal="up" data-reveal-delay="0.08">
            EXPERIENCE &amp; <span className="xp-accent">BACKGROUND</span>
          </h2>
        </header>

        <ol className="xp-record">
          {experience.map((item) => (
            <li className="xp-entry" key={item.id}>
              <div className="xp-when">
                <span className="xp-period">{item.period}</span>
                <span className="xp-loc">{item.location}</span>
              </div>

              <div className="xp-main">
                <h3 className="xp-role">{item.role}</h3>
                <p className="xp-org">{item.company}</p>
                <ul className="xp-list">
                  {item.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}

          <li className="xp-entry xp-entry--education">
            <div className="xp-when">
              <span className="xp-period">{degree.period}</span>
              <span className="xp-loc">{degree.location}</span>
            </div>

            <div className="xp-main">
              <span className="xp-tag">EDUCATION</span>
              <h3 className="xp-role">{degree.degree}</h3>
              <p className="xp-org">{degree.institution}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
