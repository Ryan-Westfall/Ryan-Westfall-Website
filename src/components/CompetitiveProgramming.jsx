import React from 'react';
import { CodeforcesCard } from 'codeforces-stats-card';
import { LeetcodeCard } from 'leetcode-stats-card';

const LEETCODE_USERNAME = 'Ryan-Westfall';
const CODEFORCES_HANDLE = 'Ryan-Westfall';

import { Link } from 'react-router-dom';

export default function CompetitiveProgramming() {
  return (
    <div className="cp-panel">
      <div className="cp-header-row">
        <h2>Competitive Programming</h2>
        <Link to="/archive" className="view-archive-link">View All Solutions →</Link>
      </div>
      <div className="cp-cards">
        {/* Use our own Netlify proxy (not the public default) – /api/leetcode */}
        <LeetcodeCard username={LEETCODE_USERNAME} apiBase="/api/leetcode" />
        <CodeforcesCard handle={CODEFORCES_HANDLE} />
      </div>
    </div>
  );
}
