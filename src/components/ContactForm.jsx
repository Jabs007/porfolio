import { useEffect, useRef, useState } from 'react';
import './ContactForm.css';

const ENDPOINT = 'https://formspree.io/f/mqkvyqbe';
const DIRECT_EMAIL = 'adamsjabali9@gmail.com';

const TOPICS = [
  { id: 'role', label: 'Role & Employment' },
  { id: 'ml', label: 'Machine Learning & Data' },
  { id: 'web', label: 'Full-Stack Application' },
  { id: 'collab', label: 'Open Collaboration' },
  { id: 'chat', label: 'General Dialogue' },
];

const EMPTY = { name: '', email: '', topic: TOPICS[0].label, message: '' };

export default function ContactForm() {
  const successRef = useRef(null);
  const [formData, setFormData] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorKind, setErrorKind] = useState(null); // validate | send
  const [errorMessage, setErrorMessage] = useState('');
  const [sentTo, setSentTo] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorKind('validate');
      setErrorMessage('Please fill in your name, email and message.');
      setStatus('error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorKind('validate');
      setErrorMessage('That email address does not look right.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          topic: formData.topic,
          message: formData.message,
          _subject: `[Portfolio Inquiry] ${formData.topic} from ${formData.name}`,
        }),
      });

      if (!response.ok) throw new Error('Request rejected');

      setSentTo(formData.email);
      setFormData(EMPTY);
      setStatus('success');
    } catch {
      // A failed send is reported as a failure - never as a success.
      setErrorKind('send');
      setErrorMessage("The message didn't send.");
      setStatus('error');
    }
  };

  // Move focus to the confirmation so keyboard and screen-reader users land
  // on the result instead of at the top of the replaced form.
  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const isBlank = (field) =>
    status === 'error' && errorKind === 'validate' && !formData[field].trim();

  return (
    <div className="cf">
      <header className="cf-head">
        <h3 className="cf-title">Send a brief</h3>
        <p className="cf-sub">
          An opening, a project, or a question — tell me what you have in mind and I will reply
          within 24 hours.
        </p>
      </header>

      {status === 'success' ? (
        <div className="cf-success" ref={successRef} tabIndex={-1}>
          <h4 className="cf-success-title">Message sent</h4>
          <p className="cf-success-copy">
            Thanks — I received it and will reply
            {sentTo ? (
              <>
                {' '}
                to <span className="cf-success-mail">{sentTo}</span>
              </>
            ) : null}{' '}
            within 24 hours.
          </p>
          <div className="cf-success-actions">
            <button type="button" className="cf-btn cf-btn--ghost" onClick={() => setStatus('idle')}>
              Send another
            </button>
            <a className="cf-btn cf-btn--solid" href={`mailto:${DIRECT_EMAIL}`}>
              Email me directly
            </a>
          </div>
        </div>
      ) : (
        <form className="cf-form" onSubmit={handleSubmit} noValidate>
          <fieldset className="cf-field cf-field--topics">
            <legend className="cf-label">This is about</legend>
            <div className="cf-chips">
              {TOPICS.map((topic) => (
                <div className="cf-chip" key={topic.id}>
                  <input
                    type="radio"
                    id={`cf-topic-${topic.id}`}
                    name="topic"
                    value={topic.label}
                    checked={formData.topic === topic.label}
                    onChange={handleChange}
                    className="cf-chip-input"
                  />
                  <label htmlFor={`cf-topic-${topic.id}`} className="cf-chip-label">
                    {topic.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="cf-row">
            <div className="cf-field">
              <label htmlFor="cf-name" className="cf-label">
                Name <span className="cf-req">*</span>
              </label>
              <input
                id="cf-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                aria-invalid={isBlank('name')}
                className="cf-input"
              />
            </div>

            <div className="cf-field">
              <label htmlFor="cf-email" className="cf-label">
                Email <span className="cf-req">*</span>
              </label>
              <input
                id="cf-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@domain.com"
                required
                aria-invalid={
                  status === 'error' &&
                  errorKind === 'validate' &&
                  (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                }
                className="cf-input"
              />
            </div>
          </div>

          <div className="cf-field">
            <label htmlFor="cf-message" className="cf-label">
              Message <span className="cf-req">*</span>
            </label>
            <textarea
              id="cf-message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              placeholder="Context, scope, timeline — whatever helps me reply usefully."
              required
              aria-invalid={isBlank('message')}
              className="cf-input cf-textarea"
            />
          </div>

          {status === 'error' && (
            <div className="cf-error" role="alert">
              <p className="cf-error-text">
                {errorMessage}
                {errorKind === 'send' ? ' Please try again, or email me directly.' : ''}
              </p>
              {errorKind === 'send' && (
                <a className="cf-error-link" href={`mailto:${DIRECT_EMAIL}`}>
                  {DIRECT_EMAIL}
                </a>
              )}
            </div>
          )}

          <div className="cf-actions">
            <button type="submit" className="cf-btn cf-btn--solid" disabled={status === 'submitting'}>
              {status === 'submitting' ? (
                <>
                  <span className="cf-spinner" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                'Send message'
              )}
            </button>
            <p className="cf-note">Your details are only used to reply.</p>
          </div>
        </form>
      )}
    </div>
  );
}
