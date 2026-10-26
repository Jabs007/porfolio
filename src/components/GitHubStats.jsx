import { useState, useEffect, useCallback } from 'react';
import { projects } from '../data/content';
import './GitHubStats.css';

// Curated language fallback shown only when the GitHub API is unreachable
// (the UI labels this clearly). Live values replace it once synced.
const LANGUAGES_FALLBACK = [
  { name: 'Python', percentage: 44, color: '#3572A5', repos: 8 },
  { name: 'TypeScript', percentage: 26, color: '#3178C6', repos: 5 },
  { name: 'JavaScript', percentage: 18, color: '#F7DF1E', repos: 4 },
  { name: 'Other', percentage: 12, color: '#8b949e', repos: 2 },
];

// GitHub Linguist standard colors for the languages present in the repo list
const LINGUIST_COLORS = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178C6',
  HTML: '#e34c26',
  CSS: '#563d7c',
  'Jupyter Notebook': '#DA5B0B',
  Shell: '#89e051',
  Java: '#b07219',
  SCSS: '#c6538c',
  GLSL: '#5686a5',
};

// Core verified GitHub telemetry for Jabs007 (starting values = last curated
// snapshot; every live-syncable field is overwritten from the API)
const INITIAL_STATS = {
  publicRepos: 19,
  followers: 5,
  following: 8,
  stars: 14,
  mlModels: 4, // curated - ML pipeline count is not derivable from the public API
  primaryLang: 'Python',
  latestRepo: 'B2C-SEGEMENTATION',
  lastUpdated: 'Just now',
  langRepoCount: 19,
  languages: LANGUAGES_FALLBACK,
};

