// Netlify Function: /api/github-repos
// Proxies GitHub repos server-side. Calling api.github.com directly from the
// browser is unauthenticated (60 req/hr per visitor IP), so visitors behind a
// shared IP get 403 once that budget is exhausted and the Projects section
// silently renders only the hardcoded cards. Server-side we can authenticate
// with GITHUB_TOKEN (a server-only Netlify env var, never a VITE_* var baked
// into the JS bundle), cache the result, and serve stale data on error.

const GITHUB_USER = 'Ryan-Westfall';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes, same as the leetcode function

// Extract the rel="next" URL from a GitHub Link header, or null on last page.
export function parseNextLink(linkHeader) {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(',')) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="next"/);
    if (match) return match[1];
  }
  return null;
}

// Keep only the fields the Projects component renders.
export function toProjectRepo(repo) {
  return {
    id: repo.id,
    name: repo.name,
    html_url: repo.html_url,
    description: repo.description,
  };
}

// Fetch every page of repos. Throws (never returns a silent []) when GitHub
// errors, so callers can serve stale cache or surface the failure.
export async function fetchAllRepos(fetchImpl = fetch, token = process.env.GITHUB_TOKEN) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'ryan-westfall-website',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const repos = [];
  let url = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`;
  while (url) {
    const res = await fetchImpl(url, { headers });
    if (!res.ok) {
      let message = `GitHub API error: ${res.status}`;
      try {
        const body = await res.json();
        if (body?.message) message = `GitHub API error: ${res.status} ${body.message}`;
      } catch {
        // Keep the status-only message.
      }
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }
    const page = await res.json();
    if (!Array.isArray(page)) {
      throw new Error('GitHub API returned an unexpected response');
    }
    repos.push(...page.map(toProjectRepo));
    url = parseNextLink(res.headers.get('link'));
  }
  return repos;
}

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// cacheTtlMs/fetchImpl/now are injectable for tests; production uses defaults.
export function createGithubReposHandler({
  fetchImpl = (...args) => fetch(...args),
  cacheTtlMs = CACHE_TTL_MS,
  now = () => Date.now(),
} = {}) {
  let cache = null; // { timestamp, data }

  return async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: JSON_HEADERS, body: '' };
    }
    if (event.httpMethod && event.httpMethod !== 'GET') {
      return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    if (cache && now() - cache.timestamp < cacheTtlMs) {
      return {
        statusCode: 200,
        headers: { ...JSON_HEADERS, 'Cache-Control': 'public, max-age=300, stale-while-revalidate=300', 'X-Cache': 'HIT' },
        body: JSON.stringify(cache.data),
      };
    }

    try {
      const repos = await fetchAllRepos(fetchImpl);
      cache = { timestamp: now(), data: repos };
      return {
        statusCode: 200,
        headers: { ...JSON_HEADERS, 'Cache-Control': 'public, max-age=300, stale-while-revalidate=300', 'X-Cache': 'MISS' },
        body: JSON.stringify(repos),
      };
    } catch (err) {
      console.error('GitHub repos fetch error:', err);
      if (cache) {
        return {
          statusCode: 200,
          headers: { ...JSON_HEADERS, 'Cache-Control': 'public, max-age=60', 'X-Cache': 'STALE' },
          body: JSON.stringify(cache.data),
        };
      }
      const status = err.status === 403 || err.status === 429 ? err.status : 502;
      return { statusCode: status, headers: JSON_HEADERS, body: JSON.stringify({ error: err.message }) };
    }
  };
}

export const handler = createGithubReposHandler();
