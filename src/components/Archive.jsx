import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import ProblemDetail from './ProblemDetail';

const DATA_BASE = 'https://raw.githubusercontent.com/Ryan-Westfall/competitive-programming/main/data';
const GITHUB_BASE = 'https://github.com/Ryan-Westfall/competitive-programming/tree/main';

const PROBLEMS_URL = `${DATA_BASE}/problems.json`;
const TAGS_URL = `${DATA_BASE}/tags.json`;
const STATS_URL = `${DATA_BASE}/stats.json`;

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const INITIAL_VISIBLE = 30;
const LOAD_MORE_STEP = 30;
const CARD_MIN_WIDTH = 320;
const GRID_GAP = 16;

function formatTag(tag) {
  return tag
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function Archive() {
  const [problems, setProblems] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [columnCount, setColumnCount] = useState(3);
  const gridRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        const [problemsRes, tagsRes, statsRes] = await Promise.all([
          fetch(PROBLEMS_URL),
          fetch(TAGS_URL),
          fetch(STATS_URL)
        ]);

        if (!problemsRes.ok) throw new Error(`Failed to load problems: ${problemsRes.status}`);
        if (!tagsRes.ok) throw new Error(`Failed to load tags: ${tagsRes.status}`);

        const problemsData = await problemsRes.json();
        const tagsData = await tagsRes.json();
        const statsData = statsRes.ok ? await statsRes.json() : null;

        if (!cancelled) {
          setProblems(problemsData);
          setTags(tagsData.allTags || tagsData.leetcodeTags || []);
          setStats(statsData);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Failed to fetch archive data', e);
          setError(e.message);
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Calculate column count based on container width
  useEffect(() => {
    if (!gridRef.current) return;
    
    const updateColumnCount = () => {
      if (!gridRef.current) return;
      const width = gridRef.current.offsetWidth;
      const count = Math.max(1, Math.floor((width + GRID_GAP) / (CARD_MIN_WIDTH + GRID_GAP)));
      setColumnCount(count);
    };

    updateColumnCount();
    
    const observer = new ResizeObserver(updateColumnCount);
    observer.observe(gridRef.current);
    
    return () => observer.disconnect();
  }, [problems, tags]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setVisibleCount(INITIAL_VISIBLE);
    setExpandedId(null);
  };

  const filtered = useMemo(() => {
    let result = problems;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.frontendId && p.frontendId.includes(q))
      );
    }

    if (selectedDifficulty !== 'All') {
      result = result.filter(p => p.difficulty === selectedDifficulty);
    }

    if (selectedTags.size > 0) {
      result = result.filter(p =>
        p.tags && Array.from(selectedTags).every(t => p.tags.includes(t))
      );
    }

    return [...result].sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));
  }, [problems, search, selectedDifficulty, selectedTags]);

  const paginated = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  // Group paginated into rows based on columnCount
  const rows = useMemo(() => {
    const r = [];
    for (let i = 0; i < paginated.length; i += columnCount) {
      r.push(paginated.slice(i, i + columnCount));
    }
    return r;
  }, [paginated, columnCount]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
    setExpandedId(null);
  }, [search, selectedDifficulty, selectedTags]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        setVisibleCount(prev => {
          if (prev >= filtered.length) return prev;
          return Math.min(prev + LOAD_MORE_STEP, filtered.length);
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filtered.length]);

  const topTags = useMemo(() => tags.slice(0, 20), [tags]);
  const displayedTags = useMemo(() => showAllTags ? tags : topTags, [tags, topTags, showAllTags]);

  if (loading) {
    return (
      <div className="archive-page">
        <div className="archive-loading">Loading competitive programming archive...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="archive-page">
        <Helmet>
          <title>Archive | Ryan Westfall</title>
        </Helmet>
        <div className="archive-error">
          <h2>Failed to load archive</h2>
          <p>{error}</p>
          <p>
            Data is sourced from{' '}
            <a href="https://github.com/Ryan-Westfall/competitive-programming" target="_blank" rel="noopener noreferrer">
              competitive-programming repo
            </a>
            . Check that <code>data/problems.json</code> exists on main.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="archive-page">
      <Helmet>
        <title>Competitive Programming Archive | Ryan Westfall</title>
        <meta name="description" content="Filterable archive of solved LeetCode and competitive programming problems by tag, difficulty, and platform." />
      </Helmet>

      <div className="archive-header">
        <h1>Competitive Programming Archive</h1>
        <p className="archive-subtitle">
          Querying <a href="https://github.com/Ryan-Westfall/competitive-programming" target="_blank" rel="noopener noreferrer">Ryan-Westfall/competitive-programming</a>
          {' '}— {problems.length} problems solved
        </p>
      </div>

      <div className="archive-filters-top">
        <div className="filter-bar">
          <div className="filter-bar-top-row">
            <div className="filter-group filter-group-search">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search title, slug, or id..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group filter-group-difficulty">
              <label>Difficulty</label>
              <div className="difficulty-chips">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    className={`chip ${selectedDifficulty === d ? 'active' : ''} ${d.toLowerCase()}`}
                    onClick={() => setSelectedDifficulty(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-group filter-group-tags">
            <label>Tags ({selectedTags.size} selected)</label>
            <div className="tag-cloud">
              {displayedTags.map(({ tag, count }) => {
                const active = selectedTags.has(tag);
                return (
                  <button
                    key={tag}
                    className={`tag-chip ${active ? 'active' : ''}`}
                    onClick={() => toggleTag(tag)}
                    title={`${count} problems`}
                  >
                    {formatTag(tag)} <span className="tag-count">{count}</span>
                  </button>
                );
              })}
            </div>
            {tags.length > 20 && (
              <div className="tags-expand-text">
                {!showAllTags ? (
                  <span 
                    className="show-all-tags-link"
                    onClick={() => setShowAllTags(true)}
                    role="button"
                    tabIndex={0}
                  >
                    Show all {tags.length} tags ▼
                  </span>
                ) : (
                  <span 
                    className="show-all-tags-link"
                    onClick={() => setShowAllTags(false)}
                    role="button"
                    tabIndex={0}
                  >
                    Show less ▲
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="archive-layout archive-layout-full-width">
        <main className="archive-list archive-list-full-width">
          {paginated.length === 0 ? (
            <div className="no-results">
              <p>No problems match your filters.</p>
            </div>
          ) : (
            <>
              <div className="problem-grid" ref={gridRef}>
                {rows.map((row, rowIdx) => {
                  const rowHasExpanded = row.some(p => `${p.platform}-${p.id}` === expandedId);
                  const expandedProblem = rowHasExpanded 
                    ? row.find(p => `${p.platform}-${p.id}` === expandedId)
                    : null;
                  
                  return (
                    <React.Fragment key={`row-${rowIdx}`}>
                      <div className="problem-row" style={{ display: 'contents' }}>
                        {row.map(p => {
                          const isExpanded = expandedId === `${p.platform}-${p.id}`;
                          return (
                            <div 
                              key={`${p.platform}-${p.id}`}
                              className={`problem-card ${isExpanded ? 'expanded' : ''}`}
                              onClick={() => setExpandedId(isExpanded ? null : `${p.platform}-${p.id}`)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="problem-card-header">
                                <span className={`difficulty-badge ${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span>
                                {p.frontendId && <span className="problem-id">#{p.frontendId}</span>}
                                <a 
                                  href={p.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  onClick={e => e.stopPropagation()}
                                  className="platform-badge platform-badge-link"
                                >
                                  {p.platform}
                                </a>
                              </div>
                              <h3 className="problem-title">
                                <span>{p.title}</span>
                              </h3>
                              <div className="problem-tags">
                                {(p.tagNames || p.tags || []).slice(0, 4).map((t, idx) => {
                                  const rawTag = p.tags?.[idx] || t.toLowerCase().replace(/\s+/g, '-');
                                  return (
                                    <span
                                      key={rawTag}
                                      className={`mini-tag ${selectedTags.has(rawTag) ? 'active' : ''}`}
                                      onClick={(e) => { e.stopPropagation(); toggleTag(rawTag); }}
                                      role="button"
                                      tabIndex={0}
                                    >
                                      {t}
                                    </span>
                                  );
                                })}
                                {(p.tags?.length || 0) > 4 && <span className="more-tags-label">+{p.tags.length - 4}</span>}
                              </div>
                              <div className="problem-footer">
                                <span className="solved-date">
                                  {new Date(p.solvedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="expand-hint">
                                {isExpanded ? '▼ Click to collapse' : '▶ Click to view details & notes'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {rowHasExpanded && expandedProblem && (
                        <div className="problem-detail-wrapper problem-detail-row-detail" style={{ gridColumn: '1 / -1' }}>
                          <ProblemDetail 
                            problem={expandedProblem} 
                            onClose={() => setExpandedId(null)} 
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {paginated.length < filtered.length && (
                <div className="load-more-indicator">
                  <p>Scroll to load more... ({paginated.length} of {filtered.length})</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