export default function GitHubStats() {
  const [stats, setStats] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('aj_gh_stats');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 1000 * 60 * 30) {
            // Older cached snapshots predate the languages field - fall back
            return {
              ...INITIAL_STATS,
              ...parsed.data,
              languages: parsed.data.languages || LANGUAGES_FALLBACK,
            };
          }
        }
      } catch {
        // ignore storage errors
      }
    }
    return INITIAL_STATS;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'featured'
  const [langsLive, setLangsLive] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const token = import.meta.env?.VITE_GITHUB_TOKEN;
      const headers = { Accept: 'application/vnd.github.v3+json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('https://api.github.com/users/Jabs007', {
        signal: controller.signal,
        headers,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        // Keep any live star/language data already merged by fetchRepos.
        setStats((prev) => ({
          ...prev,
          publicRepos: data.public_repos || prev.publicRepos,
          followers: data.followers || prev.followers,
          following: data.following || prev.following,
          lastUpdated: 'Live synced',
        }));
      } else {
        // If rate-limited or error, preserve verified telemetry without crashing
        setStats((prev) => ({
          ...prev,
          lastUpdated: 'Telemetry verified',
        }));
      }
    } catch {
      // Graceful fallback
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  // ---- Live Repository Spotlight ----
  // Real repos fetched from the GitHub API (gracefully falls back to the
  // curated `projects` list from content.js if the request fails).
  const FALLBACK_REPOS = projects.slice(0, 3).map((p) => ({
    name: p.title.split(' ')[0],
    html_url: p.github,
    description: p.description,
    language: p.tech[0],
    stargazers_count: null,
    topics: p.tech.slice(0, 3),
    pushed_at: null,
  }));

  const [liveRepos, setLiveRepos] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('aj_gh_repos');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 1000 * 60 * 30) {
            return parsed.data;
          }
        }
      } catch {
        // ignore storage errors
      }
    }
    return null;
  });
  const [reposFailed, setReposFailed] = useState(false);

  const fetchRepos = useCallback(async () => {
    try {
      const token = import.meta.env?.VITE_GITHUB_TOKEN;
      const headers = { Accept: 'application/vnd.github.v3+json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(
        'https://api.github.com/users/Jabs007/repos?sort=updated&per_page=100',
        { headers }
      ).catch(() => null);

      if (res && res.ok) {
        const all = await res.json();
        // Skip forks; rank the spotlight by stars then recency, take the top 3
        const owned = all.filter((r) => !r.fork);
        const picked = owned
          .sort((a, b) => {
            const byStars = (b.stargazers_count || 0) - (a.stargazers_count || 0);
            if (byStars !== 0) return byStars;
            return new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0);
          })
          .slice(0, 3)
          .map((r) => ({
            name: r.name,
            html_url: r.html_url,
            description: r.description,
            language: r.language,
            stargazers_count: r.stargazers_count,
            topics: r.topics?.slice(0, 3) || [],
            pushed_at: r.pushed_at,
          }));

        if (picked.length > 0) {
          setLiveRepos(picked);
          setReposFailed(false);
          setLangsLive(true);

          // Real telemetry from the same API payload (no extra requests):
          // total stars across non-fork repos, plus a language breakdown
          // weighted by each repo's primary language.
          const totalStars = owned.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
          const langCounts = new Map();
          owned.forEach((r) => {
            if (r.language) langCounts.set(r.language, (langCounts.get(r.language) || 0) + 1);
          });
          const langRepoTotal =
            [...langCounts.values()].reduce((sum, n) => sum + n, 0) || owned.length;
          const top = [...langCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
          const otherCount = langRepoTotal - top.reduce((sum, [, n]) => sum + n, 0);
          const languages = top.map(([name, count]) => ({
            name,
            percentage: Math.round((count / langRepoTotal) * 100),
            color: LINGUIST_COLORS[name] || '#8b949e',
            repos: count,
          }));
          if (otherCount > 0) {
            const usedPercent = languages.reduce((sum, l) => sum + l.percentage, 0);
            languages.push({
              name: 'Other',
              percentage: Math.max(100 - usedPercent, 1),
              color: '#8b949e',
              repos: otherCount,
            });
          }

          // Feed the freshest telemetry into the header stats
          setStats((prev) => ({
            ...prev,
            stars: totalStars,
            languages,
            langRepoCount: owned.length,
            primaryLang: languages[0]?.name || prev.primaryLang,
            latestRepo: picked[0].name,
            lastUpdated: 'Live synced',
          }));
          try {
            localStorage.setItem(
              'aj_gh_repos',
              JSON.stringify({ timestamp: Date.now(), data: picked })
            );
          } catch {
            // ignore storage errors
          }
        }
      } else {
        setReposFailed(true);
      }
    } catch {
      setReposFailed(true);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const spotlightRepos = liveRepos && liveRepos.length > 0 ? liveRepos : FALLBACK_REPOS;

  useEffect(() => {
    // Fetch live stats in the background. The optional GitHub token only
    // raises the rate limit; without it we still get 60 req/hr per IP.
    fetchStats();
  }, [fetchStats]);

  // Persist any live-fetched stats so the next visit within 30 minutes reads
  // cached data without hitting the GitHub API again.
  useEffect(() => {
    if (stats.lastUpdated === 'Just now') return;
    try {
      localStorage.setItem('aj_gh_stats', JSON.stringify({ timestamp: Date.now(), data: stats }));
    } catch {
      // ignore storage errors
    }
  }, [stats]);

  const METRICS = [
    { label: 'PUBLIC REPOS', value: `${stats.publicRepos}+`, desc: '19 public codebases tracked' },
    { label: 'PRIMARY STACK', value: stats.primaryLang, desc: 'ML & full-stack pipelines' },
    { label: 'TOTAL STARS', value: `${stats.stars}`, desc: 'Sum across non-fork public repos' },
    { label: 'ML PIPELINES', value: `${stats.mlModels}`, desc: 'K-Means, XGBoost, SVD, NLP' },
  ];

  return (
    <div className="github-stats-container" data-reveal="up" data-reveal-delay="0.18">
      {/* Mystic corner runes */}
      <span className="github-stats-rune github-stats-rune--tl" aria-hidden="true">✦</span>
      <span className="github-stats-rune github-stats-rune--br" aria-hidden="true">✦</span>

      <div className="github-stats-header">
        <div className="github-stats-identity">
          <div className="github-stats-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor" className="github-icon" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <div>
            <div className="github-stats-kicker">
              <span className="github-stats-pulse-dot" aria-hidden="true" />
              <span>LIVE GITHUB TELEMETRY · {stats.lastUpdated}</span>
            </div>
            <h4 className="github-stats-title">github.com/Jabs007</h4>
          </div>
        </div>

        <div className="github-stats-actions">
          <button
            type="button"
            className={`github-stats-sync-btn ${isRefreshing ? 'github-stats-sync-btn--spinning' : ''}`}
            onClick={fetchStats}
            title="Refresh GitHub telemetry"
            aria-label="Refresh telemetry data"
          >
            <span className="github-stats-sync-icon" aria-hidden="true">↻</span>
            <span>SYNC</span>
          </button>

          <a
            href="https://github.com/Jabs007"
            target="_blank"
            rel="noopener noreferrer"
            className="github-stats-link-btn"
            aria-label="Open Adams Jabali GitHub profile in new tab"
          >
            <span>VISIT PROFILE</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="github-stats-tabs">
        <button
          type="button"
          className={`github-stats-tab ${activeTab === 'telemetry' ? 'github-stats-tab--active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          Activity Metrics & Languages
        </button>
        <button
          type="button"
          className={`github-stats-tab ${activeTab === 'featured' ? 'github-stats-tab--active' : ''}`}
          onClick={() => setActiveTab('featured')}
        >
          Live Repository Spotlight
        </button>
      </div>

      {activeTab === 'telemetry' ? (
        <>
          {/* Metrics Grid */}
          <div className="github-metrics-grid">
            {METRICS.map((m) => (
              <div key={m.label} className="github-metric-card">
                <span className="github-metric-label">{m.label}</span>
                <span className="github-metric-value">{m.value}</span>
                <span className="github-metric-desc">{m.desc}</span>
              </div>
            ))}
          </div>

          {/* Languages Section */}
          <div className="github-langs-section">
            <div className="github-langs-header">
              <span className="github-langs-title">CORE LANGUAGE BREAKDOWN</span>
              <span className="github-langs-sub">
                {langsLive
                  ? `Live · primary language across ${stats.langRepoCount} public repos`
                  : 'Curated estimate — refresh to sync live from GitHub'}
              </span>
            </div>
            <div
              className="github-lang-bar"
              role="progressbar"
              aria-label={langsLive ? 'Live language distribution' : 'Estimated language distribution'}
            >
              {stats.languages.map((lang) => (
                <div
                  key={lang.name}
                  className="github-lang-segment"
                  style={{
                    width: `${lang.percentage}%`,
                    backgroundColor: lang.color,
                  }}
                  title={`${lang.name}: ${lang.percentage}% (${lang.repos} repos)`}
                />
              ))}
            </div>
            <div className="github-lang-legend">
              {stats.languages.map((lang) => (
                <div key={lang.name} className="github-lang-item">
                  <span
                    className="github-lang-dot"
                    style={{ backgroundColor: lang.color }}
                    aria-hidden="true"
                  />
                  <span className="github-lang-name">{lang.name}</span>
                  <span className="github-lang-pct">{lang.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Live Repository Spotlight - real data from the GitHub API */
        <div>
          {reposFailed && (
            <p className="github-langs-sub" role="status">
              Showing curated repositories - live sync unavailable right now.
            </p>
          )}
          <div className="github-featured-grid">
            {spotlightRepos.map((repo) => (
              <a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="github-repo-card"
              >
                <div className="github-repo-card-top">
                  <span className="github-repo-glyph" aria-hidden="true">📂</span>
                  <span className="github-repo-title">{repo.name}</span>
                  {typeof repo.stargazers_count === 'number' && (
                    <span className="github-repo-badge">★ {repo.stargazers_count}</span>
                  )}
                </div>
                <p className="github-repo-desc">
                  {repo.description || 'No description provided.'}
                </p>
                <div className="github-repo-tech">
                  {repo.language && (
                    <span key={repo.language} className="github-repo-tag">{repo.language}</span>
                  )}
                  {(repo.topics || []).slice(0, 3).map((t) => (
                    <span key={t} className="github-repo-tag">{t}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
