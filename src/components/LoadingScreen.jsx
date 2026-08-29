import { useRef, useState } from 'react';
import './LoadingScreen.css';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const WELCOME_WORD = 'WELCOME';

export default function LoadingScreen({ onLoadingComplete }) {
  const [phase, setPhase] = useState('loading'); // 'loading' | 'welcome'
  const screenRef = useRef(null);
  const shapesRef = useRef([]);
  const brandRef = useRef(null);
  const progressRef = useRef(null);
  const percentRef = useRef(null);
  const welcomeRef = useRef(null);
  const welcomeLettersRef = useRef([]);

  useGSAP(
    (context, contextSafe) => {
      // Accessibility: skip the whole choreography for reduced-motion users.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        onLoadingComplete?.();
        return;
      }

      const duration = 1100;
      const start = performance.now();
      const shapes = shapesRef.current.filter(Boolean);
      const letters = welcomeLettersRef.current.filter(Boolean);
      let rafId;
      let welcomeTimer;
      let isActive = true;

      const tick = (now) => {
        if (!isActive) return;
        const elapsed = now - start;
        const pct = Math.min((elapsed / duration) * 100, 100);
        if (progressRef.current) progressRef.current.style.width = `${Math.floor(pct)}%`;
        if (percentRef.current) percentRef.current.textContent = `${Math.floor(pct)}%`;
        if (pct < 100) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      // Once the bar fills, morph into the WELCOME reveal, then lift the curtain.
      welcomeTimer = setTimeout(() => {
        if (!isActive) return;
        setPhase('welcome');

        // The timeline is created after useGSAP() has already run, so wrap it
        // in contextSafe: it gets added to the context (scoped to screenRef)
        // and is automatically reverted/killed on unmount.
        contextSafe(() => {
          const tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: () => onLoadingComplete?.(),
          });

          tl.to('.loading-center', { y: -80, autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, 0)
            .to('.loading-header', { autoAlpha: 0, duration: 0.3 }, 0)
            .to(shapes, { opacity: 0, scale: 1.5, duration: 0.55, stagger: 0.05, ease: 'power2.out' }, 0.05)
            .fromTo(welcomeRef.current, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.3)
            .fromTo(
              letters,
              { autoAlpha: 0, y: 70, rotateX: 90 },
              { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.55, stagger: 0.05, ease: 'back.out(1.7)' },
              0.45
            )
            .to(screenRef.current, { y: '-100%', duration: 1.0, ease: 'power4.inOut' }, '+=0.95');
        })();
      }, duration + 150);

      // Cleanup for non-GSAP resources (rAF loop + timeout). The context
      // (including the contextSafe timeline) is reverted automatically.
      return () => {
        isActive = false;
        cancelAnimationFrame(rafId);
        clearTimeout(welcomeTimer);
      };
    },
    { scope: screenRef, dependencies: [onLoadingComplete] }
  );

  return (
    <div ref={screenRef} className={`loading-screen ${phase === 'welcome' ? 'welcome-active' : ''}`}>
      <div className="loading-shapes" aria-hidden="true">
        <div className="shape shape-1" ref={(el) => (shapesRef.current[0] = el)} />
        <div className="shape shape-2" ref={(el) => (shapesRef.current[1] = el)} />
        <div className="shape shape-3" ref={(el) => (shapesRef.current[2] = el)} />
        <div className="shape shape-4" ref={(el) => (shapesRef.current[3] = el)} />
        <div className="shape shape-5" ref={(el) => (shapesRef.current[4] = el)} />
      </div>

      <div className="loading-header">
        <span ref={brandRef} className="loader-brand">adams.dev</span>
        <div className="loader-decoration">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>

      <div className="loading-center">
        <div className="loading-progress-track">
          <div className="loading-progress-fill" ref={progressRef} />
        </div>
        <div className="loading-info">
          <span className="loading-label">LOADING</span>
          <span className="loading-percent" ref={percentRef}>0%</span>
        </div>
      </div>

      <div className="welcome-message" ref={welcomeRef} aria-hidden="true">
        <h1 className="welcome-title">
          {WELCOME_WORD.split('').map((letter, i) => (
            <span key={i} ref={(el) => (welcomeLettersRef.current[i] = el)}>{letter}</span>
          ))}
        </h1>
        <div className="welcome-rule" />
        <p className="welcome-subline">I'm Adams Jabali, Software Engineer &amp; Data Scientist</p>
      </div>
    </div>
  );
}
