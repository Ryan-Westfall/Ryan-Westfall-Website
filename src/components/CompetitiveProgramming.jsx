import React from 'react';
import { CodeforcesCard } from 'codeforces-stats-card';
import { LeetcodeCard } from 'leetcode-stats-card';
import CPArchive from './CPArchive';

const LEETCODE_USERNAME = 'Ryan-Westfall';
const CODEFORCES_HANDLE = 'Ryan-Westfall';

export default function CompetitiveProgramming() {
  return (
    <div className="cp-panel">
      <h2>Competitive Programming</h2>
      <div className="cp-cards">
        {/* Use our own Netlify proxy (not the public default) – /api/leetcode */}
        <LeetcodeCard username={LEETCODE_USERNAME} apiBase="/api/leetcode" />
        <CodeforcesCard handle={CODEFORCES_HANDLE} />
      </div>
      <CPArchive />
    </div>
  );
}
