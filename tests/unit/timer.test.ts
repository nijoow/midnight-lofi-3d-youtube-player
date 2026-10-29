import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialTimer,
  reconcileTimer,
  timerSeconds,
} from '../../src/app/_lib/timer';
test('uses elapsed wall time rather than counting ticks while a tab is suspended', () => {
  const timer = { ...initialTimer, running: true, anchor: 1000 };
  assert.equal(timerSeconds(timer, 61000), 1440);
  assert.equal(timerSeconds(timer, 1601000), 0);
});
test('finishing focus increments the count once and waits for an intentional break start', () => {
  const finished = reconcileTimer(
    { ...initialTimer, running: true, anchor: 1000 },
    1501000,
  );
  assert.equal(finished.finished, true);
  assert.equal(finished.timer.completed, 1);
  assert.equal(finished.timer.phase, 'break');
  assert.equal(finished.timer.seconds, 300);
  assert.equal(finished.timer.running, false);
  assert.equal(reconcileTimer(finished.timer, 1900000).finished, false);
});
test('free mode counts up and never automatically enters a break', () => {
  const timer = {
    ...initialTimer,
    mode: 0 as const,
    seconds: 30,
    running: true,
    anchor: 1000,
  };
  assert.equal(timerSeconds(timer, 361000), 390);
  assert.equal(reconcileTimer(timer, 9999999).finished, false);
});
test('a finished break returns to the chosen focus duration without starting automatically', () => {
  const result = reconcileTimer(
    {
      ...initialTimer,
      mode: 50,
      phase: 'break',
      seconds: 300,
      running: true,
      anchor: 1000,
      completed: 2,
    },
    301000,
  );
  assert.equal(result.timer.seconds, 3000);
  assert.equal(result.timer.phase, 'focus');
  assert.equal(result.timer.completed, 2);
  assert.equal(result.timer.running, false);
});

test('restores valid paused/running session data and rejects invalid timing state', async () => {
  const { restoreTimer, BREAK_SECONDS } = await import('../../src/app/_lib/timer');
  const now = 10000;
  for (const timer of [initialTimer, { ...initialTimer, running: true, anchor: 1000 }, { ...initialTimer, mode: 0, seconds: 50 }, { ...initialTimer, phase: 'break', seconds: BREAK_SECONDS }]) {
    assert.deepEqual(restoreTimer(JSON.stringify(timer), now), timer);
  }
  for (const raw of [null, '{bad', 'null', '[]', '{}', ...[
    { mode: 20 }, { phase: 'other' }, { seconds: -1 }, { seconds: 86401 },
    { completed: 0.5 }, { anchor: now + 1 }, { running: true, anchor: null },
    { seconds: '1500' }, { anchor: '1000' },
  ].map(patch => JSON.stringify({ ...initialTimer, ...patch }))]) {
    assert.equal(restoreTimer(raw, now), null, String(raw));
  }
});
