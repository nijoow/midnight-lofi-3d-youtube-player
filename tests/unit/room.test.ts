import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ROOM,
  adjacentTrack,
  moveTrack,
  parseVideoId,
  removeTrack,
  restoreRoom,
} from '../../src/app/_lib/room';
const a = { id: 'abcdefghijk', title: 'A' },
  b = { id: 'lmnopqrstuv', title: 'B' },
  c = { id: '12345678901', title: 'C' };
test('accepts supported YouTube URLs without accepting spoofed hosts or protocols', () => {
  for (const url of [
    'abcdefghijk',
    'https://youtu.be/abcdefghijk?t=30',
    'https://www.youtube.com/watch?v=abcdefghijk&list=PL1',
    'https://m.youtube.com/shorts/abcdefghijk',
    'https://youtube.com/live/abcdefghijk',
  ])
    assert.equal(parseVideoId(url), a.id);
  for (const url of [
    'https://youtube.com.attacker.test/watch?v=abcdefghijk',
    'javascript:abcdefghijk',
    'ftp://youtu.be/abcdefghijk',
    'https://youtube.com/playlist?list=abcdefghijk',
    'tiny',
  ])
    assert.equal(parseVideoId(url), null);
});
test('restores bounded valid data and falls back safely for corrupt or incompatible storage', () => {
  assert.equal(restoreRoom('{oops'), null);
  assert.equal(restoreRoom('null'), null);
  assert.equal(restoreRoom(JSON.stringify({ version: 2, playlist: [] })), null);
  const value = restoreRoom(
    JSON.stringify({
      ...DEFAULT_ROOM,
      preferences: { volume: 900, mood: 'invalid' },
      playlist: [a, a, { id: 'bad', title: 'invalid' }, b],
      currentId: 'gone',
    }),
  )!;
  assert.deepEqual(value.playlist, [a, b]);
  assert.equal(value.currentId, a.id);
  assert.equal(value.preferences.volume, 100);
  assert.equal(value.preferences.mood, 'rain');
  const empty = restoreRoom(
    JSON.stringify({ ...DEFAULT_ROOM, playlist: [], currentId: a.id }),
  )!;
  assert.equal(empty.currentId, null);
  assert.deepEqual(empty.playlist, []);
});
test('deleting the active track preserves a sensible adjacent selection, including the last track', () => {
  const room = { ...DEFAULT_ROOM, playlist: [a, b, c], currentId: b.id };
  assert.equal(removeTrack(room, b.id).currentId, c.id);
  assert.equal(removeTrack({ ...room, currentId: c.id }, c.id).currentId, b.id);
  assert.equal(
    removeTrack({ ...room, playlist: [a], currentId: a.id }, a.id).currentId,
    null,
  );
  assert.equal(removeTrack(room, a.id).currentId, b.id);
});
test('repeat modes and reordering respect playlist boundaries', () => {
  assert.equal(adjacentTrack([a, b], b.id, 1, 'off', true), null);
  assert.equal(adjacentTrack([a, b], b.id, 1, 'all', true), a.id);
  assert.equal(adjacentTrack([a, b], a.id, 1, 'one', true), a.id);
  assert.equal(adjacentTrack([a, b], a.id, 1, 'one'), b.id);
  assert.deepEqual(moveTrack([a, b, c], b.id, -1), [b, a, c]);
  assert.deepEqual(moveTrack([a, b], a.id, -1), [a, b]);
});
