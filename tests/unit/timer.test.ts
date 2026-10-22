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
