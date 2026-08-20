import React from 'react';
import { CodeforcesCard } from 'codeforces-stats-card';

const LEETCODE_USERNAME = 'Ryan-Westfall';
const CODEFORCES_HANDLE = 'Ryan-Westfall';

export default function CompetitiveProgramming() {
  return (
    <div className="cp-panel">
      <h2>Competitive Programming</h2>
      <div className="cp-cards">
        {/* LeetCode Card (public leetcard image) */}
        <div className="cp-card leetcode">
          <div className="cp-header">
            <h3>LeetCode</h3>
            <a
              href={`https://leetcode.com/u/${LEETCODE_USERNAME}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="cp-link"
            >
              →
            </a>
          </div>
          <a
            href={`https://leetcode.com/u/${LEETCODE_USERNAME}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={`https://leetcard.jacoblin.cool/${LEETCODE_USERNAME}?theme=light&ext=contest&width=500`}
              alt="LeetCode Stats"
              className="cp-leetcode-card"
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </a>
        </div>

        {/* Codeforces Card (codeforces-stats-card dependency) */}
        <CodeforcesCard handle={CODEFORCES_HANDLE} />
      </div>
    </div>
  );
}
