import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In-memory cache for local dev proxy (5 min, same as Netlify function & leetcard)
const memoryCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

const GRAPHQL_QUERY = `
query getUserData($username: String!) {
  allQuestionsCount { difficulty count }
  matchedUser(username: $username) {
    username
    submitStatsGlobal {
      acSubmissionNum { difficulty count submissions }
      totalSubmissionNum { difficulty count submissions }
    }
    profile { ranking reputation }
  }
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    totalParticipants
    topPercentage
    badge { name }
  }
  userContestRankingHistory(username: $username) {
    attended
    trendDirection
    problemsSolved
    totalProblems
    finishTimeInSeconds
    rating
    ranking
    contest { title startTime }
  }
}
`;

async function fetchLeetCodeViaCurl(username) {
  const { execFile } = await import('child_process');
  const { promisify } = await import('util');
  const execFileAsync = promisify(execFile);
  const payload = JSON.stringify({ query: GRAPHQL_QUERY, variables: { username } });
  const { stdout, stderr } = await execFileAsync('curl', [
    '-s',
    '-X', 'POST',
    'https://leetcode.com/graphql',
    '-H', 'Content-Type: application/json',
    '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    '-H', `Referer: https://leetcode.com/u/${username}/`,
    '-H', 'Origin: https://leetcode.com',
    '-d', payload,
  ], { maxBuffer: 1024 * 1024 * 5 });
  if (stderr && stderr.includes('429')) throw new Error('LeetCode GraphQL rate limited (429)');
  const json = JSON.parse(stdout);
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data?.matchedUser) throw new Error(`Username "${username}" not found`);
  return json.data;
}

async function fetchLeetCode(username) {
  // Node's native fetch doesn't respect http_proxy env on Meta corp machines (EPERM),
  // while curl and bun do. Try fetch first, fallback to curl.
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': `https://leetcode.com/u/${username}/`,
        'Origin': 'https://leetcode.com',
      },
      body: JSON.stringify({ query: GRAPHQL_QUERY, variables: { username } }),
    });
    if (res.status === 429) throw new Error(`LeetCode GraphQL rate limited (429)`);
    if (!res.ok) throw new Error(`LeetCode GraphQL error ${res.status}`);
    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors[0].message);
    if (!json.data?.matchedUser) throw new Error(`Username "${username}" not found`);
    return json.data;
  } catch (err) {
    if (err.message.includes('fetch failed') || err.message.includes('EPERM') || err.cause?.code === 'EPERM') {
      return fetchLeetCodeViaCurl(username);
    }
    throw err;
  }
}

function normalize(data, username) {
  const { allQuestionsCount, matchedUser, userContestRanking, userContestRankingHistory } = data;
  const totalEasy = allQuestionsCount.find((x) => x.difficulty === 'Easy')?.count || 961;
  const totalMedium = allQuestionsCount.find((x) => x.difficulty === 'Medium')?.count || 2105;
  const totalHard = allQuestionsCount.find((x) => x.difficulty === 'Hard')?.count || 967;
  const totalQuestions = allQuestionsCount.find((x) => x.difficulty === 'All')?.count || 4033;
  const ac = matchedUser.submitStatsGlobal.acSubmissionNum;
  const totalSubs = matchedUser.submitStatsGlobal.totalSubmissionNum;
  const easySolved = ac.find((x) => x.difficulty === 'Easy')?.count || 0;
  const mediumSolved = ac.find((x) => x.difficulty === 'Medium')?.count || 0;
  const hardSolved = ac.find((x) => x.difficulty === 'Hard')?.count || 0;
  const totalSolved = ac.find((x) => x.difficulty === 'All')?.count || 0;
  const attempted = totalSubs.find((x) => x.difficulty === 'All')?.count || totalSolved;
  const acAll = ac.find((x) => x.difficulty === 'All');
  const totalAll = totalSubs.find((x) => x.difficulty === 'All');
  const acceptance = totalAll?.submissions ? Math.round((acAll.submissions / totalAll.submissions) * 100) : 0;
  return {
    username,
    ranking: matchedUser.profile.ranking,
    totalSolved, easySolved, mediumSolved, hardSolved,
    totalEasy, totalMedium, totalHard, totalQuestions,
    attempted, acceptance,
    totalSubmissionNum: totalSubs,
    acSubmissionNum: ac,
    contestRating: userContestRanking?.rating || 0,
    contestGlobalRanking: userContestRanking?.globalRanking || 0,
    contestTopPercentage: userContestRanking?.topPercentage || 0,
    contestAttend: userContestRanking?.attendedContestsCount || 0,
    contestBadges: userContestRanking?.badge || null,
    contestParticipation: (userContestRankingHistory || []).filter((x) => x.attended),
    profile: {
      totalSolved, easySolved, mediumSolved, hardSolved,
      totalEasy, totalMedium, totalHard, totalQuestions,
      ranking: matchedUser.profile.ranking,
      totalSubmissions: totalSubs,
    },
    solved: {
      solvedProblem: totalSolved, easySolved, mediumSolved, hardSolved,
      totalSubmissionNum: totalSubs, acSubmissionNum: ac,
    },
    contest: {
      contestRating: userContestRanking?.rating || 0,
      contestGlobalRanking: userContestRanking?.globalRanking || 0,
      contestTopPercentage: userContestRanking?.topPercentage || 0,
      contestAttend: userContestRanking?.attendedContestsCount || 0,
      contestParticipation: (userContestRankingHistory || []).filter((x) => x.attended),
    },
  };
}

function leetcodeProxyPlugin() {
  return {
    name: 'leetcode-proxy',
    configureServer(server) {
      server.middlewares.use('/api/leetcode', async (req, res, next) => {
        try {
          const url = new URL(req.url, 'http://localhost');
          // req.url is like "/?username=Ryan-Westfall" or "/Ryan-Westfall" when mounted at /api/leetcode
          let username = url.searchParams.get('username') || url.searchParams.get('user');
          if (!username) {
            const parts = url.pathname.split('/').filter(Boolean);
            // parts could be [] or ["Ryan-Westfall"]
            if (parts.length > 0 && parts[0] !== 'leetcode') {
              username = parts[parts.length - 1];
            } else if (req.url && !req.url.startsWith('/?') && req.url !== '/') {
              // fallback: /Ryan-Westfall
              const clean = req.url.split('?')[0].replace(/^\//, '');
              if (clean) username = clean;
            }
          }

          if (!username) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: 'Missing username' }));
            return;
          }

          const cacheKey = username.toLowerCase();
          const cached = memoryCache.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=300');
            res.setHeader('X-Cache', 'HIT');
            res.end(JSON.stringify(cached.data));
            return;
          }

          try {
            const data = await fetchLeetCode(username);
            const normalized = normalize(data, username);
            memoryCache.set(cacheKey, { timestamp: Date.now(), data: normalized });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=300');
            res.setHeader('X-Cache', 'MISS');
            res.end(JSON.stringify(normalized));
          } catch (err) {
            if (cached) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('X-Cache', 'STALE');
              res.end(JSON.stringify(cached.data));
              return;
            }
            const is429 = err.message.includes('429');
            res.statusCode = is429 ? 429 : 500;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (is429) res.setHeader('Retry-After', '60');
            res.end(JSON.stringify({ error: err.message }));
          }
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), leetcodeProxyPlugin()],
  build: {
    outDir: 'dist'
  }
})
