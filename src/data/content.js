export const hero = {
  name: 'Adams Jabali',
  title: ['CREATIVE', 'DEVELOPER', '& DATA SCIENTIST'],
  // 3D character stage (React Three Fiber). Leave `enabled: false` to keep
  // the site purely 2D; drop a GLB in /public, set enabled + modelUrl and the
  // scroll choreography in useCharacterScroll drives it through the rig
  // (position / rotation / scale / camera / animation mixer time).
  character3d: {
    enabled: false,
    modelUrl: '/character.glb',
  },
  tagline:
    "I'm Adams Jabali, a Software Engineer & Data Scientist specializing in ML Engineering, scalable backend systems, and intelligent applications.",
  availability: 'Available for new opportunities',
  techstack: [
    // First five form the inner core ring; the rest orbit outside.
    // `involvement` powers the Dr. Strange portal card; `repos` link to real GitHub proof.
    // New fields for dimensional portal system:
    //   accent: color used during hover/active state
    //   portalType: visual style when entered (black-hole, component-universe, data-vortex, etc.)
    //   transition: entrance animation style when technology is clicked
    {
      name: 'Python',
      category: 'Languages',
      accent: '#636e72',
      portalType: 'data-vortex',
      transition: 'particle-attraction',
      description: 'Core language for ML pipelines, automation, and backend services.',
      involvement: '6 public repos: Streamlit dashboards, ML recommenders, a loan-default model, and a chatbot.',
      repos: ['dashboard', 'group-4', 'loan-default-prediction', 'chatbot'],
    },
    {
      name: 'JavaScript',
      category: 'Languages',
      accent: '#636e72',
      portalType: 'event-propagation',
      transition: 'pulse-through-nodes',
      description: 'Drives interactive interfaces and full-stack application logic.',
      involvement: 'The engine behind every interactive surface: 7+ repos ship React frontends and Node tooling.',
      repos: ['B2C-SEGEMENTATION', 'eccom', 'jabali-porfolio'],
    },
    {
      name: 'React',
      category: 'Frontend',
      accent: '#A78BFA',
      portalType: 'component-universe',
      transition: 'component-split',
      description: 'Component-based library for fast, interactive user interfaces.',
      involvement: 'Frontend for the B2C segmentation platform, VendorHub e-commerce, and this portfolio.',
      repos: ['B2C-SEGEMENTATION', 'eccom', 'jabali-porfolio'],
    },
    {
      name: 'Node.js',
      category: 'Backend',
      accent: '#A78BFA',
      portalType: 'data-vortex',
      transition: 'pulse-through-nodes',
      description: 'High-performance JavaScript runtime for backend services and tooling.',
      involvement: 'Express + tRPC APIs powering the B2C platform and the VendorHub e-commerce backend.',
      repos: ['B2C-SEGEMENTATION', 'eccom'],
    },
    {
      name: 'SQL',
      category: 'Languages',
      accent: '#636e72',
      portalType: 'data-vault',
      transition: 'grid-implosion',
      description: 'Querying and modeling relational data with precision.',
      involvement: 'Relational modeling behind the B2C platform (HackerRank SQL certified).',
      repos: ['B2C-SEGEMENTATION'],
    },
    {
      name: 'TypeScript',
      category: 'Languages',
      accent: '#A78BFA',
      portalType: 'component-universe',
      transition: 'component-split',
      description: 'Typed JavaScript for safer, scalable frontend and backend code.',
      involvement: 'Primary language across 7 public repos: typed frontends, backends, and tooling.',
      repos: ['B2C-SEGEMENTATION', 'eccom', 'loan-ready', 'jabali-porfolio'],
    },
    {
      name: 'Flask',
      category: 'Backend',
      accent: '#636e72',
      portalType: 'data-vortex',
      transition: 'particle-attraction',
      description: 'Lightweight Python framework for rapid APIs and web services.',
    },
    {
      name: 'FastAPI',
      category: 'Backend',
      accent: '#A78BFA',
      portalType: 'data-vortex',
      transition: 'particle-attraction',
      description: 'Modern async Python framework for high-performance APIs.',
    },
    {
      name: 'TensorFlow',
      category: 'Data & ML',
      accent: '#636e72',
      portalType: 'data-vault',
      transition: 'grid-implosion',
      description: 'End-to-end framework for building and training machine learning models.',
      involvement: 'Model experiments behind career recommendation and loan-default prediction.',
      repos: ['AI-Career-Roadmap-Recommender', 'loan-default-prediction'],
    },
    {
      name: 'scikit-learn',
      category: 'Data & ML',
      accent: '#A78BFA',
      portalType: 'data-vault',
      transition: 'grid-implosion',
      description: 'Classic ML toolkit for modeling, clustering, and evaluation.',
      involvement: 'K-Means + RFM for B2C segmentation; collaborative filtering in the CF Recommender Lab.',
      repos: ['B2C-SEGEMENTATION', 'group-4'],
    },
    {
      name: 'PostgreSQL',
      category: 'Databases',
      accent: '#A78BFA',
      portalType: 'black-hole',
      transition: 'gravity-collapse',
      description: 'Relational database for robust, production-grade storage.',
      involvement: 'Production relational storage for the B2C segmentation platform.',
      repos: ['B2C-SEGEMENTATION'],
    },
    {
      name: 'MongoDB',
      category: 'Databases',
      accent: '#636e72',
      portalType: 'data-vault',
      transition: 'grid-implosion',
      description: 'Flexible NoSQL database for document-driven applications.',
      repos: ['eccom'],
    },
    {
      name: 'Docker',
      category: 'Cloud & DevOps',
      accent: '#636e72',
      portalType: 'black-hole',
      transition: 'gravity-collapse',
      description: 'Containerization for consistent, portable deployments.',
      involvement: 'Containerized builds keep every deployment portable and reproducible.',
    },
    {
      name: 'AWS',
      category: 'Cloud & DevOps',
      accent: '#A78BFA',
      portalType: 'data-vault',
      transition: 'grid-implosion',
      description: 'Cloud infrastructure, compute, and deployment services.',
      involvement: 'AWS Cloud Practitioner certified, covering cloud infrastructure and deployment.',
    },
    {
      name: 'Git',
      category: 'Cloud & DevOps',
      accent: '#636e72',
      portalType: 'branching-timeline',
      transition: 'timeline-split',
      description: 'Version control for collaborative, trackable development.',
      involvement: '19 public repos on GitHub, with every project branched, committed, and version-controlled.',
      repos: ['B2C-SEGEMENTATION', 'dashboard', 'eccom'],
    },
  ],
};

