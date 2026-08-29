/**
 * useLenis - proper Lenis smooth scroll integration.
 *
 * Scroll-craft principles applied:
 *   - Lenis drives ALL scroll: GSAP ticker syncs Lenis each frame so
 *     ScrollTrigger reads the same smooth position (no jitter/drift).
 *   - ScrollTrigger.scrollerProxy is NOT needed for Lenis 1.x; instead
 *     we emit native scroll events via Lenis's own ScrollTrigger
 *     integration, then call ScrollTrigger.update() each raf.
 *   - lerp controls the feel: 0.08 = silky-slow luxury feel.
 *   - wheelMultiplier / touchMultiplier tuned for the portfolio's
 *     section rhythm (you want each scroll "click" to feel decisive
 *     without overshooting a full section).
 *   - Anchor links (<a href="#section">) are intercepted and forwarded
 *     to Lenis.scrollTo() so they animate smoothly too.
 *   - Reduced-motion: Lenis is not created; native scroll stays.
 */

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function useLenis() {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      // Ensure the html element still gets the base class for CSS consumers.
      document.documentElement.classList.add('lenis-ready');
      return;
    }

    // ── Create Lenis ────────────────────────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.3,         // scroll animation length in seconds (lerp alternative for some builds)
      lerp: 0.08,            // linear interpolation factor - lower = smoother/heavier
      wheelMultiplier: 1.0,  // mouse wheel sensitivity
      touchMultiplier: 1.4,  // touch/trackpad sensitivity
      smoothWheel: true,
      syncTouch: false,      // keeps touch native (better on mobile)
      orientation: 'vertical',
      gestureOrientation: 'vertical',
    });

    lenisRef.current = lenis;

    // Mark html so CSS can style scrollbar / overflow correctly.
    document.documentElement.classList.add('lenis', 'lenis-ready');

    // ── Sync Lenis → GSAP ticker (scroll-craft pattern) ─────────────────────
    // Every GSAP tick calls lenis.raf(time). Lenis in turn fires native
    // `scroll` events which ScrollTrigger already listens to. We just need
    // to call ScrollTrigger.update() so it re-reads the scroll position
    // that Lenis emitted in the SAME tick - preventing 1-frame lag.
    const onTick = (time) => {
      lenis.raf(time * 1000); // GSAP time is seconds; Lenis expects ms
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0); // Prevents large jumps after tab switch

    // Keep ScrollTrigger in sync on every Lenis scroll event.
    lenis.on('scroll', ScrollTrigger.update);

    // ── Smooth anchor navigation ─────────────────────────────────────────────
    // Intercept any <a href="#section"> clicks and hand them to Lenis so
    // the navigation feels like a Dr. Strange portal hop - not a jump cut.
    const onAnchorClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const target = link.getAttribute('href');
      if (!target || target === '#') return;
      const el = document.querySelector(target);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, {
        offset: 0,
        duration: 1.6,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      });
    };
    document.addEventListener('click', onAnchorClick);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      gsap.ticker.remove(onTick);
      lenis.off('scroll', ScrollTrigger.update);
      document.removeEventListener('click', onAnchorClick);
      document.documentElement.classList.remove('lenis', 'lenis-ready');
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}