# PORTFOLIO2

A modern, dark glassmorphism-themed portfolio built with React, Vite, and GSAP.

## Overview

PORTFOLIO2 is a visually striking personal portfolio featuring dark glassmorphism aesthetics with cyan/teal accent (#6ee7b7) on a dark backdrop. The design emphasizes depth, blur effects, and interactive elements that respond to user input and motion preferences.

## Features

- **Dark Glassmorphism Theme** — Frosted glass effects with cyan/teal accent (#6ee7b7) on a dark backdrop
- **Six Interactive Sections** — About, Projects, Tech Stack, Experience, Contact, and Footer
- **Lenis Smooth Scrolling** — Natural, momentum-based scrolling via the useLenis hook
- **GSAP Animations** — Portal effects, orbital animations, and scroll-triggered interactions
- **Reduced Motion Support** — Fully respects the prefers-reduced-motion media query
- **Custom Cursor** — Follow-based cursor with hover states
- **GitHub Stats Integration** — Displays repository metrics with animated counters
- **Marquee Scroll** — Horizontal scrolling marquee for section navigation

## Tech Stack

- React 18 + Vite 6
- GSAP (GreenSock Animation Platform) for animations
- Lenis for smooth scrolling
- React IntersectionObserver for scroll animations
- CSS custom properties for theming

## Project Structure

```
src/
 components/         # reusable UI components
  ├─ About.jsx        # About section with orbs
  ├─ Projects.jsx     # Projects grid with hover effects
  ├─ TechStack.jsx    # Technology showcase with SVG glyphs
  ├─ Experience.jsx   # Timeline-style experience
  ├─ Contact.jsx      # Contact form and info
  ├─ Footer.jsx       # Footer links
  └─ ...
 hooks/              # custom React hooks
  ├─ useLenis.js      # smooth scrolling manager
  ├─ useScrollReveals.js  # IntersectionObserver animations
  ├─ usePageTitle.js  # document title management
  ├─ useCinematicScroll.js  # cinematic scroll effects
  └─ useFocusTrap.js  # focus trapping for modals
 data/               # static data sources
  └─ content.js       # project metadata and timeline
 index.css           # global styles with glassmorphism base
```

## Build & Development

```bash
npm install
npm run dev      # start development server
npm run build    # build for production
```

Build targets modern browsers with Vite and outputs optimized static assets.

## License

This project is open source. See the repository for licensing details.
