import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../utils/motion.js';

const canHover = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * useTiltMagnet - the shared cursor tilt + magnetic hover + spotlight
 * behaviour found on About cards, Project cards and TechStack orbs.
 *
 * Elements tilt in 3D, optionally magnetize toward the cursor (x/y) with a
 * slight lift, and expose the cursor position via --spot-x / --spot-y CSS
 * vars for the CSS spotlight gradient.
 *
 * Skipped entirely on touch/coarse-pointer devices (the interaction is
 * mouse-only, so touch devices just keep the CSS hover states) and for
 * prefers-reduced-motion.
 *
 * Props:
 *   scopeRef  ref to the element to query within (grid/section)
 *   selector  CSS selector for the tilt targets (e.g. ".project-card")
 *   tilt      max rotation degrees (default 10 → tiltY(px * tilt), tiltX(py * -tilt))
 *   magnet    max magnetize offset in px (0 disables the x/y magnet/lift)
 *   lift      upward lift in px while hovering (requires magnet > 0)
 *   liveRef   optional ref gating movement (About cards: true only after the
 *             entrance timeline completes)
 *   deps      extra effect dependencies (e.g. TechStack re-runs on filter change)
 */
export default function useTiltMagnet(
  scopeRef,
  selector,
  { tilt = 10, magnet = 14, lift = 4, liveRef = null, deps = [] } = {}
) {
  const optsRef = useRef({});
  optsRef.current = { tilt, magnet, lift, liveRef };

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    if (!canHover()) return undefined;
    const scope = scopeRef.current;
    if (!scope) return undefined;

    const { tilt: tiltMax, magnet: magnetMax, lift: liftMax, liveRef: gate } = optsRef.current;
    const els = gsap.utils.toArray(selector, scope);
    if (!els.length) return undefined;

    const cleanups = els.map((el) => {
      const tiltX = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const tiltY = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      const moveX = magnetMax ? gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' }) : null;
      const moveY = magnetMax ? gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' }) : null;
      const spot = { x: 0, y: 0 };
      const spotX = gsap.quickTo(spot, 'x', {
        duration: 0.4,
        ease: 'power3.out',
        onUpdate: () => el.style.setProperty('--spot-x', `${spot.x}px`),
      });
      const spotY = gsap.quickTo(spot, 'y', {
        duration: 0.4,
        ease: 'power3.out',
        onUpdate: () => el.style.setProperty('--spot-y', `${spot.y}px`),
      });

      const onMove = (e) => {
        if (gate && !gate.current) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        tiltY(px * tiltMax);
        tiltX(py * -tiltMax);
        if (moveX && moveY) {
          moveX(px * magnetMax);
          moveY(py * magnetMax - liftMax); // slight lift while hovering
        }
        spotX(e.clientX - rect.left);
        spotY(e.clientY - rect.top);
      };
      const onLeave = () => {
        tiltX(0);
        tiltY(0);
        if (moveX && moveY) {
          moveX(0);
          moveY(0);
        }
      };

      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      return () => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are passed by the caller (selector/scope are stable per callsite)
  }, deps);
}