// About section - biography, highlights, and portal cards.
// Card content is drawn from the education / experience / certifications
// arrays below: swap in your real details there and the cards + portals update.
export const about = {
  heading: ['Software Engineer', '& Data Scientist'],
  bio: [
    'Adams Jabali Momanyi is a Software Engineer and Data Scientist based in Nairobi, Kenya, specializing in building scalable backend systems, machine learning pipelines, and full-stack applications.',
    'With hands-on experience in Python, JavaScript, Node.js, Flask, FastAPI, React, and PostgreSQL, Adams focuses on designing robust, secure software solutions, from ML model deployment to RESTful API architecture.',
    'Currently interning at Statsspeak Group Ltd, Adams automates data pipelines, develops ML models, and builds production-ready systems. Previously interned at KUCCPS, contributing to national student placement data systems and governance standards.',
  ],
  highlights: [
    { label: 'LOCATION', value: 'Nairobi, Kenya' },
    { label: 'FOCUS', value: 'ML Engineering & Scalable Systems' },
    { label: 'STATUS', value: 'Open to Internships & Entry-Level Roles' },
  ],
};

export const aboutCards = [
  {
    id: 'education',
    title: 'EDUCATION',
    index: '01',
    summary: 'BSc Data Science, Meru University of Science & Technology',
    accent: '#9fb6ff',
    // Which keys of each education entry to render in the portal list.
    fields: ['degree', 'institution', 'period', 'location'],
  },
  {
    id: 'experience',
    title: 'EXPERIENCE',
    index: '02',
    summary: '2 internships at Statsspeak Group Ltd & KUCCPS',
    accent: '#636e72',
    fields: ['role', 'company', 'period', 'location'],
  },
  {
    id: 'certifications',
    title: 'CERTIFICATIONS',
    index: '03',
    summary: '4 certifications: AWS, HackerRank, Coursera',
    accent: '#ffb45e',
    fields: ['name', 'issuer', 'year'],
  },
];

// CV / Resume - rendered as a wide banner card in About and previewed
// inside the same Dr. Strange portal. The PDF itself lives at cv/CV.pdf
// (imported as a Vite asset in About.jsx), so replacing that file updates
// the site automatically.
export const cv = {
  title: 'CV / RESUME',
  index: '04',
  summary:
    'Preview or download my full curriculum vitae: education, experience, certifications, and skills in one document.',
  accent: '#636e72',
  downloadName: 'Adams-Jabali-CV.pdf',
};

