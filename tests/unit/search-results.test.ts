import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSearchResults } from '../../src/app/_lib/search-results';

test('normalizes valid search results while rejecting malformed items and unsafe thumbnail hosts', () => {
  const result = parseSearchResults({
    items: [null, 1, {}, { id: 'bad', title: 'bad' }, { id: 'https://youtu.be/abcdefghijk', title: 'URL is not an ID' },
      { id: 'abcdefghijk', title: 'A &amp; B', channelTitle: '&#x1F3B5;', thumbnail: 'https://i.ytimg.com/vi/abcdefghijk/default.jpg' },
      { id: 'lmnopqrstuv', title: 'x'.repeat(600), channelTitle: 123, thumbnail: 'https://i.ytimg.com.attacker.test/image' },
    ], nextPageToken: 'NEXT',
  });
  assert.equal(result.items.length, 2);
  assert.equal(result.items[0].title, 'A & B');
  assert.equal(result.items[0].channel, '🎵');
  assert.ok(result.items[0].thumbnail);
  assert.equal(result.items[1].title.length, 500);
  assert.equal(result.items[1].channel, undefined);
  assert.equal(result.items[1].thumbnail, undefined);
  assert.equal(result.pageToken, 'NEXT');
});

test('distinguishes a valid empty result from an unreadable response', () => {
  assert.deepEqual(parseSearchResults({ items: [], nextPageToken: 7 }), { items: [], pageToken: null });
  for (const payload of [null, 1, 'error', {}, { items: {} }]) {
    assert.throws(() => parseSearchResults(payload), /검색 결과를 읽지 못했어요/);
  }
});
