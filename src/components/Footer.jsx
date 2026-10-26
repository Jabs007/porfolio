import { useEffect, useState } from 'react';
import { contact, projects, socials } from '../data/content.js';
import './Footer.css';

const NAME = 'Adams Jabali Momanyi';
const ROLE = 'Software Engineer & Data Scientist';

const SECTIONS = [
  { id: 'about', num: '01', label: 'About & CV' },
  { id: 'projects', num: '02', label: 'Selected Work' },
  { id: 'techstack', num: '03', label: 'Tech Stack' },
  { id: 'experience', num: '04', label: 'Experience' },
  { id: 'contact', num: '05', label: 'Contact' },
];

// Featured repositories, with URLs taken from the project data rather than
// repeated here. Labels stay short so the column reads as an index.
const FEATURED = [
  { id: 1, label: 'B2C Segmentation Platform' },
  { id: 5, label: 'Credit Risk ML Predictor' },
  { id: 2, label: 'KUCCPS Placement BI' },
  { id: 6, label: 'CF Recommender Lab' },
].map(({ id, label }) => {
  const project = projects.find((p) => p.id === id);
  return { label, href: project.github };
});

// +254740470067 -> +254 740 470 067 for display; the tel: link keeps the raw form.
const phoneDisplay = contact.phoneIntl.replace(/^(\+254)(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3 $4');

const CHANNELS = [
  { label: contact.email, href: `mailto:${contact.email}` },
  { label: phoneDisplay, href: `tel:${contact.phoneIntl}` },
  { label: 'LinkedIn', href: socials.linkedin },
  { label: 'GitHub', href: socials.github },
];

const CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Nairobi',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export default function MainFooter() {
  const [time, setTime] = useState(() => CLOCK.format(new Date()));

  useEffect(() => {
    const interval = setInterval(() => setTime(CLOCK.format(new Date())), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="ft">
      <div className="section-container">
        <div className="ft-top">
          <div className="ft-identity">
            <h2 className="ft-name">{NAME}</h2>
            <p className="ft-role">{ROLE}</p>
          </div>

          <div className="ft-status">
            <p className="ft-availability">
              <span className="ft-dot" aria-hidden="true" />
              {contact.availability}
            </p>
            <p className="ft-clock">
              Nairobi (EAT) · <span className="ft-clock-value">{time}</span>
            </p>
          </div>
        </div>

        <div className="ft-grid">
          <nav className="ft-col" aria-label="Footer sections">
            <h3 className="ft-col-title">Sections</h3>
            <ul className="ft-list">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a className="ft-link" href={`#${section.id}`}>
                    <span className="ft-num">{section.num}</span>
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ft-col">
            <h3 className="ft-col-title">Featured repos</h3>
            <ul className="ft-list">
              {FEATURED.map((repo) => (
                <li key={repo.href}>
                  <a className="ft-link" href={repo.href} target="_blank" rel="noopener noreferrer">
                    {repo.label}
                    <span className="ft-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="ft-col">
            <h3 className="ft-col-title">Direct channels</h3>
            <ul className="ft-list">
              {CHANNELS.map((channel) => (
                <li key={channel.label}>
                  <a
                    className="ft-link"
                    href={channel.href}
                    {...(channel.href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {channel.label}
                    {channel.href.startsWith('http') && (
                      <span className="ft-arrow" aria-hidden="true">
                        ↗
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ft-bottom">
          <p className="ft-fine">
            © {new Date().getFullYear()} {NAME}
          </p>
          <p className="ft-fine">
            Built with React 19, GSAP, Three.js &amp; Lenis
          </p>
          <a className="ft-top-link" href="#hero">
            Back to top
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
