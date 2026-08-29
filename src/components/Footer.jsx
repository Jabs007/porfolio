import { useState, useEffect } from 'react';
import './Footer.css';

export default function MainFooter() {
  const [time, setTime] = useState('');

  // Nairobi Time (EAT, UTC+3)
  useEffect(() => {
    const updateTime = () => {
      const options = {
        timeZone: 'Africa/Nairobi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setTime(new Intl.DateTimeFormat('en-US', options).format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" role="contentinfo">
      {/* Mystic top border glow */}
      <div className="footer-top-glow" aria-hidden="true" />

      <div className="footer-content section-container">
        {/* Giant footer statement */}
        <div className="footer-hero" data-reveal="up">
          <span className="footer-kicker">DIMENSIONAL SANCTUM</span>
          <h2 className="footer-big-title">
            LET'S CONJURE SOMETHING <span className="footer-title-accent">EXTRAORDINARY</span>
          </h2>
          <p className="footer-quote">
            "The language of the mystic arts is as old as the world itself, in software every function is an incantation."
          </p>
        </div>

        {/* Multi-column navigation and info grid */}
        <div className="footer-grid" data-reveal="up" data-reveal-delay="0.12">
          {/* Col 1: Identity & Status */}
          <div className="footer-col footer-col--brand">
            <div className="footer-logo">adams.dev</div>
            <p className="footer-bio">
              Software Engineer & Data Scientist specializing in ML engineering, scalable distributed architectures, and interactive digital experiences.
            </p>
            <div className="footer-status-pill">
              <span className="footer-status-dot" aria-hidden="true" />
              <span>Available for Hire & Internships</span>
            </div>
            <div className="footer-time-pill">
              <span className="footer-time-glyph" aria-hidden="true">⏱</span>
              <span>Nairobi (EAT): <strong>{time || '12:00:00 PM'}</strong></span>
            </div>
          </div>

          {/* Col 2: Dimensional Sections */}
          <div className="footer-col">
            <h5 className="footer-col-title">SECTIONS</h5>
            <ul className="footer-nav-list">
              <li><a href="#about" className="footer-nav-link">01 / About & CV</a></li>
              <li><a href="#projects" className="footer-nav-link">02 / Selected Work</a></li>
              <li><a href="#techstack" className="footer-nav-link">03 / Tech Stack</a></li>
              <li><a href="#experience" className="footer-nav-link">04 / Experience</a></li>
              <li><a href="#contact" className="footer-nav-link">05 / Contact & Direct Mail</a></li>
            </ul>
          </div>

          {/* Col 3: Key Repositories */}
          <div className="footer-col">
            <h5 className="footer-col-title">FEATURED REPOS</h5>
            <ul className="footer-nav-list">
              <li>
                <a href="https://github.com/Jabs007/B2C-SEGEMENTATION" target="_blank" rel="noopener noreferrer" className="footer-nav-link">
                  B2C Segmentation Platform <span aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a href="https://github.com/Jabs007/loan-default-prediction" target="_blank" rel="noopener noreferrer" className="footer-nav-link">
                  Credit Risk ML Predictor <span aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a href="https://github.com/Jabs007/dashboard" target="_blank" rel="noopener noreferrer" className="footer-nav-link">
                  KUCCPS Placement BI <span aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a href="https://github.com/Jabs007/group-4" target="_blank" rel="noopener noreferrer" className="footer-nav-link">
                  CF Recommender Lab <span aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Connect Channels */}
          <div className="footer-col">
            <h5 className="footer-col-title">DIRECT CHANNELS</h5>
            <ul className="footer-nav-list">
              <li>
                <a href="mailto:adamsjabali9@gmail.com" className="footer-nav-link">
                  adamsjabali9@gmail.com <span aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a href="tel:+254740470067" className="footer-nav-link">
                  +254 740 470 067 <span aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/in/adams-jabali-880377371" target="_blank" rel="noopener noreferrer" className="footer-nav-link">
                  LinkedIn Profile <span aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a href="https://github.com/Jabs007" target="_blank" rel="noopener noreferrer" className="footer-nav-link">
                  GitHub Profile <span aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Back to top */}
        <div className="footer-bottom" data-reveal="up" data-reveal-delay="0.18">
          <div className="footer-copyright">
            <span>© {new Date().getFullYear()} Adams Jabali Momanyi.</span>
            <span className="footer-built-with">
              Crafted with <strong>React 19</strong>, <strong>GSAP</strong>, <strong>Three.js</strong> & <strong>Lenis</strong>.
            </span>
          </div>

          <button
            type="button"
            className="footer-back-to-top"
            onClick={scrollToTop}
            aria-label="Return to the beginning of the timeline"
          >
            <span>ASCEND TO APEX</span>
            <span className="footer-back-to-top-arrow" aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
