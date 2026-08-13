import React, { useState, useEffect } from 'react';

export default function CompetitiveProgramming() {
  const [cfData, setCfData] = useState(null);
  const [cfHistory, setCfHistory] = useState([]);
  const [lcData, setLcData] = useState(null);
  const [lcHistory, setLcHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Codeforces user info
    const cfInfoPromise = fetch('https://codeforces.com/api/user.info?handles=Ryan-Westfall')
      .then(res => res.json())
      .then(data => data.result?.[0])
      .catch(() => null);

    // Fetch Codeforces rating history
    const cfHistoryPromise = fetch('https://codeforces.com/api/user.rating?handle=Ryan-Westfall')
      .then(res => res.json())
      .then(data => data.result || [])
      .catch(() => []);

    // Fetch Codeforces submissions to count solved problems
    const cfSolvedPromise = fetch('https://codeforces.com/api/user.status?handle=Ryan-Westfall&from=1&count=10000')
      .then(res => res.json())
      .then(data => {
        const solved = new Set();
        data.result?.forEach(sub => {
          if (sub.verdict === 'OK') {
            solved.add(`${sub.problem.contestId}-${sub.problem.index}`);
          }
        });
        return solved.size;
      })
      .catch(() => 0);

    // Fetch LeetCode data (may fail due to CORS)
    const lcPromise = fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{
          matchedUser(username: "Ryan-Westfall") {
            submitStatsGlobal {
              acSubmissionNum { difficulty count }
            }
          }
        }`
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('LeetCode API unavailable');
        return res.json();
      })
      .then(data => {
        const stats = data.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
        if (!stats) return null;
        return {
          total: stats.find(s => s.difficulty === 'All')?.count || 0,
          easy: stats.find(s => s.difficulty === 'Easy')?.count || 0,
          medium: stats.find(s => s.difficulty === 'Medium')?.count || 0,
          hard: stats.find(s => s.difficulty === 'Hard')?.count || 0,
        };
      })
      .catch(err => {
        console.warn('LeetCode API failed (likely CORS):', err);
        // Return mock data for demo purposes
        return {
          total: 475,
          easy: 141,
          medium: 271,
          hard: 63,
        };
      });

    // Fetch LeetCode contest history
    const lcHistoryPromise = fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{ userContestRankingHistory(username: "Ryan-Westfall") { rating } }`
      })
    })
      .then(res => res.json())
      .then(data => data.data?.userContestRankingHistory || [])
      .catch(() => []);

    Promise.all([cfInfoPromise, cfHistoryPromise, cfSolvedPromise, lcPromise, lcHistoryPromise]).then(([cf, cfHist, cfSolved, lc, lcHist]) => {
      setCfData({...cf, solvedCount: cfSolved});
      setCfHistory(cfHist);
      setLcData(lc);
      setLcHistory(lcHist);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="cp-panel">
        <h2>Competitive Programming</h2>
        <div className="cp-loading">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="cp-panel">
      <h2>Competitive Programming</h2>
      <div className="cp-cards">
        {/* LeetCode Card */}
        <style>{`
          .cp-stat-main { text-align: center; margin-bottom: 1rem; }
          .cp-stat-value { font-size: 2.5rem; font-weight: bold; display: block; }
          .cp-stat-label { color: #6c757d; font-size: 0.85rem; text-transform: uppercase; }
          .cp-problems { text-align: center; margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
          .cp-problems-count { font-size: 2rem; font-weight: bold; color: #495057; }
          .cp-problems-label { font-size: 0.85rem; color: #6c757d; }
        `}</style>
        <div className="cp-card leetcode">
          <div className="cp-header">
            <h3>LeetCode</h3>
            <a 
              href="https://leetcode.com/u/Ryan-Westfall/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="cp-link"
            >
              →
            </a>
          </div>
          <a 
            href="https://leetcode.com/u/Ryan-Westfall/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img 
              src="https://leetcard.jacoblin.cool/Ryan-Westfall?theme=light&ext=contest&width=500" 
              alt="LeetCode Stats"
              className="cp-leetcode-card"
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </a>
        </div>

        {/* Codeforces Card */}
        <a 
          href="https://codeforces.com/profile/Ryan-Westfall" 
          target="_blank" 
          rel="noopener noreferrer"
          className="cp-card codeforces"
        >
          {cfData ? (
            <div className="cp-stats">
              <div className="cp-header">
                <h3>Codeforces</h3>
                <span className="cp-link">→</span>
              </div>

              <div className="cp-stat-main" style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <img 
                    src="/codeforces-logo.png" 
                    alt="Codeforces" 
                    style={{ height: '32px', width: 'auto' }}
                  />
                  <div>
                    <span className="cp-stat-label" style={{ display: 'block', color: '#000', fontWeight: '600', marginBottom: '0.25rem' }}>
                      Contest Rating
                    </span>
                  <span className="cp-stat-value" style={{ color: '#000', fontWeight: 'bold' }}>
                    {cfData.rating}
                  </span>
                  </div>
                </div>
              </div>

              <div className="cp-rank-info">
                <span className="cp-rank-badge">{cfData.rank}</span>
                <span className="cp-max-rating">Max: {cfData.maxRating}</span>
              </div>

              {/* Rating Graph */}
              {cfHistory.length > 0 && (
                <div className="cp-rating-graph">
                  <svg viewBox="0 0 400 100" className="cp-graph">
                    {(() => {
                      const ratings = cfHistory.map(h => h.newRating);
                      const min = Math.min(...ratings);
                      const max = Math.max(...ratings);
                      const range = max - min || 1;
                      
                      const points = cfHistory.map((h, i) => {
                        const x = (i / (cfHistory.length - 1)) * 380 + 10;
                        const y = 90 - ((h.newRating - min) / range) * 80;
                        return `${x},${y}`;
                      }).join(' ');
                      
                      return (
                        <>
                          <polyline
                            fill="none"
                            stroke="#1976d2"
                            strokeWidth="2"
                            points={points}
                          />
                          {cfHistory.map((h, i) => {
                            const x = (i / (cfHistory.length - 1)) * 380 + 10;
                            const y = 90 - ((h.newRating - min) / range) * 80;
                            return (
                              <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="3"
                                fill="#1976d2"
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                  <div className="cp-graph-labels">
                    <span>{cfHistory[0]?.newRating || 0}</span>
                    <span>{cfHistory[cfHistory.length - 1]?.newRating || cfData.rating}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="cp-error">Unable to load stats</div>
          )}
        </a>
      </div>
    </div>
  );
}
