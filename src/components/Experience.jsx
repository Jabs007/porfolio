import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { experience, education } from '../data/content';
import './Experience.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const degree = education[0];

export default function Experience() {
  const rootRef = useRef(null);
  const lineRef = useRef(null);

  useGSAP(
    () => {
      if (!lineRef.current) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // PROJECTS -> EXPERIENCE: a horizontal rule draws in first...
      const into = rootRef.current?.querySelector('.timeline-into');
      if (into && !reduceMotion) {
        gsap.fromTo(
          into,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top 88%',
              end: 'top 62%',
              scrub: 0.5,
            },
          }
        );
      }

      // ...then the vertical timeline line draws itself as the user scrolls.
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 75%',
            end: 'bottom 70%',
            scrub: 0.6,
          },
        }
      );

      if (reduceMotion) return;

      // Entries reveal one by one (via data-reveal on .timeline-item) and
      // become slightly muted once passed. The mute targets .timeline-content
      // (a child) so the two tweens never fight over the same element.
      const contents = gsap.utils.toArray('.timeline-content', rootRef.current);
      contents.forEach((content) => {
        gsap.fromTo(
          content,
          { opacity: 1 },
          {
            opacity: 0.42,
            ease: 'none',
            scrollTrigger: {
              trigger: content,
              start: 'top 42%',
              end: 'top 12%',
              scrub: 0.5,
            },
          }
        );
      });

      // EXPERIENCE -> CONTACT: the whole timeline gradually fades back.
      gsap.to('.timeline', {
        opacity: 0.28,
        filter: 'blur(3px)',
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'bottom 72%',
          end: 'bottom 18%',
          scrub: 0.6,
        },
      });
    },
    { scope: rootRef }
  );

  return (
    <section id="experience" className="experience-section" ref={rootRef}>
      <div className="section-container">
        <div className="experience-head" data-reveal="up">
          <span className="section-label" data-reveal="left">CAREER &amp; IMPACT</span>
          <h2 className="experience-heading" data-reveal="up" data-reveal-delay="0.1">
            EXPERIENCE &amp; <span className="experience-accent">BACKGROUND</span>
          </h2>
        </div>
        {/* PROJECTS -> EXPERIENCE: a horizontal rule draws in, then the
            vertical timeline grows from it (see the choreography below). */}
        <div className="timeline-into" aria-hidden="true" />
        <div className="timeline">
          <div className="timeline-line" ref={lineRef} />

          {experience.map((item, index) => (
            <div
              className="timeline-item"
              key={item.id}
              data-reveal="up"
              data-reveal-delay={String(index * 0.12)}
            >
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-header">
                  <h3>{item.role}</h3>
                  <span className="timeline-period">{item.period}</span>
                </div>
                <p className="timeline-company">
                  {item.company} · {item.location}
                </p>
                <ul className="timeline-details">
                  {item.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <div
            className="timeline-item"
            data-reveal="up"
            data-reveal-delay={String(experience.length * 0.12)}
          >
            <div className="timeline-dot timeline-dot--education" />
            <div className="timeline-content">
              <div className="timeline-header">
                <h3>{degree.degree}</h3>
                <span className="timeline-period">{degree.period}</span>
              </div>
              <p className="timeline-company">
                {degree.institution} · {degree.location}
              </p>
            </div>
          </div>
        </div>
      </div>
    {/* Ambient orbs - drift + mouse parallax (GSAP) */}
      <div className="experience-orbs" aria-hidden="true">
        <span className="experience-orb experience-orb--1"><span className="experience-orb-core" /></span>
        <span className="experience-orb experience-orb--2"><span className="experience-orb-core" /></span>
        <span className="experience-orb experience-orb--3"><span className="experience-orb-core" /></span>
      </div>

    </section>
  );
}
