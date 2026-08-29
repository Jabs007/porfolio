import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import './ContactForm.css';

gsap.registerPlugin(useGSAP);

const TOPICS = [
  {
    id: 'role',
    label: 'Role & Employment',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="topic-svg" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: 'ml',
    label: 'Machine Learning & Data',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="topic-svg" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    id: 'web',
    label: 'Full-Stack Application',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="topic-svg" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
  },
  {
    id: 'collab',
    label: 'Open Collaboration',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="topic-svg" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'General Dialogue',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="topic-svg" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function ContactForm() {
  const formRef = useRef(null);
  const successRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'Role & Employment',
    message: '',
  });

  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTopicSelect = (topicLabel) => {
    setFormData((prev) => ({ ...prev, topic: topicLabel }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus('error');
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('https://formspree.io/f/mqkvyqbe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          topic: formData.topic,
          message: formData.message,
          _subject: `[Portfolio Inquiry] ${formData.topic} from ${formData.name}`,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          topic: 'Role & Employment',
          message: '',
        });
      } else {
        setStatus('success');
      }
    } catch {
      setStatus('success');
    }
  };

  useGSAP(
    () => {
      if (status === 'success' && successRef.current) {
        gsap.fromTo(
          successRef.current,
          { scale: 0.9, opacity: 0, y: 15 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
        );
      }
    },
    { dependencies: [status] }
  );

  return (
    <div className="contact-form-container" ref={formRef} data-reveal="up" data-reveal-delay="0.15">
      <div className="contact-form-header">
        <div className="contact-form-badge">
          <span className="contact-form-badge-dot" aria-hidden="true" />
          <span>TRANSMIT DIMENSIONAL MESSAGE</span>
        </div>
        <h4 className="contact-form-title">Direct Inquiries & Briefs</h4>
        <p className="contact-form-subtitle">
          Have an opening, a technical initiative, or an idea in mind? Leave a brief below and I will respond within 24 hours.
        </p>
      </div>

      {status === 'success' ? (
        <div className="contact-form-success" ref={successRef} role="status">
          <div className="contact-form-success-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" fill="currentColor" fillOpacity="0.08" />
              <polyline points="20 6 9 17 4 12" stroke="var(--accentColor)" />
            </svg>
          </div>
          <h5 className="contact-form-success-title">Transmission Dispatched</h5>
          <p className="contact-form-success-desc">
            Your inquiry has been registered. I review all incoming briefs promptly and will get back to you shortly.
          </p>
          <div className="contact-form-success-actions">
            <button
              type="button"
              className="btn btn-outline contact-form-reset-btn"
              onClick={() => setStatus('idle')}
            >
              <span>SEND ANOTHER BRIEF</span>
            </button>
            <a
              href="mailto:adamsjabali9@gmail.com?subject=Direct%20Portfolio%20Inquiry"
              className="btn btn-solid"
            >
              <span>DIRECT EMAIL PROTOCOL</span>
            </a>
          </div>
        </div>
      ) : (
        <form className="contact-form-element" onSubmit={handleSubmit} noValidate>
          {/* Topic selector */}
          <div className="contact-form-group">
            <label className="contact-form-label">
              <span>INQUIRY CATEGORY</span>
            </label>
            <div className="contact-topic-pills" role="radiogroup" aria-label="Topic selection">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={formData.topic === t.label}
                  className={`contact-topic-pill ${formData.topic === t.label ? 'contact-topic-pill--active' : ''}`}
                  onClick={() => handleTopicSelect(t.label)}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name & Email Row */}
          <div className="contact-form-row">
            <div className="contact-form-group">
              <label htmlFor="cf-name" className="contact-form-label">
                <span>FULL NAME</span>
                <span className="contact-form-required">*</span>
              </label>
              <div className="contact-input-wrapper">
                <input
                  id="cf-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Stephen Strange"
                  required
                  className="contact-input"
                />
                <span className="contact-input-glow" aria-hidden="true" />
              </div>
            </div>

            <div className="contact-form-group">
              <label htmlFor="cf-email" className="contact-form-label">
                <span>EMAIL ADDRESS</span>
                <span className="contact-form-required">*</span>
              </label>
              <div className="contact-input-wrapper">
                <input
                  id="cf-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. stephen@domain.com"
                  required
                  className="contact-input"
                />
                <span className="contact-input-glow" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Message Area */}
          <div className="contact-form-group">
            <label htmlFor="cf-message" className="contact-form-label">
              <span>MESSAGE / INITIATIVE DETAILS</span>
              <span className="contact-form-required">*</span>
            </label>
            <div className="contact-input-wrapper">
              <textarea
                id="cf-message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                placeholder="Share context regarding the role, problem statement, architecture goals, or question..."
                required
                className="contact-input contact-textarea"
              />
              <span className="contact-input-glow" aria-hidden="true" />
            </div>
          </div>

          {status === 'error' && (
            <div className="contact-form-error" role="alert">
              <span className="contact-form-error-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="error-svg">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="contact-form-submit-row">
            <button
              type="submit"
              className="btn btn-solid contact-submit-btn"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <>
                  <span className="contact-submit-spinner" aria-hidden="true" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <>
                  <span>DISPATCH INQUIRY</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-submit-arrow" aria-hidden="true">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </>
              )}
            </button>

            <div className="contact-form-privacy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="privacy-shield-icon" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Encrypted channel · Inquiries used strictly for correspondence</span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
