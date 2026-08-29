import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const VARIANTS = {
  fade: { from: { opacity: 0 }, to: { opacity: 1 } },
  up: { from: { y: 56, opacity: 0 }, to: { y: 0, opacity: 1 } },
  down: { from: { y: -56, opacity: 0 }, to: { y: 0, opacity: 1 } },
  left: { from: { x: -64, opacity: 0 }, to: { x: 0, opacity: 1 } },
  right: { from: { x: 64, opacity: 0 }, to: { x: 0, opacity: 1 } },
  scale: { from: { scale: 0.9, opacity: 0 }, to: { scale: 1, opacity: 1 } },
  // Emil's clip-path reveal - hardware-accelerated wipe from the bottom edge,
  // no layout shift. Pairs naturally with 3D-tilt cards (clip applies after
  // transform, so the two compose cleanly).
  clip: {
    from: { clipPath: 'inset(100% 0 0 0)' },
    to: { clipPath: 'inset(0 0 0 0)' },
    ease: 'power2.inOut',
  },
};

// Jakub's enter recipe: opacity + translateY + a 4px blur that clears as the
// element "materializes". Default on every reveal; opt out with
// data-reveal-blur="0" on elements whose descendants use backdrop-filter
// (an ancestor filter would confine the glass backdrop sampling).
const REVEAL_BLUR = 'blur(4px)';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Global scroll-reveal system.
 *
 * Any element with a `data-reveal` attribute gets a GSAP + ScrollTrigger
 * entrance animation the moment it scrolls into view. Variants:
 *   data-reveal="up|down|left|right|scale|clip|fade"   (default: up)
 *   data-reveal-delay="0.2"                            seconds
 *   data-reveal-start="top 85%"                        ScrollTrigger start position
 *   data-reveal-blur="0"                               skip the blur materialize
 *
 * Tied to `ready` so it only scans the DOM once the loading screen has
 * released the sections (children are not mounted before that).
 */
export default function useScrollReveals(ready) {
  useGSAP(
    () => {
      if (!ready) return;
      if (prefersReducedMotion()) return;

      const elements = gsap.utils.toArray('[data-reveal]');

      elements.forEach((el) => {
        const variant = VARIANTS[el.dataset.reveal] || VARIANTS.up;
        const delay = parseFloat(el.dataset.revealDelay || 0) || 0;
        const start = el.dataset.revealStart || 'top 85%';
        const withBlur = el.dataset.revealBlur !== '0' && !variant.from.clipPath;

        gsap.fromTo(
          el,
          { ...variant.from, ...(withBlur ? { filter: REVEAL_BLUR } : {}) },
          {
            ...variant.to,
            ...(withBlur ? { filter: 'blur(0px)' } : {}),
            delay,
            duration: variant.ease === 'power2.inOut' ? 0.9 : 0.7,
            ease: variant.ease || 'power3.out',
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Re-measure once fonts/images have settled to avoid offsets.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      return () => window.removeEventListener('load', refresh);
    },
    { dependencies: [ready] }
  );
}
