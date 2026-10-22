'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  initialTimer,
  reconcileTimer,
  timerSeconds,
  type TimerMode,
  type TimerState,
} from '../_lib/timer';
const KEY = 'midnight-room:focus:v1';
export function useFocusTimer() {
  const [timer, setTimer] = useState<TimerState>(initialTimer);
  const [now, setNow] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const time = Date.now();
    setNow(time);
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (
        saved &&
        [0, 25, 50].includes(saved.mode) &&
        ['focus', 'break'].includes(saved.phase) &&
        typeof saved.running === 'boolean' &&
        Number.isFinite(saved.seconds) &&
        saved.seconds >= 0 &&
        saved.seconds <= 86400 &&
        Number.isInteger(saved.completed) &&
        saved.completed >= 0 &&
        (saved.anchor === null ||
          (Number.isFinite(saved.anchor) && saved.anchor <= time)) &&
        (!saved.running || saved.anchor !== null)
      ) {
        const result = reconcileTimer(saved, time);
        setTimer(result.timer);
        if (result.finished)
          setNotice('집중 시간이 끝났어요. 잠시 쉬어가세요.');
      }
    } catch {
      /* Session storage is optional. */
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(timer));
    } catch {
      /* Keep working without storage. */
    }
  }, [timer, hydrated]);
  useEffect(() => {
    if (!timer.running) return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      const result = reconcileTimer(timer, time);
      if (result.finished) {
        setTimer(result.timer);
        setNotice(
          timer.phase === 'focus'
            ? '한 번의 몰입을 마쳤어요. 5분간 쉬어가세요.'
            : '휴식이 끝났어요. 준비되면 다시 시작해요.',
        );
      }
    };
    const interval = window.setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [timer]);
  const toggle = useCallback(() => {
    const time = Date.now();
    setNow(time);
    setNotice('');
    setTimer(prev =>
      prev.running
        ? {
            ...prev,
            running: false,
            seconds: timerSeconds(prev, time),
            anchor: null,
          }
        : { ...prev, running: true, anchor: time },
    );
  }, []);
  const selectMode = useCallback((mode: TimerMode) => {
    setTimer(prev => ({
      ...initialTimer,
      mode,
      seconds: mode * 60,
      completed: prev.completed,
    }));
    setNotice('');
  }, []);
  const reset = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      running: false,
      anchor: null,
      seconds: prev.phase === 'break' ? 300 : prev.mode * 60,
    }));
    setNotice('');
  }, []);
  return {
    timer,
    remaining: timerSeconds(timer, now || Date.now()),
    toggle,
    selectMode,
    reset,
    notice,
    focusing: timer.running && timer.phase === 'focus',
  };
}