// Projects section - animated cards that open a themed sling-ring portal.
// `color` themes the card (visual, spotlight, tags) AND the portal (accent);
// `icon` is the card's visual glyph (rendered as a themed SVG in Projects.jsx);
// `features` power the portal list.
// `screenshot` (optional): a real product screenshot shown faintly behind the
// glyph. Drop the files into public/screenshots/ with these names - while a
// file is missing, the card silently falls back to the glyph-only look.
export const projects = [
  {
    id: 1,
    title: 'B2C Customer Segmentation & Intelligence Platform',
    category: 'ML PLATFORM',
    domain: 'ml',
    status: 'PRODUCTION ML',
    metric: '4 Clusters · 100K+ Txns',
    icon: 'chart-bars',
    screenshot: '/screenshots/b2c-segmentation.png',
    description:
      'Full-stack ML platform for enterprise customer segmentation using K-Means clustering and RFM analysis. Features React 19 frontend, Express + tRPC typed backend, PostgreSQL relational store, and automated scikit-learn training pipeline.',
    features: [
      'K-Means clustering with automated optimal-K elbow & silhouette evaluation',
      'RFM (Recency, Frequency, Monetary) statistical feature engineering',
      'Interactive cohort explorer built with React 19 and real-time query filters',
      'Express + tRPC type-safe API architecture backed by PostgreSQL',
    ],
    tech: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Python', 'scikit-learn'],
    github: 'https://github.com/Jabs007/B2C-SEGEMENTATION',
    color: '#8b5a2b',
  },
  {
    id: 2,
    title: 'KUCCPS Placement Intelligence Dashboard',
    category: 'DATA SCIENCE & BI',
    domain: 'bi',
    status: 'LIVE DEPLOYMENT',
    metric: '50+ Institutions · Instant KPIs',
    icon: 'chart-line',
    screenshot: '/screenshots/kuccps-dashboard.png',
    description:
      'Interactive data analytics and visual intelligence dashboard for Kenyan national placement records. Delivers multi-tier dynamic filters, automated trend analyses, KPI benchmarking, and CSV batch exports.',
    features: [
      'Interactive Streamlit analytics engine analyzing multi-year placement trends',
      'Dynamic multi-variable filtering with Plotly visual intelligence charts',
      'Automated institutional capacity benchmarking and KPI tracking',
      'Vectorized data processing pipeline powered by Pandas and NumPy',
    ],
    tech: ['Python', 'Streamlit', 'Plotly', 'Pandas', 'NumPy'],
    github: 'https://github.com/Jabs007/dashboard',
    live: 'https://jabs007-dashboard-kuccps-dashboard-mtwg8g.streamlit.app/',
    color: '#c8872a',
  },
  {
    id: 3,
    title: 'VendorHub Multi-Vendor E-Commerce Engine',
    category: 'FULL STACK',
    domain: 'web',
    status: 'LIVE PROTOTYPE',
    metric: 'RBAC Security · Sub-60ms API',
    icon: 'shopping-cart',
    screenshot: '/screenshots/vendorhub.png',
    description:
      'Scalable multi-vendor marketplace architecture engineered with React, Node.js, Express, and MongoDB. Implements role-based access control, secure JWT authentication, inventory lifecycle pipelines, and cart persistence.',
    features: [
      'Role-based multi-vendor catalog management and merchant dashboards',
      'Stateless JWT session authentication with argon2 password hashing',
      'Scalable MongoDB document schemas for products, inventory, and orders',
      'Modern responsive client interface with real-time checkout state',
    ],
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'REST API'],
    github: 'https://github.com/Jabs007',
    color: '#f59e0b',
  },
  {
    id: 4,
    title: 'AI Career Roadmap & Curriculum Recommender',
    category: 'AI & EDTECH',
    domain: 'ml',
    status: 'OPEN SOURCE',
    metric: 'NLP Matching · Custom Roadmaps',
    icon: 'compass',
    screenshot: '/screenshots/career-recommender.png',
    description:
      'NLP-driven career matching and course guidance engine for university graduates. Leverages TF-IDF vectorization and cosine similarity to map student academic profiles to personalized industry skill roadmaps.',
    features: [
      'TF-IDF text vectorization and semantic matching of student competencies',
      'Automated prerequisite validation against university program criteria',
      'Dynamic progression roadmap generator for technical disciplines',
      'scikit-learn inference pipeline integrated into an interactive web UI',
    ],
    tech: ['Python', 'NLP', 'scikit-learn', 'Streamlit', 'Pandas'],
    github: 'https://github.com/Jabs007',
    color: '#38bdf8',
  },
  {
    id: 5,
    title: 'Credit Risk & Loan Default Neural Predictor',
    category: 'MACHINE LEARNING',
    domain: 'ml',
    status: 'PRODUCTION ML',
    metric: '94.2% ROC-AUC · Real-Time Scoring',
    icon: 'shield-check',
    screenshot: '/screenshots/loan-default.png',
    description:
      'Predictive machine learning pipeline designed to assess retail borrower risk and predict default probability. Implements automated outlier handling, SMOTE class balancing, and ensemble gradient boosting with explainable SHAP metrics.',
    features: [
      '94.2% ROC-AUC predictive performance with XGBoost and Random Forest ensembles',
      'Automated data preprocessing, categorical encoding, and SMOTE oversampling',
      'SHAP value feature explainability for regulatory credit compliance',
      'REST API microservice for real-time sub-30ms credit score evaluation',
    ],
    tech: ['Python', 'scikit-learn', 'XGBoost', 'SHAP', 'FastAPI', 'Pandas'],
    github: 'https://github.com/Jabs007/loan-default-prediction',
    color: '#22c55e',
  },
  {
    id: 6,
    title: 'Real-Time Collaborative Filtering Lab',
    category: 'DATA SCIENCE & BI',
    domain: 'bi',
    status: 'RESEARCH & LAB',
    metric: 'Matrix Factorization · SVD Engine',
    icon: 'cpu',
    screenshot: '/screenshots/cf-lab.png',
    description:
      'Matrix factorization and collaborative filtering engine engineered to model high-dimensional sparse user-item interaction matrices. Features Singular Value Decomposition (SVD), cosine item similarity, and containerized deployment.',
    features: [
      'Singular Value Decomposition (SVD) and Alternating Least Squares (ALS) models',
      'Item-item and user-user cosine similarity matrix indexing',
      'High-throughput sparse matrix operations utilizing SciPy and NumPy',
      'Containerized with Docker for reproducible inference benchmarking',
    ],
    tech: ['Python', 'SciPy', 'NumPy', 'Docker', 'FastAPI', 'scikit-learn'],
    github: 'https://github.com/Jabs007/group-4',
    color: '#a855f7',
  },
];

