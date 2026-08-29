import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '../utils/motion.js';
import './CharacterGuide.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function CharacterGuide({
  src,
  alt = 'Adams Jabali 3D Avatar Guide',
  hint,
  direction = 'right', // 'left' | 'right' | 'center'
  triggerRef,
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const guideRef = useRef(null);
  const characterRef = useRef(null);
  const shadowRef = useRef(null);
  const bubbleRef = useRef(null);

  useGSAP(
    () => {
      const el = characterRef.current;
      const shadow = shadowRef.current;
      const guide = guideRef.current;
      const trigger = triggerRef?.current || guide;
      if (!el || !guide) return;

      const reduceMotion = prefersReducedMotion();

      // 1. Idle Floating & Breathing Loop
      if (!reduceMotion) {
        gsap.to(el, {
          y: -14,
          rotationZ: direction === 'left' ? -2 : 2,
          duration: 2.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });

        if (shadow) {
          gsap.to(shadow, {
            scaleX: 0.85,
            scaleY: 0.85,
            opacity: 0.2,
            duration: 2.6,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        }
      }

      // 2. Scroll-Driven Entrance & Parallax Guide Movement
      if (trigger) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger,
            start: 'top 85%',
            end: 'bottom top',
            scrub: reduceMotion ? false : 0.6,
          },
        });

        if (!reduceMotion) {
          // Parallax movement as user maneuvers through the section
          tl.fromTo(
            guide,
            { yPercent: 15, rotate: direction === 'left' ? 4 : -4 },
            { yPercent: -15, rotate: direction === 'left' ? -2 : 2, ease: 'none' }
          );
        }
      }

      // 3. Interactive Mouse Track & Spring Reactivity
      if (!reduceMotion) {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
        const rTo = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });

        const onMouseMove = (e) => {
          const rect = guide.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;

          xTo(px * 16);
          yTo(py * 12);
          rTo(px * 20);
        };

        const onMouseLeave = () => {
          xTo(0);
          yTo(0);
          rTo(0);
        };

        window.addEventListener('mousemove', onMouseMove);
        guide.addEventListener('mouseleave', onMouseLeave);
        return () => {
          window.removeEventListener('mousemove', onMouseMove);
          guide.removeEventListener('mouseleave', onMouseLeave);
        };
      }
    },
    { scope: guideRef, dependencies: [direction, triggerRef] }
  );

  return (
    <div
      ref={guideRef}
      className={`character-guide character-guide--${direction} character-guide--${size} ${className}`}
      aria-hidden="true"
    >
      <div className="character-guide-inner">
        {hint && (
          <div ref={bubbleRef} className="character-guide-bubble">
            <span className="character-guide-bubble-dot" />
            <span className="character-guide-bubble-text">{hint}</span>
          </div>
        )}

        <div ref={characterRef} className="character-guide-figure">
          <picture>
            <source srcSet={src.replace(/\.(png|jpg|jpeg)$/, '.webp')} type="image/webp" />
            <img
              src={src}
              alt={alt}
              className="character-guide-img"
              loading="lazy"
              draggable={false}
            />
          </picture>
        </div>

        <div ref={shadowRef} className="character-guide-shadow" />
      </div>
    </div>
  );
}
