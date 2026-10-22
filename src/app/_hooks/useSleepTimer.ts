'use client';
import { useEffect, useRef, useState } from 'react';
export function useSleepTimer(onExpire: () => void) {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [minutes, setMinutes] = useState(0);
  const callback = useRef(onExpire);
  callback.current = onExpire;
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const saved = Number(sessionStorage.getItem('midnight-room:sleep'));
      if (saved > Date.now() && saved < Date.now() + 86400000)
        setDeadline(saved);
    } catch {
      /* Optional persistence. */
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (deadline)
        sessionStorage.setItem('midnight-room:sleep', String(deadline));
      else sessionStorage.removeItem('midnight-room:sleep');
    } catch {
      /* Optional persistence. */
    }
    if (!deadline) {
      setMinutes(0);
      return;
    }
    const tick = () => {
      const left = Math.ceil((deadline - Date.now()) / 60000);
      setMinutes(Math.max(0, left));
      if (left <= 0) {
        setDeadline(null);
        callback.current();
      }
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [deadline, hydrated]);
  return {
    minutes,
    deadline,
    schedule: (duration: number) =>
      setDeadline(duration ? Date.now() + duration * 60000 : null),
  };
}
