import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const navLinks = [
  { label: 'About',      href: '#about'      },
  { label: 'Projects',   href: '#projects'   },
  { label: 'Tech Stack', href: '#techstack'  },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact',    href: '#contact'    },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [active, setActive] = useState('About');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const progressRef = useRef(null);
  const lastScrollY = useRef(0);
  const pendingRef = useRef(null); // section settled-but-not-yet-committed
  const settleTimerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  
  useGSAP(
    () => {
      if (!isLoaded) return;
      const triggers = navLinks.map((link) => {
        const el = document.querySelector(link.href);
        if (!el) return null;
        return ScrollTrigger.create({
          trigger: el,
          start: 'top 45%',
          end: 'bottom 45%',
          onToggle: (self) => {
            if (!self.isActive) return;
            pendingRef.current = link.label;
            if (settleTimerRef.current) gsap.delayedCall(0, () => settleTimerRef.current?.kill());
            settleTimerRef.current = gsap.delayedCall(0.18, () => {
              if (pendingRef.current) setActive(pendingRef.current);
              settleTimerRef.current = null;
            });
          },
        });
      }).filter(Boolean);

      // Initial state from the current scroll position (direct offsets; the
      // triggers above take over from the first scroll afterward).
      const y = window.scrollY + window.innerHeight * 0.45;
      let initial = navLinks[0].label;
      for (const link of navLinks) {
        const el = document.querySelector(link.href);
        if (el && y >= el.offsetTop) initial = link.label;
      }
      setActive(initial);

      return () => {
        triggers.forEach((t) => t.kill());
        if (settleTimerRef.current) settleTimerRef.current.kill();
      };
    },
    { dependencies: [isLoaded], scope: navRef }
  );

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 50);

      if (currentY > lastScrollY.current && currentY > 120) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useGSAP(() => {
    if (!progressRef.current) return;

    gsap.fromTo(
      progressRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.4,
        },
      }
    );
  }, { scope: navRef });

  useGSAP(() => {
    if (!isLoaded || !indicatorRef.current || !navRef.current) return;

    const activeEl = navRef.current.querySelector(`[data-label="${active}"]`);
    if (!activeEl) return;

    const navRect = navRef.current.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();

    gsap.to(indicatorRef.current, {
      x: itemRect.left - navRect.left,
      width: itemRect.width,
      duration: 0.4,
      ease: 'power3.out',
    });
  }, { scope: navRef, dependencies: [active, isLoaded] });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div
      className={`loading-header ${isLoaded ? 'loaded' : ''} ${scrolled ? 'loading-header--scrolled' : ''} ${hidden ? 'loading-header--hidden' : ''}`}
    >
      <div className="scroll-progress" ref={progressRef} aria-hidden="true" />
      <a href="#" className="loader-title">adams.dev</a>

      <nav
        ref={navRef}
        className={`nav-link ${open ? 'nav-link--open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="nav-indicator" ref={indicatorRef} aria-hidden="true" />
        <div className="nav-mobile">
          {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            data-label={link.label}
            className={`nav-link-item ${active === link.label ? 'nav-link-item--active' : ''}`}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
        </div>
      </nav>

      <div className="nav-actions">
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark mystic' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'Dark Mystic' : 'Light'} Mode`}
        >
          <span className="theme-toggle-ring" aria-hidden="true" />
          <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {theme === 'light' ? (
              // Mystic Moon / Eye closed
              <>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
              </>
            ) : (
              // Mystic Solar / Eye of Agamotto open
              <>
                <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.2" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </>
            )}
          </svg>
        </button>

        <button
          type="button"
          className={`nav-toggle ${open ? 'nav-toggle--open' : ''}`}
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span />
          <span />
        </button>

          <button
            type="button"
            className="nav-close"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="3" x2="17" y2="17" />
              <line x1="3" y1="17" x2="17" y2="3" />
            </svg>
          </button>
      </div>
      {open && <div className="nav-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
    </div>
  );
}
