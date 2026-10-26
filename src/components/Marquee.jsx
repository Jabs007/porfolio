import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { marquee } from '../data/content';
import { prefersReducedMotion } from '../utils/motion.js';
import './Marquee.css';

/**
 * Marquee - the editorial type band between sections.
 *
 * Motion notes:
 *  - The drift is driven by the GSAP ticker (transform only) instead of a CSS
 *    keyframe, so it can stop completely while the band is off-screen and
 *    modulate with scroll speed.
 *  - Scroll reacts as *speed*, never as skew or scale: scrolling faster makes
 *    the band drift a little quicker, then it eases back to its base pace.
 *  - Reduced motion: nothing runs; the band renders as a static type strip.
 */
export default function Marquee({ reverse = false }) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || prefersReducedMotion()) return undefined;

    // Forward band drifts right-to-left (as the CSS version did); the second
    // band mirrors it so the two never travel the same way.
    const dir = reverse ? 1 : -1;
    const BASE_SPEED = 46; // px / s
    const HALF = () => track.scrollWidth / 2;

    // Pre-warm margin: the band keeps drifting slightly before it reaches the
    // viewport, so it's already mid-stride when the edge appears.
    const PREWARM = 120;

    let x = 0;
    let lastTime = performance.now();
    let lastScrollY = window.scrollY;
    let scrollSpeed = 0; // damped |px/s|

    // Visibility is read directly from the rect each tick instead of an
    // IntersectionObserver: one layout read, no callback ordering to trust.
    const isInView = () => {
      const rect = root.getBoundingClientRect();
      return rect.bottom > -PREWARM && rect.top < window.innerHeight + PREWARM;
    };

    const wrap = () => {
      const half = HALF();
      if (!half) return;
      if (x <= -half) x += half;
      else if (x > 0) x -= half;
    };

    const tick = () => {
      const now = performance.now();
      // Clamp tab-switch spikes, but loosely: a tighter cap would silently
      // slow the drift on low-framerate devices.
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Damp the raw scroll velocity so the band breathes rather than twitches.
      const y = window.scrollY;
      const rawSpeed = Math.abs(y - lastScrollY) / dt;
      lastScrollY = y;
      scrollSpeed += (rawSpeed - scrollSpeed) * 0.12;

      if (!isInView()) return;

      // Cap the boost so fast flicks can't fling the type past readability.
      const boost = Math.min(scrollSpeed * 0.16, 90);
      x += dir * (BASE_SPEED + boost) * dt;
      wrap();
      gsap.set(track, { x });
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
    };
  }, [reverse]);

  return (
    <div
      ref={rootRef}
      className={`marquee ${reverse ? 'marquee--reverse' : ''}`}
      aria-hidden="true"
    >
      <div className="marquee-track" ref={trackRef}>
        {[0, 1].map((copy) => (
          <div className="marquee-group" key={copy}>
            {marquee.map((word) => (
              <span className="marquee-item" key={word}>
                {word}
                <span className="marquee-sep">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
