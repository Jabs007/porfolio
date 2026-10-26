import { useCallback, useEffect, useState } from 'react';
import './GitHubStats.css';

const USER = 'Jabs007';
const REPOS_URL = `https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`;
const CACHE_KEY = 'aj_gh_ledger';
const CACHE_TTL = 1000 * 60 * 30;

// GitHub Linguist standard colors for the languages present in this account.
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

// Measured snapshot of the public account (Aug 2026): 21 non-fork repos,
// 1 star total, primary language across the 19 language-tagged repos:
// Python 7 · TypeScript 7 · HTML 3 · JavaScript 1 · Jupyter 1.
// Every field except `mlModels` is replaced by live API data on sync.
const SNAPSHOT = {
  publicRepos: 21,
  stars: 1,
  primaryLang: 'Python',
  mlModels: 4, // curated - ML pipeline count is not derivable from the API
  langRepoCount: 19,
  languages: [
    { name: 'Python', percentage: 37, color: '#3572A5', repos: 7 },
    { name: 'TypeScript', percentage: 37, color: '#3178C6', repos: 7 },
    { name: 'HTML', percentage: 16, color: '#e34c26', repos: 3 },
    { name: 'Other', percentage: 10, color: '#8b949e', repos: 2 },
  ],
};

function readCache() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data?.languages || Date.now() - parsed.timestamp > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function relativeTime(timestamp) {
  if (!timestamp) return null;
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

/** Language breakdown weighted by each repo's primary language. */
function languagesFrom(repos) {
  const counts = new Map();
  repos.forEach((repo) => {
    if (repo.language) counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
  });
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  if (!total) return null;

  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const languages = top.map(([name, count]) => ({
    name,
    percentage: Math.round((count / total) * 100),
    color: LINGUIST_COLORS[name] || '#8b949e',
    repos: count,
  }));
  const other = total - top.reduce((sum, [, count]) => sum + count, 0);
  if (other > 0) {
    const used = languages.reduce((sum, lang) => sum + lang.percentage, 0);
    languages.push({
      name: 'Other',
      percentage: Math.max(100 - used, 1),
      color: '#8b949e',
      repos: other,
    });
  }
  return { languages, total };
}

export default function GitHubStats() {
  // Read the cached snapshot once (lazy initialiser), not on every render.
  const [cached] = useState(readCache);
  const [stats, setStats] = useState(() => cached?.data || SNAPSHOT);
  // 'loading' | 'cached' | 'live' | 'error'
  const [status, setStatus] = useState(() => (cached ? 'cached' : 'loading'));
  const [syncedAt, setSyncedAt] = useState(() => cached?.timestamp || null);
  const [syncing, setSyncing] = useState(false);

  const sync = useCallback(async () => {
    setSyncing(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      const token = import.meta.env?.VITE_GITHUB_TOKEN;
      const headers = { Accept: 'application/vnd.github.v3+json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(REPOS_URL, { headers, signal: controller.signal });
      if (!res.ok) throw new Error(`GitHub responded ${res.status}`);

      const all = await res.json();
      const owned = all.filter((repo) => !repo.fork);
      if (!owned.length) throw new Error('No public repositories returned');

      const langData = languagesFrom(owned);
      const next = {
        ...stats,
        publicRepos: owned.length,
        stars: owned.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0),
        primaryLang: langData?.languages[0]?.name || stats.primaryLang,
        languages: langData?.languages || stats.languages,
        langRepoCount: langData?.total || owned.length,
      };

      setStats(next);
      setStatus('live');
      setSyncedAt(Date.now());

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: next }));
      } catch {
        // storage unavailable - the ledger still works, it just re-syncs
      }
    } catch {
      // Keep whatever we already have; never claim live data we don't have.
      setStatus((prev) => (prev === 'live' ? 'live' : 'error'));
    } finally {
      clearTimeout(timeoutId);
      setSyncing(false);
    }
  }, [stats]);

  // Only hit the API when we don't already hold a fresh cached snapshot.
  useEffect(() => {
    if (!cached) sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const statusText = (() => {
    if (syncing) return 'Syncing…';
    if (status === 'live') return `Live · updated ${relativeTime(syncedAt)}`;
    if (status === 'cached') return `Cached snapshot · ${relativeTime(syncedAt)}`;
    if (status === 'error') return 'Sync unavailable · showing measured snapshot';
    return 'Connecting…';
  })();

  const metrics = [
    { label: 'PUBLIC REPOS', value: `${stats.publicRepos}`, desc: 'Non-fork repositories' },
    { label: 'PRIMARY LANGUAGE', value: stats.primaryLang, desc: 'Most common repo language' },
    { label: 'TOTAL STARS', value: `${stats.stars}`, desc: 'Across all public repos' },
    { label: 'ML PIPELINES', value: `${stats.mlModels}`, desc: 'K-Means, XGBoost, SVD, NLP' },
  ];

  return (
    <div className="gh-ledger" data-reveal="up" data-reveal-delay="0.12">
      <div className="gh-head">
        <a
          className="gh-identity"
          href={`https://github.com/${USER}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>github.com/{USER}</span>
        </a>

        <div className="gh-status">
          <span className={`gh-dot gh-dot--${status}`} aria-hidden="true" />
          <span className="gh-status-text" role="status">
            {statusText}
          </span>
          <button
            type="button"
            className="gh-sync"
            onClick={sync}
            disabled={syncing}
            aria-label="Re-sync GitHub telemetry"
          >
            {syncing ? 'Syncing' : 'Sync'}
          </button>
        </div>
      </div>

      <dl className="gh-metrics">
        {metrics.map((metric) => (
          <div className="gh-metric" key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
            <span className="gh-metric-desc">{metric.desc}</span>
          </div>
        ))}
      </dl>

      <div className="gh-langs">
        <div className="gh-langs-head">
          <span className="gh-langs-title">LANGUAGE DISTRIBUTION</span>
          <span className="gh-langs-sub">
            {status === 'live'
              ? `Live · primary language across ${stats.langRepoCount} repos`
              : 'Measured snapshot of primary languages'}
          </span>
        </div>

        <div
          className="gh-lang-bar"
          role="img"
          aria-label={stats.languages
            .map((lang) => `${lang.name} ${lang.percentage}%`)
            .join(', ')}
        >
          {stats.languages.map((lang) => (
            <span
              key={lang.name}
              className="gh-lang-segment"
              style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
            />
          ))}
        </div>

        <div className="gh-lang-legend">
          {stats.languages.map((lang) => (
            <div className="gh-lang-item" key={lang.name}>
              <span className="gh-lang-dot" style={{ backgroundColor: lang.color }} aria-hidden="true" />
              <span className="gh-lang-name">{lang.name}</span>
              <span className="gh-lang-pct">{lang.percentage}%</span>
              <span className="gh-lang-repos">{lang.repos} repos</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
