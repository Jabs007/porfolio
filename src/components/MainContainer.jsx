import { lazy, Suspense, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { hero } from '../data/content.js';
import './MainContainer.css';

// Lazy-load the 3D hero so three.js/@react-three (~890 kB) is only fetched
// when actually rendered, instead of bloating the initial bundle.
const HeroThree = lazy(() => import('./HeroThree'));

gsap.registerPlugin(ScrollTrigger, useGSAP);

const { title, tagline, availability } = hero;

export default function MainContainer() {
  const mainRef = useRef(null);
  const titleRef = useRef(null);
  const aboutRef = useRef(null);
  const cardRef = useRef(null);
  const ctaRef = useRef(null);

  // Entrance animations and scroll-driven parallax
  useGSAP(
    (context, contextSafe) => {
      contextSafe(initAnimations)();
    },
    { scope: mainRef }
  );

  // Emil Kowalski §12 magnetic spring physics on CTA buttons
  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;
      const row = ctaRef.current;
      if (!row) return;

      const buttons = gsap.utils.toArray('.hero-cta .btn', row).map((btn) => ({
        btn,
        xTo: gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' }),
        yTo: gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' }),
      }));
      if (!buttons.length) return;

      const onMove = (e) => {
        const rect = row.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        buttons.forEach(({ xTo, yTo }) => {
          xTo(px * 12);
          yTo(py * 12);
        });
      };
      const onLeave = () => {
        buttons.forEach(({ xTo, yTo }) => {
          xTo(0);
          yTo(0);
        });
      };

      row.addEventListener('mousemove', onMove);
      row.addEventListener('mouseleave', onLeave);
      return () => {
        row.removeEventListener('mousemove', onMove);
        row.removeEventListener('mouseleave', onLeave);
      };
    },
    { scope: mainRef }
  );

  // Kinetic cursor-tracked metallic bronze shimmer on title
  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;
      const titleEl = titleRef.current;
      if (!titleEl) return;

      const lines = titleEl.querySelectorAll('.title-line');

      const onTitleMove = (e) => {
        const rect = titleEl.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;

        lines.forEach((line) => {
          line.style.setProperty('--sheen-x', `${px}%`);
          line.style.setProperty('--sheen-y', `${py}%`);
        });
      };

      titleEl.addEventListener('mousemove', onTitleMove);
      return () => {
        titleEl.removeEventListener('mousemove', onTitleMove);
      };
    },
    { scope: mainRef }
  );

  const initAnimations = () => {
    const tl = gsap.timeline();

    tl.fromTo(
      '.hero-badge',
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );

    tl.fromTo(
      '.split-h2 span',
      { y: '160%', rotation: 4 },
      {
        y: '0%',
        rotation: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: 'power4.out',
      },
      '-=0.35'
    );

    tl.fromTo(
      '.hero-para',
      { opacity: 0, y: 24 },
      { opacity: 0.85, y: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.5'
    );

    tl.fromTo(
      '.hero-cta .btn',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
      '-=0.4'
    );

    tl.fromTo(
      '.hero-visual',
      { opacity: 0, scale: 0.94 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' },
      '-=0.6'
    );

    tl.fromTo(
      '.scroll-cue',
      { opacity: 0 },
      { opacity: 0.7, duration: 0.8, ease: 'power2.out' },
      '-=0.4'
    );

    // Clean exit parallax on scroll (no blur)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && mainRef.current) {
      gsap.to('.hero-text', {
        y: -40,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: mainRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });

      gsap.to('.hero-visual', {
        y: -30,
        scale: 0.95,
        ease: 'none',
        scrollTrigger: {
          trigger: mainRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    }
  };

  return (
    <section id="hero" ref={mainRef} className="main-body">
      <div className="container-main">
        <div className="container1">
          <div className="hero-grid">
            <div className="hero-text">
              <span className="hero-badge">
                <span className="hero-badge-dot" aria-hidden="true" />
                {availability}
              </span>

              <h1 className="title-split" ref={titleRef}>
                {title.map((line, idx) => (
                  <div className="split-h2" key={line}>
                    <span className={`title-line ${idx === title.length - 1 ? 'title-line-accent' : ''}`}>
                      {line}
                    </span>
                  </div>
                ))}
              </h1>

              <div className="hero-content" ref={aboutRef}>
                <p className="para hero-para">{tagline}</p>
                <div className="hero-cta" ref={ctaRef}>
                  <a href="#projects" className="btn btn-primary">
                    View Projects
                  </a>
                  <a href="#contact" className="btn btn-ghost">
                    Get in Touch
                  </a>
                </div>
              </div>
            </div>

            <div ref={cardRef} className="hero-visual">
              <Suspense fallback={null}>
                <HeroThree wrapperRef={cardRef} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <a href="#about" className="scroll-cue" aria-label="Scroll down to see more">
        <span className="scroll-cue-mouse" aria-hidden="true">
          <span className="scroll-cue-dot" />
        </span>
        <span className="scroll-cue-text">SCROLL</span>
      </a>
    </section>
  );
}
