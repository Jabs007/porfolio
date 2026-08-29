import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './CustomCursor.css';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable on touch screens or reduced motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reducedMotion) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    // Fast quickTo for crisp cursor dot, slightly eased quickTo for trailing ring
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.28, ease: 'power2.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.28, ease: 'power2.out' });

    const onMouseMove = (e) => {
      if (!isVisible) setIsVisible(true);
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    // Dynamic hover inspection on clickable / interactive targets
    const onMouseOver = (e) => {
      const target = e.target.closest('a, button, input, textarea, select, [role="button"], .project-card, .ts-orb, .contact-card');
      if (target) {
        setHovered(true);
        if (target.classList.contains('project-card')) {
          setCursorText('OPEN PORTAL');
        } else if (target.classList.contains('ts-orb')) {
          setCursorText('SPELL');
        } else {
          setCursorText('');
        }
      } else {
        setHovered(false);
        setCursorText('');
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.body.addEventListener('mouseleave', onMouseLeave);
    document.body.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', onMouseOver);
      document.body.removeEventListener('mouseleave', onMouseLeave);
      document.body.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  return (
    <div className={`custom-cursor-wrapper ${isVisible ? 'custom-cursor--visible' : ''}`} aria-hidden="true">
      {/* Center sharp mystic dot */}
      <div
        ref={dotRef}
        className={`cursor-dot ${hovered ? 'cursor-dot--hovered' : ''} ${clicked ? 'cursor-dot--clicked' : ''}`}
      />

      {/* Trailing sling-ring spark aura */}
      <div
        ref={ringRef}
        className={`cursor-ring ${hovered ? 'cursor-ring--hovered' : ''} ${clicked ? 'cursor-ring--clicked' : ''}`}
      >
        <span className="cursor-ring-spark" />
        {cursorText && <span className="cursor-text">{cursorText}</span>}
      </div>
    </div>
  );
}

