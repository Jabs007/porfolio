import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { contact, socials } from '../data/content.js';
import { prefersReducedMotion } from '../utils/motion.js';
import ContactForm from './ContactForm';
import './Contact.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 0740470067 -> 0740 470 067 for the display line; the tel: link keeps the
// international form from the data file.
const phoneDisplay = contact.phone.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');

const SOCIALS = [
  { label: 'GitHub', href: socials.github },
  { label: 'LinkedIn', href: socials.linkedin },
  { label: 'Portfolio', href: socials.portfolio },
];

export default function Contact() {
  const rootRef = useRef(null);
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

  // The desk reads once on entry: the channel rows and the form rise together.
  // Nothing dims or blurs as you scroll past it.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const items = gsap.utils.toArray('.ct-channel, .ct-meta, .ct-form-col', rootRef.current);
      if (!items.length) return;

      gsap.fromTo(
        items,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: { trigger: '.ct-desk', start: 'top 86%', once: true },
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <section id="contact" className="ct-section" ref={rootRef}>
      <div className="section-container">
        <header className="ct-head">
          <span className="section-label" data-reveal="left">
            CONTACT
          </span>
          <h2 className="ct-title" data-reveal="up" data-reveal-delay="0.08">
            {contact.heading[0]} <span className="ct-accent">{contact.heading[1]}</span>
          </h2>
          <p className="ct-sub">{contact.sub}</p>
        </header>

        <div className="ct-desk">
          <div className="ct-channels">
            <div className="ct-channel">
              <span className="ct-channel-label">Email</span>
              <a className="ct-channel-value" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
              <button
                type="button"
                className="ct-copy"
                onClick={handleCopy}
                aria-label="Copy email address"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
              <span className="ct-status" role="status">
                {copied ? 'Email address copied to clipboard' : ''}
              </span>
            </div>

            <div className="ct-channel">
              <span className="ct-channel-label">Phone</span>
              <a className="ct-channel-value" href={`tel:${contact.phoneIntl}`}>
                {phoneDisplay}
              </a>
              <span className="ct-channel-note">Tap to call</span>
            </div>

            <div className="ct-channel">
              <span className="ct-channel-label">Location</span>
              <a
                className="ct-channel-value"
                href={contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contact.location}
                <span className="ct-channel-ext" aria-hidden="true">
                  ↗
                </span>
              </a>
              <span className="ct-channel-note">Open in Maps</span>
            </div>

            <div className="ct-meta">
              <p className="ct-availability">
                <span className="ct-dot" aria-hidden="true" />
                {contact.availability}
              </p>
              <ul className="ct-socials">
                {SOCIALS.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.label}
                      <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ct-form-col">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
