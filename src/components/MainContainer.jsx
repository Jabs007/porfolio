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

const { title, tagline, availability, character3d } = hero;

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

      // Press feedback lives here too: CSS :active can't scale the buttons
      // because quickTo writes transform inline, so GSAP owns the press.
      // Overwrite 'auto' only kills conflicting (scale) tweens, not the
      // magnetic x/y quickTos.
      const onDown = (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;
        gsap.to(btn, { scale: 0.94, duration: 0.12, ease: 'power2.out', overwrite: 'auto' });
      };
      const onUp = () => {
        row.querySelectorAll('.btn').forEach((btn) => {
          gsap.to(btn, { scale: 1, duration: 0.25, ease: 'back.out(2.5)', overwrite: 'auto' });
        });
      };

      row.addEventListener('mousemove', onMove);
      row.addEventListener('mouseleave', onLeave);
      row.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      return () => {
        row.removeEventListener('mousemove', onMove);
        row.removeEventListener('mouseleave', onLeave);
        row.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
      };
    },
    { scope: mainRef }
  );

  const initAnimations = () => {
    // Reduced-motion: elements are hidden in their pre-entrance state, so pin
    // them to their resting values and skip the whole timeline.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      gsap.set('.split-h2 span', { y: '0%', rotation: 0 });
      gsap.set('.hero-para', { opacity: 0.85, y: 0 });
      gsap.set('.hero-visual', { opacity: 1, scale: 1 });
      return;
    }

    // One coordinated beat (~1.3s total): the headline mask-slide is the
    // signature move; badge/para/CTAs/visual ride the same pass instead of
    // three separately-staggered rituals.
    const tl = gsap.timeline();

    tl.fromTo(
      '.hero-badge',
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
    );

    tl.fromTo(
      '.split-h2 span',
      { y: '160%', rotation: 4 },
      {
        y: '0%',
        rotation: 0,
        duration: 0.85,
        stagger: 0.07,
        ease: 'power4.out',
      },
      0.15
    );

    tl.fromTo(
      '.hero-para',
      { opacity: 0, y: 18 },
      { opacity: 0.85, y: 0, duration: 0.5, ease: 'power3.out' },
      0.5
    );

    tl.fromTo(
      '.hero-cta .btn',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' },
      0.62
    );

    tl.fromTo(
      '.hero-visual',
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' },
      0.35
    );

    // One-time light pass on the accent word (repeats + yoyo returns it to
    // rest). The only headline motion — read-only type gets no hover choreography.
    tl.fromTo(
      '.title-line-accent',
      { backgroundPosition: '0% 0%' },
      {
        backgroundPosition: '55% 0%',
        duration: 0.5,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1,
      },
      0.75
    );

    tl.fromTo(
      '.scroll-cue',
      { opacity: 0 },
      { opacity: 0.6, duration: 0.4, ease: 'power2.out' },
      0.9
    );

    // Clean exit parallax on scroll (no blur)
    if (mainRef.current) {
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
                {character3d?.enabled ? (
                  <HeroThree wrapperRef={cardRef} />
                ) : (
                  /* 2D fallback: the character sheet rendered statically. The
                     ~886 kB three.js/R3F chunk is never fetched while 3D is
                     disabled in content.js. */
                  <img
                    className="hero-still"
                    src="/hero-character.webp"
                    alt="Adams Jabali"
                    decoding="async"
                  />
                )}
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <a href="#about" className="scroll-cue" aria-label="Scroll down to see more">
        <span className="scroll-cue-line" aria-hidden="true">
          <span className="scroll-cue-dash" />
        </span>
        <span className="scroll-cue-text">SCROLL</span>
      </a>
    </section>
  );
}
