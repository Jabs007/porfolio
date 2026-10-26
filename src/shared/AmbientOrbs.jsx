import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../utils/motion.js';

const canHover = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * AmbientOrbs - shared drifting background orb layer used by About,
 * Projects and TechStack. Each orb core drifts on its own looping tween and
 * the whole set parallaxes with the mouse on hover-capable pointers.
 *
 * Reuses the existing per-section class names (`about-orb`, `project-orb`,
 * `ts-bg-orb`, ...) so all section stylesheets keep working unchanged.
 *
 * Props:
 *   wrapClass  class for the wrapper (e.g. "projects-orbs", "ts-bg-orbs")
 *   orbClass   base class for each orb span (e.g. "project-orb")
 *   count      number of orbs (default 3, styled as --1/--2/--3 in CSS)
 *   depths     parallax depths per orb, matches the original per-section values
 */
export default function AmbientOrbs({ wrapClass, orbClass, count = 3, depths = [70, 44, 96] }) {
  const wrapRef = useRef(null);
  const depthsRef = useRef(depths);
  depthsRef.current = depths;
  const depthsKey = depths.join('|');

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    // Ambient drift: each core wanders on its own looping tween.
    const killDrifts = gsap.utils.toArray(`.${orbClass}-core`, wrap).map((orb, i) => {
      const tween = gsap.to(orb, {
        x: gsap.utils.random(-44, 44),
        y: gsap.utils.random(-28, 28),
        scale: gsap.utils.random(0.85, 1.15),
        duration: gsap.utils.random(6, 10),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.5,
      });
      return () => tween.kill();
    });

    // Mouse parallax: only on hover-capable pointers (touch gets drift only).
    let onMouse = null;
    let section = null;
    if (canHover()) {
      section = wrap.closest('section');
      const depthsNow = depthsRef.current;
      const parallax = gsap.utils.toArray(`.${orbClass}`, wrap).map((el, i) => ({
        xTo: gsap.quickTo(el, 'x', { duration: 1.3, ease: 'power2.out' }),
        yTo: gsap.quickTo(el, 'y', { duration: 1.3, ease: 'power2.out' }),
        depth: depthsNow[i % depthsNow.length],
      }));
      if (section) {
        onMouse = (e) => {
          const r = section.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          parallax.forEach((p) => {
            p.xTo(nx * p.depth);
            p.yTo(ny * p.depth);
          });
        };
        section.addEventListener('mousemove', onMouse);
      }
    }

    return () => {
      killDrifts.forEach((kill) => kill());
      if (onMouse && section) section.removeEventListener('mousemove', onMouse);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depthsKey covers the depths identity
  }, [wrapClass, orbClass, depthsKey]);

  return (
    <div className={wrapClass} ref={wrapRef} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`${orbClass} ${orbClass}--${i + 1}`}>
          <span className={`${orbClass}-core`} />
        </span>
      ))}
    </div>
  );
}
