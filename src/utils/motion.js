/**
 * Returns true when the user has requested reduced motion.
 * SSR-safe (returns false on the server).
 */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

