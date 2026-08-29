import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import './ScrollToTop.css';

gsap.registerPlugin(useGSAP);

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const btnRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      setProgress(currentProgress);
      setVisible(scrollY > 450);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useGSAP(
    () => {
      const el = btnRef.current;
      if (!el) return;
      if (visible) {
        gsap.to(el, {
          scale: 1,
          opacity: 1,
          duration: 0.35,
          ease: 'back.out(1.8)',
          pointerEvents: 'auto',
        });
      } else {
        gsap.to(el, {
          scale: 0.5,
          opacity: 0,
          duration: 0.25,
          ease: 'power2.in',
          pointerEvents: 'none',
        });
      }
    },
    { dependencies: [visible] }
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 100 circumference = 2 * PI * r (r=18 => circumference ~ 113)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      ref={btnRef}
      type="button"
      className="scroll-to-top-btn"
      onClick={scrollToTop}
      aria-label="Scroll to top of page"
      title="Ascend to apex"
    >
      <svg className="scroll-progress-ring" viewBox="0 0 44 44" aria-hidden="true">
        <circle
          className="scroll-progress-track"
          cx="22"
          cy="22"
          r={radius}
        />
        <circle
          className="scroll-progress-indicator"
          cx="22"
          cy="22"
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
        />
      </svg>
      <span className="scroll-to-top-spark" aria-hidden="true" />
      <span className="scroll-to-top-arrow" aria-hidden="true">↑</span>
    </button>
  );
}

