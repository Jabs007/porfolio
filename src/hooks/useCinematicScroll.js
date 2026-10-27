import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../cinematic.css';

gsap.registerPlugin(ScrollTrigger);

// Sections, in DOM order. Their boundaries get the gradient wipe treatment.
const SCENES = [
  { id: 'hero' },
  { id: 'about' },
  { id: 'projects' },
  { id: 'techstack' },
  { id: 'experience' },
  { id: 'contact' },
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const prefersMobile = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 767px), (max-width: 1024px) and (pointer: coarse)').matches;

/**
 * Global cinematic atmosphere:
 *  - scroll-velocity tracker writing --vel / --vel-signed CSS vars
 *  - ambient bronze glow layer that drifts with velocity + mouse
 *  - gradient wipes at every section boundary (scrubbed)
 *  - a 2D particle field that drifts, reacts to velocity, and converges
 *    on the contact heading when that section is in view
 *
 * All effects respect prefers-reduced-motion; heavy layers are skipped on
 * mobile/coarse-pointer devices. Runs once `ready` (after the loading screen
 * releases the sections) so ScrollTriggers measure real layout.
 */
export default function useCinematicScroll(ready) {
  useEffect(() => {
    if (!ready) return undefined;
    if (prefersReducedMotion()) return undefined;

    const isMobile = prefersMobile();
    const layer = document.createElement('div');
    layer.className = 'cinema-layer';
    document.body.appendChild(layer);

    const cleans = [];

    // ---- 1. Ambient glow + velocity/mouse drift ----
    const glow = document.createElement('div');
    glow.className = 'cinema-glow';
    layer.appendChild(glow);
    const glowX = gsap.quickTo(glow, 'x', { duration: 1.6, ease: 'power2.out' });
    const glowY = gsap.quickTo(glow, 'y', { duration: 1.6, ease: 'power2.out' });
    const onMouse = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      glowX(nx * -36);
      glowY(ny * -28);
    };
    window.addEventListener('mousemove', onMouse, { passive: true });
    cleans.push(() => window.removeEventListener('mousemove', onMouse));

    // ---- 2. Gradient wipes at section boundaries ----
    if (!isMobile) {
      for (let i = 0; i < SCENES.length - 1; i++) {
        const wipe = document.createElement('div');
        wipe.className = 'cinema-wipe';
        layer.appendChild(wipe);

        const trigger = document.getElementById(SCENES[i + 1].id);
        if (!trigger) {
          wipe.remove();
          continue;
        }

        const tween = gsap.fromTo(
          wipe,
          { yPercent: -150, opacity: 0 },
          {
            yPercent: 0,
            opacity: 0.85,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top 95%',
              end: 'top 38%',
              scrub: 0.55,
            },
          }
        );
        const outTween = gsap.to(wipe, {
          yPercent: 150,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: 'top 38%',
            end: 'top 5%',
            scrub: 0.55,
          },
        });
        cleans.push(() => {
          tween.scrollTrigger?.kill();
          outTween.scrollTrigger?.kill();
          tween.kill();
          outTween.kill();
        });
      }
    }

    // ---- 2b. Filmic seam - bright horizontal cut on section arrival ----
    const seam = document.createElement('div');
    seam.className = 'cinema-seam';
    layer.appendChild(seam);
    const seamTween = gsap.fromTo(
      seam,
      { scaleX: 0.2, opacity: 0 },
      {
        scaleX: 1,
        opacity: 0.9,
        duration: 0.16,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        repeatDelay: 0.08,
      }
    );
    seamTween.pause();
    SCENES.slice(1).forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const t = ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        onEnter: () => seamTween.restart(),
      });
      cleans.push(() => t.kill());
    });
    cleans.push(() => seamTween.kill());

    // Mobile: keep the seam out of the DOM (real estate + perf)
    if (isMobile) seam.remove();

    // ---- 4. Particle field (2D canvas, velocity-reactive, converges on contact) ----
    const particleCleanup = isMobile
      ? null
      : initParticles(layer, cleans);

    // ---- 5. Scroll-velocity tracker: writes --vel / --vel-signed ----
    const root = document.documentElement;
    let lastY = window.scrollY;
    let vel = 0;
    let signed = 0;
    const ticker = gsap.ticker.add(() => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      // Smooth toward the new velocity (fast scroll -> higher var).
      const target = Math.abs(dy) / 120;
      signed += (Math.sign(dy || signed) * target - signed) * 0.12;
      vel += (target - vel) * 0.12;
      root.style.setProperty('--vel', vel.toFixed(3));
      root.style.setProperty('--vel-signed', signed.toFixed(3));
    });
    cleans.push(() => gsap.ticker.remove(ticker));

    return () => {
      particleCleanup?.();
      cleans.forEach((clean) => clean());
      layer.remove();
      delete document.body.dataset.scene;
    };
  }, [ready]);
}

/**
 * 2D canvas particles: slow ambient drift, slight velocity push, and a
 * gentle attraction toward the contact heading when it is on screen.
 * Reduced particle count + no blur on mobile-tier devices handled upstream.
 */
function initParticles(layer, cleans) {
  const canvas = document.createElement('canvas');
  canvas.className = 'cinema-particles';
  layer.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0;
  let h = 0;

  const resize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);
  cleans.push(() => window.removeEventListener('resize', resize));

  const COUNT = 46;
  const parts = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.6 + Math.random() * 1.6,
    vx: (Math.random() - 0.5) * 0.22,
    vy: -0.05 - Math.random() * 0.25,
    a: 0.08 + Math.random() * 0.22,
    tw: Math.random() * Math.PI * 2,
  }));

  const measureTarget = () => {
    const el = document.getElementById('contact');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const head = el.querySelector('.contact-heading');
    const hr = head ? head.getBoundingClientRect() : r;
    return { x: hr.left + hr.width / 2, y: hr.top + hr.height / 2, rect: r };
  };

  const draw = () => {
    const vel = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vel')) || 0;
    const signed =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vel-signed')) || 0;

    ctx.clearRect(0, 0, w, h);
    const nearContact = measureTarget();
    const contactActive =
      nearContact && nearContact.rect.top < h * 0.92 && nearContact.rect.bottom > h * 0.1;

    for (const p of parts) {
      p.tw += 0.008;
      // Velocity pushes particles slightly (fast scroll -> faster drift).
      p.x += p.vx + signed * 0.35;
      p.y += p.vy - vel * 0.25;

      // Converge toward the contact heading when it's in view.
      if (contactActive && nearContact) {
        const dx = nearContact.x - p.x;
        const dy = nearContact.y - p.y;
        p.x += dx * 0.0018;
        p.y += dy * 0.0018;
      }

      // Wrap around the viewport.
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      const flicker = 0.65 + 0.35 * Math.sin(p.tw);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 135, 42, ${(p.a * flicker).toFixed(3)})`;
      ctx.fill();
    }
  };

  const tick = gsap.ticker.add(draw);
  cleans.push(() => gsap.ticker.remove(tick));

  return () => {
    canvas.remove();
  };
}
