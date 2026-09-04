import React, { useState, useEffect, useMemo } from 'react';

// GitHub raw URLs for the competitive-programming repo
const DATA_BASE = 'https://raw.githubusercontent.com/Ryan-Westfall/competitive-programming/main/data';
const PROBLEMS_URL = `${DATA_BASE}/problems.json`;
const STATS_URL = `${DATA_BASE}/stats.json`;

export default function CPArchive() {
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, leetcode, codeforces
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, title, platform

  useEffect(() => {
    Promise.all([
      fetch(PROBLEMS_URL).then(r => {
        if (!r.ok) throw new Error(`Problems fetch failed: ${r.status}`);
        return r.json();
      }),
      fetch(STATS_URL).then(r => {
        if (!r.ok) throw new Error(`Stats fetch failed: ${r.status}`);
        // stats may not exist yet, fallback to null
        return r.json().catch(() => null);
      }).catch(() => null)
    ])
      .then(([problemsData, statsData]) => {
        setProblems(Array.isArray(problemsData) ? problemsData : []);
        setStats(statsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load CP archive:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let list = [...problems];
    if (filter !== 'all') {
      list = list.filter(p => p.platform === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    if (sortBy === 'recent') {
      list.sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'platform') {
      list.sort((a, b) => a.platform.localeCompare(b.platform) || new Date(b.solvedAt) - new Date(a.solvedAt));
    }
    return list;
  }, [problems, filter, search, sortBy]);

  if (loading) {
    return (
      <div className="cp-archive">
        <div className="cp-archive-loading">Loading solved problems archive...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cp-archive">
        <div className="cp-archive-error">
          Failed to load archive: {error}<br />
          <small>Make sure <a href="https://github.com/Ryan-Westfall/competitive-programming" target="_blank" rel="noopener noreferrer">competitive-programming repo</a> exists and is public.</small>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-archive">
      <div className="cp-archive-header">
        <h3>Solved Problems Archive</h3>
        {stats && (
          <div className="cp-archive-stats">
            <span>{stats.total?.uniqueSolved ?? problems.length} total solved</span>
            <span>•</span>
            <span>{stats.leetcode?.uniqueSolved ?? problems.filter(p => p.platform === 'leetcode').length} LeetCode</span>
            <span>•</span>
            <span>{stats.codeforces?.uniqueSolved ?? problems.filter(p => p.platform === 'codeforces').length} Codeforces</span>
            {stats.updatedAt && (
              <>
                <span>•</span>
                <span>Updated {new Date(stats.updatedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="cp-archive-controls">
        <input
          type="text"
          placeholder="Search problems, tags, IDs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="cp-archive-search"
        />
        <div className="cp-archive-filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'leetcode' ? 'active' : ''} onClick={() => setFilter('leetcode')}>LeetCode</button>
          <button className={filter === 'codeforces' ? 'active' : ''} onClick={() => setFilter('codeforces')}>Codeforces</button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="cp-archive-sort">
            <option value="recent">Most Recent</option>
            <option value="title">Title A-Z</option>
            <option value="platform">Platform</option>
          </select>
        </div>
      </div>

      <div className="cp-archive-list">
        {filtered.length === 0 ? (
          <div className="cp-archive-empty">No problems match your search.</div>
        ) : (
          filtered.map(p => (
            <a
              key={`${p.platform}-${p.id}`}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`cp-archive-item cp-archive-item--${p.platform}`}
            >
              <div className="cp-archive-item-main">
                <span className={`cp-archive-platform cp-archive-platform--${p.platform}`}>
                  {p.platform === 'leetcode' ? 'LC' : 'CF'}
                </span>
                <span className="cp-archive-title">{p.title}</span>
                <span className="cp-archive-id">{p.id}</span>
              </div>
              <div className="cp-archive-item-meta">
                {p.rating && <span className="cp-archive-rating">{p.rating}</span>}
                {p.tags && p.tags.slice(0, 3).map(t => <span key={t} className="cp-archive-tag">{t}</span>)}
                <span className="cp-archive-date">{new Date(p.solvedAt).toLocaleDateString()}</span>
                <span className="cp-archive-lang">{p.language}</span>
              </div>
            </a>
          ))
        )}
      </div>

      <div className="cp-archive-footer">
        <small>
          Data synced daily from LeetCode & Codeforces via <a href="https://github.com/Ryan-Westfall/competitive-programming" target="_blank" rel="noopener noreferrer">GitHub</a> • 
          Showing {filtered.length} of {problems.length} problems
        </small>
      </div>
    </div>
  );
}
