export type TimerMode = 25 | 50 | 0;
export interface TimerState {
  mode: TimerMode;
  phase: 'focus' | 'break';
  running: boolean;
  anchor: number | null;
  seconds: number;
  completed: number;
}
export const initialTimer: TimerState = {
  mode: 25,
  phase: 'focus',
  running: false,
  anchor: null,
  seconds: 25 * 60,
  completed: 0,
};
export function timerSeconds(timer: TimerState, now: number): number {
  if (!timer.running || timer.anchor === null) return timer.seconds;
  const elapsed = Math.max(0, Math.floor((now - timer.anchor) / 1000));
  return timer.mode === 0 && timer.phase === 'focus'
    ? timer.seconds + elapsed
    : Math.max(0, timer.seconds - elapsed);
}
export function reconcileTimer(
  timer: TimerState,
  now: number,
): { timer: TimerState; finished: boolean } {
  if (
    !timer.running ||
    (timer.mode === 0 && timer.phase === 'focus') ||
    timerSeconds(timer, now) > 0
  )
    return { timer, finished: false };
  const wasFocus = timer.phase === 'focus';
  return {
    timer: {
      ...timer,
      phase: wasFocus ? 'break' : 'focus',
      running: false,
      anchor: null,
      seconds: wasFocus ? 5 * 60 : timer.mode * 60,
      completed: timer.completed + (wasFocus ? 1 : 0),
    },
    finished: true,
  };
}
