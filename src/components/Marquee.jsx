import { marquee } from '../data/content';
import './Marquee.css';

export default function Marquee({ reverse = false }) {
  return (
    <div
      className={`marquee ${reverse ? 'marquee--reverse' : ''}`}
      aria-hidden="true"
    >
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div className="marquee-group" key={copy}>
            {marquee.map((word) => (
              <span className="marquee-item" key={word}>
                {word}
                <span className="marquee-sep">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
