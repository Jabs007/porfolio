import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../utils/motion.js';
import './SlingRingPortal.css';

/**
 * SlingRingPortal - the shared Dr. Strange portal used by About, Projects
 * and TechStack. Owns the open/close animation, backdrop click-to-close,
 * burst flare and ring rig.
 *
 * Existing per-section CSS class names are preserved through `baseClass` /
 * `cardClass` (e.g. "project-portal" + "project-portal-card") so every
 * section stylesheet keeps working unchanged. The portal *card content*
 * (nav, lists, CV viewer, close button) is passed as `children`.
 *
 * Props:
 *   baseClass     CSS prefix for the portal chrome (backdrop/burst/rig/fire/arcs/rings/shimmer)
 *   cardClass     class(es) for the card element (may include modifiers)
 *   open          current selection value (truthy = open) or null/undefined = closed
 *   accentColor   value for the --portal-accent CSS var, or undefined to keep the theme accent
 *   ariaLabel     accessible label for the dialog
 *   onClose       called when the backdrop is clicked
 *   cardRef       external ref to the card element (used by useFocusTrap in the section)
 *   burstPosRef   external ref holding {x, y} burst coordinates in viewport space
 *                 (the portal overlay is position:fixed, so the burst span's
 *                 containing block is the viewport, not the section)
 *   animateChildren  when true, staggers the direct card children on open
 */
export default function SlingRingPortal({
  baseClass,
  cardClass,
  open,
  accentColor,
  ariaLabel,
  onClose,
  cardRef,
  burstPosRef,
  animateChildren = false,
  children,
}) {
  const portalRef = useRef(null);
  const burstRef = useRef(null);

  useEffect(() => {
    const portal = portalRef.current;
    if (!portal) return undefined;
    const hasReduced = prefersReducedMotion();

    if (open == null) {
      // Closing ripple from the last opened card, then collapse + spin away.
      const burst = burstRef.current;
      const pos = burstPosRef?.current;
      if (burst && pos && !hasReduced) {
        gsap.set(burst, { x: pos.x, y: pos.y, scale: 0.35, opacity: 0.9 });
        gsap.to(burst, {
          scale: 1.6,
          opacity: 0,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
      gsap.set(portal, { visibility: 'visible' });
      gsap.to(portal, {
        scale: 0.25,
        rotation: hasReduced ? 0 : 8,
        opacity: 0,
        duration: hasReduced ? 0.1 : 0.35,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => gsap.set(portal, { visibility: 'hidden', rotation: 0 }),
      });
      return undefined;
    }

    gsap.set(portal, { visibility: 'visible' });

    // Sling-ring flare at the clicked card, then the portal expands.
    const burst = burstRef.current;
    const pos = burstPosRef?.current;
    if (burst && pos) {
      gsap.set(burst, { x: pos.x, y: pos.y, scale: 0.3, opacity: 1 });
      gsap.to(burst, {
        scale: 1.7,
        opacity: 0,
        duration: hasReduced ? 0.1 : 0.7,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    gsap.fromTo(
      portal,
      { scale: 0.3, rotation: hasReduced ? 0 : -5, opacity: 0 },
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: hasReduced ? 0.2 : 0.6,
        ease: 'back.out(1.6)',
        overwrite: 'auto',
      }
    );

    const card = cardRef?.current;
    if (card) {
      gsap.fromTo(
        card,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: hasReduced ? 0.15 : 0.45,
          delay: hasReduced ? 0 : 0.15,
          ease: 'power3.out',
          overwrite: 'auto',
        }
      );

      if (animateChildren) {
        // Stagger every direct child of the card except the decorative
        // shimmer (and the exact `${baseClass}-close` button if present).
        const kids = Array.from(card.children).filter(
          (el) =>
            !el.classList.contains(`${baseClass}-shimmer`) &&
            !el.classList.contains(`${baseClass}-close`)
        );
        if (kids.length) {
          gsap.fromTo(
            kids,
            { y: 18, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              delay: hasReduced ? 0 : 0.32,
              ease: 'power3.out',
              stagger: 0.06,
              overwrite: 'auto',
            }
          );
        }
      }

      const shimmer = card.querySelector(`.${baseClass}-shimmer`);
      if (shimmer && !hasReduced) {
        gsap.fromTo(
          shimmer,
          { xPercent: -140 },
          {
            xPercent: 140,
            duration: 1.15,
            delay: 0.3,
            ease: 'power2.inOut',
            overwrite: 'auto',
          }
        );
      }
    }

    return undefined;
  }, [open, baseClass, animateChildren, cardRef, burstPosRef]);

  return (
    <div
      className={baseClass}
      ref={portalRef}
      data-open={open != null}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      style={accentColor ? { '--portal-accent': accentColor } : undefined}
    >
      <div className={`${baseClass}-backdrop`} onClick={onClose} aria-hidden="true" />
      <span className={`${baseClass}-burst`} ref={burstRef} aria-hidden="true" />
      <div className={`${baseClass}-rig`}>
        <span className={`${baseClass}-fire`} aria-hidden="true" />
        <svg
          className={`${baseClass}-arcs`}
          viewBox="0 0 100 100"
          aria-hidden="true"
          focusable="false"
        >
          <circle className={`${baseClass}-arc ${baseClass}-arc--1`} cx="50" cy="50" r="48" pathLength={1} />
          <circle className={`${baseClass}-arc ${baseClass}-arc--2`} cx="50" cy="50" r="43" pathLength={1} />
          <circle className={`${baseClass}-arc ${baseClass}-arc--3`} cx="50" cy="50" r="38" pathLength={1} />
        </svg>
        <span className={`${baseClass}-ring ${baseClass}-ring--outer`} aria-hidden="true" />
        <span className={`${baseClass}-ring ${baseClass}-ring--inner`} aria-hidden="true" />
        <div className={cardClass} ref={cardRef}>
          <span className={`${baseClass}-shimmer`} aria-hidden="true" />
          {children}
        </div>
      </div>
    </div>
  );
}
