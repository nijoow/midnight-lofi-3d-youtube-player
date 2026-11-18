import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { createSearchHandler } from '../../src/app/_lib/youtube-search';
const req = (q: string, token = '') =>
  new NextRequest(
    'http://localhost/api/youtube/search?' +
      new URLSearchParams({ q, ...(token ? { pageToken: token } : {}) }),
  );
const payload = {
  items: [
    {
      id: { videoId: 'abcdefghijk' },
      snippet: { title: 'A &amp; B', channelTitle: 'Artist' },
    },
  ],
  nextPageToken: 'PAGE_2=',
};
test('validates inputs before spending an upstream request', async () => {
  let calls = 0;
  const handler = createSearchHandler({
    getApiKey: () => 'test-key',
    fetcher: async () => {
      calls++;
      return Response.json(payload);
    },
  });
  assert.equal((await handler(req('   '))).status, 400);
  assert.equal((await handler(req('x'.repeat(121)))).status, 400);
  assert.equal((await handler(req('music', 'page&key=other'))).status, 400);
  assert.equal(calls, 0);
});
test('caches equivalent searches, separates page tokens, and expires cached entries', async () => {
  let time = 100000,
    calls = 0;
  const handler = createSearchHandler({
    now: () => time,
    getApiKey: () => 'test-key',
    fetcher: async (input, options) => {
      calls++;
      const url = new URL(String(input));
      assert.equal(url.searchParams.get('videoEmbeddable'), 'true');
      assert.ok(options?.signal);
      return Response.json(payload);
    },
  });
  assert.equal((await handler(req('lofi'))).status, 200);
  await handler(req(' LOFI '));
  assert.equal(calls, 1);
  const data = await (await handler(req('lofi', 'PAGE_2='))).json();
  assert.equal(calls, 2);
  assert.equal(data.items[0].id, 'abcdefghijk');
  time += 300001;
  await handler(req('lofi'));
  assert.equal(calls, 3);
});
test('coalesces simultaneous identical searches', async () => {
  let calls = 0;
  const handler = createSearchHandler({
    getApiKey: () => 'test-key',
    fetcher: async () => {
      calls++;
      await new Promise(r => setTimeout(r, 20));
      return Response.json(payload);
    },
  });
  const responses = await Promise.all([
    handler(req('jazz')),
    handler(req('jazz')),
    handler(req('jazz')),
  ]);
  assert.equal(calls, 1);
  assert.ok(responses.every(r => r.status === 200));
});
test('enforces a bounded instance budget and resets after a minute', async () => {
  let time = 100000;
  const handler = createSearchHandler({
    now: () => time,
    getApiKey: () => 'test-key',
    fetcher: async () => Response.json(payload),
  });
  for (let i = 0; i < 20; i++)
    assert.equal((await handler(req('query-' + i))).status, 200);
  const blocked = await handler(req('new query'));
  assert.equal(blocked.status, 429);
  assert.ok(blocked.headers.get('Retry-After'));
  time += 60001;
  assert.equal((await handler(req('new query'))).status, 200);
});
test('reports missing configuration and quota errors without exposing credentials', async () => {
  const unavailable = createSearchHandler({ getApiKey: () => undefined });
  assert.equal((await unavailable(req('music'))).status, 503);
  const handler = createSearchHandler({
    getApiKey: () => 'test-private-key',
    fetcher: async () =>
      Response.json(
        { error: { errors: [{ reason: 'quotaExceeded' }] } },
        { status: 403 },
      ),
  });
  const response = await handler(req('music'));
  assert.equal(response.status, 429);
  assert.equal((await response.text()).includes('test-private-key'), false);
});
