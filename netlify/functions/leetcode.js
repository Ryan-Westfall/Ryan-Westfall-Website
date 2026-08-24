// Netlify Function: /api/leetcode?username=xxx
// Proxies LeetCode GraphQL server-side to avoid CORS and shared rate limits,
// with 5-minute CDN + in-memory caching (same strategy as leetcard.jacoblin.cool on Cloudflare).
// No auth required – LeetCode public profile data is unauthenticated, just needs proper User-Agent/Referer.

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const memoryCache = new Map();

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

async function fetchLeetCode(username) {
  const res = await fetch(LEETCODE_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': `https://leetcode.com/u/${username}/`,
      'Origin': 'https://leetcode.com',
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: { username },
    }),
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get('retry-after') || '60';
    throw new Error(`LeetCode GraphQL rate limited (429), retry after ${retryAfter}s`);
  }
  if (!res.ok) {
    throw new Error(`LeetCode GraphQL error ${res.status}`);
  }
  const json = await res.json();
  if (json.errors && json.errors.length) {
    throw new Error(json.errors[0].message || 'LeetCode GraphQL error');
  }
  if (!json.data || !json.data.matchedUser) {
    throw new Error(`Username "${username}" not found`);
  }
  return json.data;
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
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    totalEasy,
    totalMedium,
    totalHard,
    totalQuestions,
    attempted,
    acceptance,
    totalSubmissionNum: totalSubs,
    acSubmissionNum: ac,
    // contest
    contestRating: userContestRanking?.rating || 0,
    contestGlobalRanking: userContestRanking?.globalRanking || 0,
    contestTopPercentage: userContestRanking?.topPercentage || 0,
    contestAttend: userContestRanking?.attendedContestsCount || 0,
    contestBadges: userContestRanking?.badge || null,
    contestParticipation: (userContestRankingHistory || []).filter((x) => x.attended),
    // also provide alfa-compatible shape for card's normalize
    profile: {
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      totalEasy,
      totalMedium,
      totalHard,
      totalQuestions,
      ranking: matchedUser.profile.ranking,
      totalSubmissions: totalSubs,
    },
    solved: {
      solvedProblem: totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      totalSubmissionNum: totalSubs,
      acSubmissionNum: ac,
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

const ALLOWED_ORIGINS = [
  'https://ryan-westfall.info',
  'https://www.ryan-westfall.info',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function isAllowedOrigin(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const referer = event.headers?.referer || event.headers?.Referer || '';
  // Allow same-origin requests (no Origin header, e.g., curl, server-side)
  if (!origin && !referer) return true;
  // Check origin
  if (origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o))) return true;
  // Check referer
  if (referer && ALLOWED_ORIGINS.some((o) => referer.startsWith(o))) return true;
  // Allow Netlify deploy previews and branch deploys
  const check = origin || referer;
  if (check && check.includes('ryan-westfall-website') && check.includes('netlify.app')) return true;
  if (check && check.includes('ryan-westfall.info')) return true;
  // In local dev, allow any localhost
  if (check && (check.includes('localhost') || check.includes('127.0.0.1'))) return true;
  return false;
}

function getCorsHeaders(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const allowed = ALLOWED_ORIGINS.find((o) => origin.startsWith(o));
  return {
    'Access-Control-Allow-Origin': allowed || ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export async function handler(event, context) {
  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: '',
    };
  }

  if (!isAllowedOrigin(event)) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(event) },
      body: JSON.stringify({ error: 'Forbidden: This proxy is private. Deploy your own – see https://github.com/Ryan-Westfall/leetcode-stats-card/tree/main/examples' }),
    };
  }

  const username = event.queryStringParameters?.username || event.queryStringParameters?.user || event.path?.split('/').pop();
  // Also support path like /api/leetcode/Ryan-Westfall
  let user = username;
  if (!user || user === 'leetcode') {
    // try to parse from path: /.netlify/functions/leetcode/Ryan-Westfall or /api/leetcode/Ryan-Westfall
    const parts = (event.path || '').split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last !== 'leetcode' && last !== '.netlify' && last !== 'functions') {
      user = last;
    }
  }

  if (!user || user === 'leetcode') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(event) },
      body: JSON.stringify({ error: 'Missing username parameter. Use ?username=YourLeetCodeUsername' }),
    };
  }

  const cacheKey = user.toLowerCase();
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(event),
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300',
        'X-Cache': 'HIT',
      },
      body: JSON.stringify(cached.data),
    };
  }

  try {
    const data = await fetchLeetCode(user);
    const normalized = normalize(data, user);
    memoryCache.set(cacheKey, { timestamp: Date.now(), data: normalized });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(event),
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300',
        'X-Cache': 'MISS',
      },
      body: JSON.stringify(normalized),
    };
  } catch (err) {
    console.error('LeetCode fetch error:', err);
    const is429 = err.message.includes('429') || err.message.includes('rate limited');
    // If we have stale cache, return it with 200 and X-Cache: STALE
    if (cached) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(event),
          'Cache-Control': 'public, max-age=60',
          'X-Cache': 'STALE',
        },
        body: JSON.stringify(cached.data),
      };
    }
    return {
      statusCode: is429 ? 429 : 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(event),
        'Retry-After': is429 ? '60' : '10',
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
}