export const experience = [
  {
    id: 1,
    role: 'Software Engineer Intern / Automation Engineer',
    company: 'Statsspeak Group Ltd',
    location: 'Nairobi, Kenya',
    period: 'May 2025 - Present',
    type: 'work',
    details: [
      'Developed Python-based automation scripts to streamline data pipelines',
      'Implemented and tested ML models with appropriate evaluation metrics',
      'Conducted EDA on large datasets to identify trends and actionable insights',
      'Created data visualizations and reports for technical and non-technical stakeholders',
      'Used Apache Airflow for managing automated data workflows',
    ],
  },
  {
    id: 2,
    role: 'ICT Intern',
    company: 'KUCCPS',
    location: 'Nairobi, Kenya',
    period: 'April - August 2025',
    type: 'work',
    details: [
      'Assisted in data cleaning, validation, and processing of student placement records',
      'Supported database integrity and secure data handling practices',
      'Provided ICT troubleshooting and user support for internal users',
      'Gained exposure to government data governance standards',
    ],
  },
];

export const education = [
  {
    id: 1,
    degree: 'Bachelor of Science in Data Science',
    institution: 'Meru University of Science and Technology',
    location: 'Meru, Kenya',
    period: 'Expected Graduation: October 2026',
    type: 'education',
  },
  {
    id: 2,
    degree: 'High School (KCSE B-)',
    institution: 'Nyambaria Boys High School',
    location: 'Kenya',
    period: '',
    type: 'education',
  },
];

export const certifications = [
  { name: 'Python (Basic)', issuer: 'HackerRank', year: '2024' },
  { name: 'SQL (Basic)', issuer: 'HackerRank', year: '2024' },
  { name: 'Machine Learning', issuer: 'Coursera', year: '2025' },
  { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', year: '2025' },
];

export const skills = [
  'Python',
  'JavaScript',
  'TypeScript',
  'SQL',
  'Node.js',
  'Flask',
  'FastAPI',
  'React',
  'TensorFlow',
  'scikit-learn',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'AWS',
  'Git',
];

export const marquee = [
  'SOFTWARE ENGINEER',
  'DATA SCIENTIST',
  'ML ENGINEERING',
  'FULL-STACK DEVELOPMENT',
  'BACKEND SYSTEMS',
  'NLP & AI',
];

export const socials = {
  github: 'https://github.com/Jabs007',
  linkedin: 'https://linkedin.com/in/adams-jabali-880377371',
  email: 'mailto:adamsjabali9@gmail.com',
  portfolio: 'https://jabali-porfolio.vercel.app/',
};

// Contact section - reach-out channels. Phone keeps the local display format
// (0740...) while the tel: link uses the international form (+254...).
export const contact = {
  heading: ["LET'S BUILD", 'SOMETHING GREAT'],
  sub: 'Have a project, an internship opportunity, or just a question? My inbox is always open. I reply within 24 hours.',
  email: 'adamsjabali9@gmail.com',
  phone: '0740470067',
  phoneIntl: '+254740470067',
  location: 'Nairobi, Kenya',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Nairobi%2C%20Kenya',
  availability: 'Available for internships & entry-level roles',
};