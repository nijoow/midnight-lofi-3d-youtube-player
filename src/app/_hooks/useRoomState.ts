'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_ROOM,
  STORAGE_KEY,
  restoreRoom,
  type Preferences,
  type SavedRoom,
} from '../_lib/room';
export function useRoomState() {
  const [room, setRoom] = useState<SavedRoom>(DEFAULT_ROOM);
  const [hydrated, setHydrated] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReducedMotion(motion.matches);
    update();
    motion.addEventListener('change', update);
    try {
      const saved = restoreRoom(localStorage.getItem(STORAGE_KEY));
      if (saved) setRoom(saved);
      else if (window.matchMedia('(max-width: 700px)').matches) {
        setRoom(prev => ({
          ...prev,
          preferences: { ...prev.preferences, quality: 'low' },
        }));
      }
    } catch {
      setStorageUnavailable(true);
    }
    setHydrated(true);
    return () => motion.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(room));
    } catch {
      setStorageUnavailable(true);
    }
  }, [room, hydrated]);
  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    setRoom(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...patch },
    }));
  }, []);
  return {
    room,
    setRoom,
    updatePreferences,
    hydrated,
    storageUnavailable,
    reducedMotion: systemReducedMotion || room.preferences.reducedMotion,
  };
}
