import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SECTION_TITLES = {
  hero: 'Adams Jabali  - Software Engineer & Data Scientist',
  about: 'Adams Jabali  - About & Education',
  projects: 'Adams Jabali  - Selected Projects (6)',
  techstack: 'Adams Jabali  - Tech Stack & Disciplines',
  experience: 'Adams Jabali  - Experience & Timeline',
  contact: 'Adams Jabali  - Contact & Collaboration',
};

const BASE_TITLE = 'Adams Jabali  - Software Engineer & Data Scientist';
const AWAY_TITLE = '⚡ Return to the Sanctum - Adams Jabali';

export default function usePageTitle(ready) {
  useEffect(() => {
    if (!ready) return undefined;

    const sections = Object.keys(SECTION_TITLES);
    let activeSection = 'hero';

    const triggers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      return ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => {
          activeSection = id;
          if (!document.hidden) {
            document.title = SECTION_TITLES[id] || BASE_TITLE;
          }
        },
        onEnterBack: () => {
          activeSection = id;
          if (!document.hidden) {
            document.title = SECTION_TITLES[id] || BASE_TITLE;
          }
        },
      });
    }).filter(Boolean);

    // Tab visibility change (mystic return notice)
    const onVisibilityChange = () => {
      if (document.hidden) {
        document.title = AWAY_TITLE;
      } else {
        document.title = SECTION_TITLES[activeSection] || BASE_TITLE;
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      triggers.forEach((t) => t.kill());
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.title = BASE_TITLE;
    };
  }, [ready]);
}

