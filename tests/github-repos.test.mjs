// Regression tests for the GitHub repos proxy (netlify/functions/github-repos.js).
// Run with: npm test
//
// The bug: Projects fetched api.github.com directly from the browser
// (unauthenticated, 60/hr per IP, per_page=12) and its catch handler set
// repos to [], so a 403 rate-limit response silently rendered only the two
// hardcoded cards. These tests pin the proxy contract that prevents that:
// fetch ALL pages, throw on GitHub errors instead of returning [], cache
// within the TTL, and serve stale data rather than nothing on later errors.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchAllRepos,
  parseNextLink,
  createGithubReposHandler,
} from '../netlify/functions/github-repos.js';

const repo = (id, name) => ({
  id,
  name,
  html_url: `https://github.com/Ryan-Westfall/${name}`,
  description: `${name} description`,
  stargazers_count: 99, // extra field the proxy must strip
});

const jsonResponse = (body, { status = 200, link } = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: link ? { link } : {},
  });

test('fetchAllRepos follows Link rel="next" and returns every repo', async () => {
  const page2 = 'https://api.github.com/users/Ryan-Westfall/repos?page=2';
  const calls = [];
  const fakeFetch = async (url) => {
    calls.push(url);
    if (url === page2) return jsonResponse([repo(3, 'third')]);
    return jsonResponse([repo(1, 'first'), repo(2, 'second')], {
      link: `<${page2}>; rel="next", <${page2}>; rel="last"`,
    });
  };

  const repos = await fetchAllRepos(fakeFetch, undefined);

  assert.equal(calls.length, 2);
  assert.match(calls[0], /per_page=100/);
  assert.deepEqual(
    repos.map((r) => r.name),
    ['first', 'second', 'third'],
  );
  assert.deepEqual(Object.keys(repos[0]).sort(), ['description', 'html_url', 'id', 'name']);
});

test('fetchAllRepos throws on a 403 rate limit instead of returning []', async () => {
  const fakeFetch = async () =>
    jsonResponse({ message: 'API rate limit exceeded for 1.2.3.4.' }, { status: 403 });

  await assert.rejects(fetchAllRepos(fakeFetch, undefined), (err) => {
    assert.equal(err.status, 403);
    assert.match(err.message, /403/);
    assert.match(err.message, /rate limit/i);
    return true;
  });
});

test('parseNextLink returns null without a next link', () => {
  assert.equal(parseNextLink(null), null);
  assert.equal(parseNextLink('<https://api.github.com/x?page=1>; rel="prev"'), null);
});

test('handler caches within TTL and serves stale data after a later 403', async () => {
  let clock = 0;
  let fail = false;
  let calls = 0;
  const fakeFetch = async () => {
    calls += 1;
    return fail
      ? jsonResponse({ message: 'API rate limit exceeded' }, { status: 403 })
      : jsonResponse([repo(1, 'only')]);
  };
  const handler = createGithubReposHandler({ fetchImpl: fakeFetch, cacheTtlMs: 1000, now: () => clock });
  const event = { httpMethod: 'GET', headers: {} };

  const first = await handler(event);
  assert.equal(first.statusCode, 200);
  assert.equal(first.headers['X-Cache'], 'MISS');
  assert.equal(JSON.parse(first.body).length, 1);

  clock = 500; // within TTL: no second GitHub request
  const cached = await handler(event);
  assert.equal(cached.headers['X-Cache'], 'HIT');
  assert.equal(calls, 1);

  clock = 2000; // past TTL, GitHub now rate-limited: stale beats empty
  fail = true;
  const stale = await handler(event);
  assert.equal(stale.statusCode, 200);
  assert.equal(stale.headers['X-Cache'], 'STALE');
  assert.equal(JSON.parse(stale.body)[0].name, 'only');
});

test('handler with no cache surfaces a GitHub 403 as an error response', async () => {
  const handler = createGithubReposHandler({
    fetchImpl: async () => jsonResponse({ message: 'API rate limit exceeded' }, { status: 403 }),
  });

  const res = await handler({ httpMethod: 'GET', headers: {} });

  assert.equal(res.statusCode, 403);
  assert.match(JSON.parse(res.body).error, /rate limit/i);
});
