import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { contact, socials } from '../data/content.js';
import { prefersReducedMotion } from '../utils/motion.js';
import CharacterGuide from './CharacterGuide';
import ContactForm from './ContactForm';
import './Contact.css';

gsap.registerPlugin(useGSAP);

export default function Contact() {
  const sectionRef = useRef(null);
  const orbsRef = useRef(null);
  const gridRef = useRef(null);
  const copyRef = useRef(null);
  const labelRef = useRef(null);
  const socialsRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Copy the email address - clipboard API with a legacy fallback.
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
    } catch {
      const el = document.createElement('textarea');
      el.value = contact.email;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
  }, []);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(t);
  }, [copied]);

  // transitions-dev - Text states swap: "COPY ADDRESS" ⇄ "COPIED" in place.
  // Three-phase sequence: exit up with blur → swap text at the bottom (no
  // transition) → reflow → animate back to rest. Reads the duration from the
  // universal --text-swap-dur token so it stays in sync with the :root block.
  useEffect(() => {
    const el = labelRef.current;
    if (!el) return undefined;
    const next = copied ? 'COPIED' : 'COPY ADDRESS';
    if (el.textContent === next) return undefined;

    const dur =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--text-swap-dur')
      ) || 200;

    el.classList.add('is-exit');
    const t = setTimeout(() => {
      el.textContent = next;
      el.classList.remove('is-exit');
      el.classList.add('is-enter-start');
      void el.offsetHeight; // force reflow so the next change transitions
      el.classList.remove('is-enter-start');
    }, dur);
    return () => clearTimeout(t);
  }, [copied]);

  // Copy pill feedback - small pop when the state flips to "COPIED".
  useGSAP(
    () => {
      if (!copied || !copyRef.current) return;
      gsap.fromTo(
        copyRef.current,
        { scale: 0.82 },
        { scale: 1, duration: 0.4, ease: 'back.out(2.4)', overwrite: 'auto' }
      );
    },
    { scope: sectionRef, dependencies: [copied] }
  );

  // Ambient orbs - each drifts on its own sine loop, the set parallaxes with the mouse.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      if (!orbsRef.current) return;

      const killDrifts = gsap.utils
        .toArray('.contact-orb-core', orbsRef.current)
        .map((orb, i) => {
          const tween = gsap.to(orb, {
            x: gsap.utils.random(-40, 40),
            y: gsap.utils.random(-26, 26),
            scale: gsap.utils.random(0.85, 1.15),
            duration: gsap.utils.random(6, 10),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: i * 0.5,
          });
          return () => tween.kill();
        });

      const wraps = gsap.utils.toArray('.contact-orb', orbsRef.current);
      const depths = [64, 92, 48];
      const parallax = wraps.map((wrap, i) => {
        const xTo = gsap.quickTo(wrap, 'x', { duration: 1.3, ease: 'power2.out' });
        const yTo = gsap.quickTo(wrap, 'y', { duration: 1.3, ease: 'power2.out' });
        return { xTo, yTo, depth: depths[i % depths.length] };
      });

      const section = sectionRef.current;
      const onMouse = (e) => {
        const r = section.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        parallax.forEach((p) => {
          p.xTo(nx * p.depth);
          p.yTo(ny * p.depth);
        });
      };
      section.addEventListener('mousemove', onMouse);

      return () => {
        killDrifts.forEach((kill) => kill());
        section.removeEventListener('mousemove', onMouse);
      };
    },
    { scope: sectionRef }
  );

  // EXPERIENCE -> CONTACT: the heading emerges from depth (scale + blur to
  // focus) as the timeline fades into the background. Targets the heading
  // child so it never fights the data-reveal on .contact-head.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const heading = sectionRef.current?.querySelector('.contact-heading');
      if (!heading) return;
      gsap.fromTo(
        heading,
        { scale: 1.08, opacity: 0.35, filter: 'blur(6px)' },
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 92%',
            end: 'top 52%',
            scrub: 0.5,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  // Contact cards: 3D staggered entrance, then cursor tilt + magnet + spotlight.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const grid = gridRef.current;
      if (!grid) return;

      const cards = gsap.utils.toArray('.contact-card', grid);
      if (!cards.length) return;

      let live = false;

      const entrance = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
        onComplete: () => {
          live = true;
        },
        onReverseComplete: () => {
          live = false;
        },
      });
      entrance.fromTo(
        cards,
        { y: 90, rotationX: -16, opacity: 0, transformOrigin: '50% 0%' },
        {
          y: 0,
          rotationX: 0,
          opacity: 1,
          duration: 0.95,
          ease: 'back.out(1.2)',
          stagger: 0.12,
        }
      );

      // Tilt + magnet + cursor spotlight (active after the entrance).
      const cleanups = cards.map((card) => {
        const tiltX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
        const tiltY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
        const moveX = gsap.quickTo(card, 'x', { duration: 0.45, ease: 'power3.out' });
        const moveY = gsap.quickTo(card, 'y', { duration: 0.45, ease: 'power3.out' });
        const spot = { x: 0, y: 0 };
        const spotX = gsap.quickTo(spot, 'x', {
          duration: 0.4,
          ease: 'power3.out',
          onUpdate: () => card.style.setProperty('--spot-x', `${spot.x}px`),
        });
        const spotY = gsap.quickTo(spot, 'y', {
          duration: 0.4,
          ease: 'power3.out',
          onUpdate: () => card.style.setProperty('--spot-y', `${spot.y}px`),
        });

        const onMove = (e) => {
          if (!live) return;
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          tiltY(px * 10);
          tiltX(py * -10);
          moveX(px * 14);
          moveY(py * 14 - 4); // slight lift while hovering
          spotX(e.clientX - rect.left);
          spotY(e.clientY - rect.top);
        };
        const onLeave = () => {
          tiltX(0);
          tiltY(0);
          moveX(0);
          moveY(0);
        };

        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
        return () => {
          card.removeEventListener('mousemove', onMove);
          card.removeEventListener('mouseleave', onLeave);
        };
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope: gridRef }
  );

  // Availability dot - gentle random pulse.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const dots = gsap.utils.toArray('.contact-availability-dot', sectionRef.current);
      if (!dots.length) return;
      const tween = gsap.to(dots, {
        scale: 1.5,
        opacity: 0.5,
        duration: () => gsap.utils.random(0.9, 1.5),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.3, from: 'random' },
        delay: 0.6,
      });
      return () => tween.kill();
    },
    { scope: sectionRef }
  );

  // transitions-dev - Avatar group hover on the socials strip: hovering one
  // link lifts it and gently lifts its neighbors with a power-falloff; the
  // group snaps back with a bouncy spring on mouseleave. Direction-aware
  // easing is set inline BEFORE the --shift/--scale-active writes so hover-in
  // uses --avatar-ease-in and the return uses --avatar-ease-out.
  useEffect(() => {
    const root = socialsRef.current;
    if (!root) return undefined;
    const avatars = Array.from(root.querySelectorAll('.t-avatar'));
    if (!avatars.length) return undefined;

    const cs = getComputedStyle(document.documentElement);
    const num = (name, fb) => {
      const v = parseFloat(cs.getPropertyValue(name));
      return Number.isFinite(v) ? v : fb;
    };
    const ease = (name, fb) => cs.getPropertyValue(name).trim() || fb;

    const setShifts = (activeIdx, phase) => {
      const lift = num('--avatar-lift', -4);
      const falloff = num('--avatar-falloff', 0.45);
      const scale = num('--avatar-scale', 1.05);
      const tf =
        phase === 'out'
          ? ease('--avatar-ease-out', 'cubic-bezier(0.34, 3.85, 0.64, 1)')
          : ease('--avatar-ease-in', 'cubic-bezier(0.22, 1, 0.36, 1)');

      avatars.forEach((el, i) => {
        el.style.transitionTimingFunction = tf;
        if (activeIdx == null) {
          el.style.setProperty('--shift', '0px');
          el.style.setProperty('--scale-active', '1');
          return;
        }
        const d = Math.abs(i - activeIdx);
        el.style.setProperty('--shift', (lift * Math.pow(falloff, d)).toFixed(3) + 'px');
        el.style.setProperty('--scale-active', i === activeIdx ? String(scale) : '1');
      });
    };

    const onEnter = (i) => () => setShifts(i, 'in');
    const onLeave = () => setShifts(null, 'out');
    const handlers = avatars.map((el, i) => {
      const handler = onEnter(i);
      el.addEventListener('mouseenter', handler);
      return handler;
    });
    root.addEventListener('mouseleave', onLeave);

    return () => {
      avatars.forEach((el, i) => el.removeEventListener('mouseenter', handlers[i]));
      root.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section id="contact" className="contact-section" ref={sectionRef}>
      {/* Ambient orbs - drift + mouse parallax (GSAP) */}
      <div className="contact-orbs" ref={orbsRef} aria-hidden="true">
        <span className="contact-orb contact-orb--1">
          <span className="contact-orb-core" />
        </span>
        <span className="contact-orb contact-orb--2">
          <span className="contact-orb-core" />
        </span>
        <span className="contact-orb contact-orb--3">
          <span className="contact-orb-core" />
        </span>
      </div>

      <div className="section-container">
        <h2 className="section-label" data-reveal="left">
          CONTACT
        </h2>
        <div className="contact-head-wrap">
          <div className="contact-head" data-reveal="up" data-reveal-delay="0.1">
            <h3 className="contact-heading">
              {contact.heading[0]}
              <br />
              <span className="contact-accent">{contact.heading[1]}</span>
            </h3>
            <p className="contact-sub">{contact.sub}</p>
          </div>
          <CharacterGuide
            src="/characters/character-contact.png"
            alt="Adams Jabali waving welcomingly"
            hint="Let's Build Together"
            direction="left"
            triggerRef={sectionRef}
            size="md"
            className="contact-guide-embed"
          />
        </div>

        {/* Reach-out cards - EMAIL (copy), PHONE (call), LOCATION (maps) */}
        <div className="contact-grid" ref={gridRef}>
          <div className="contact-card" style={{ '--card-accent': '#1a1a1a' }}>
            <span className="contact-card-glyph" aria-hidden="true">@</span>
            <span className="contact-card-label">EMAIL</span>
            <a className="contact-card-value" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
            <span className="contact-card-hint">Tap to open your mail app</span>
            <button
              type="button"
              className="contact-copy"
              ref={copyRef}
              onClick={handleCopy}
              aria-label="Copy email address"
            >
              {/* transitions-dev - Text states swap label */}
              <span className="t-text-swap contact-copy-label" ref={labelRef}>
                COPY ADDRESS
              </span>
              {/* transitions-dev - Success check (fade + rotate + bob + stroke-draw) */}
              <span
                className="t-success-check"
                data-state={copied ? 'in' : 'out'}
                aria-hidden="true"
              >
                <svg viewBox="0 0 48 48" fill="none">
                  <path
                    d="M10 25 L20 35 L38 14"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
            <span className="contact-sr-only" role="status">
              {copied ? 'Email address copied to clipboard' : ''}
            </span>
          </div>

          <a
            className="contact-card"
            style={{ '--card-accent': '#1a1a1a' }}
            href={`tel:${contact.phoneIntl}`}
            aria-label={`Call ${contact.phone}`}
          >
            <span className="contact-card-glyph" aria-hidden="true">+</span>
            <span className="contact-card-label">PHONE</span>
            <span className="contact-card-value">{contact.phone}</span>
            <span className="contact-card-hint">+254 740 470 067 · tap to call</span>
          </a>

          <a
            className="contact-card"
            style={{ '--card-accent': '#ffb45e' }}
            href={contact.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Location: ${contact.location}`}
          >
            <span className="contact-card-glyph" aria-hidden="true">◎</span>
            <span className="contact-card-label">LOCATION</span>
            <span className="contact-card-value">{contact.location}</span>
            <span className="contact-card-hint">Open in Google Maps</span>
          </a>
        </div>

        {/* Interactive Direct Message Form */}
        <ContactForm />

        {/* Availability + socials strip */}
        <div className="contact-strip" data-reveal="up" data-reveal-delay="0.2" data-reveal-blur="0">
          <div className="contact-availability">
            <span className="contact-availability-dot" aria-hidden="true" />
            {contact.availability}
          </div>
          <div className="contact-socials t-avatar-group" ref={socialsRef}>
            <span className="t-avatar">
              <a href={socials.github} target="_blank" rel="noopener noreferrer">
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </span>
            <span className="t-avatar">
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </span>
            <span className="t-avatar">
              <a href={socials.portfolio} target="_blank" rel="noopener noreferrer">
                Portfolio <span aria-hidden="true">↗</span>
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
