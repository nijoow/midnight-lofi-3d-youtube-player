'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { YouTubePlayer, YouTubeProps } from 'react-youtube';
export type PlaybackStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error';
export function useYouTubePlayer({
  videoId,
  volume,
  muted,
  onEnded,
}: {
  videoId: string | null;
  volume: number;
  muted: boolean;
  onEnded: () => void;
}) {
  const ref = useRef<YouTubePlayer | null>(null);
  const wantsPlayback = useRef(false);
  const ended = useRef(onEnded);
  ended.current = onEnded;
  const [activated, setActivated] = useState(false);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    ref.current = null;
    setError('');
    setStatus(videoId && activated ? 'loading' : 'idle');
  }, [videoId, activated, attempt]);
  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    void player.setVolume(volume);
    if (muted) void player.mute();
    else void player.unMute();
  }, [volume, muted]);
  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(() => {
      if (!ref.current) {
        setStatus('error');
        setError(
          'YouTube에 연결하지 못했어요. 연결을 확인하고 다시 시도해 주세요.',
        );
      } else {
        setStatus('paused');
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [status, videoId, attempt]);
  const pause = useCallback(() => {
    wantsPlayback.current = false;
    if (ref.current) void ref.current.pauseVideo();
    // Cancel a pending play, including a delayed IFrame API ready event.
    setStatus(prev => (prev === 'loading' ? 'paused' : prev));
  }, []);
  const prepare = useCallback(() => {
    wantsPlayback.current = true;
    setActivated(true);
  }, []);
  const play = useCallback(() => {
    if (!videoId) return;
    wantsPlayback.current = true;
    setError('');
    if (ref.current) {
      void ref.current.playVideo();
    } else if (activated) {
      setAttempt(prev => prev + 1);
    } else {
      setActivated(true);
    }
  }, [videoId, activated]);
  const onReady: NonNullable<YouTubeProps['onReady']> = useCallback(
    event => {
      ref.current = event.target;
      void event.target.setVolume(volume);
      if (muted) void event.target.mute();
      else void event.target.unMute();
      setError('');
      setStatus('paused');
      if (wantsPlayback.current) void event.target.playVideo();
    },
    [volume, muted],
  );
  const onStateChange: NonNullable<YouTubeProps['onStateChange']> = useCallback(
    event => {
      if (event.data === 1) {
        setStatus('playing');
        setError('');
      } else if (event.data === 2 || event.data === 5) setStatus('paused');
      else if (event.data === 0) setStatus('ended');
      else if (event.data === 3) setStatus('loading');
    },
    [],
  );
  const onError: NonNullable<YouTubeProps['onError']> = useCallback(event => {
    ref.current = null;
    setStatus('error');
    wantsPlayback.current = false;
    setError(
      [100, 101, 150].includes(event.data)
        ? '이 영상은 여기에서 재생할 수 없어요. 다른 음악을 선택하거나 YouTube에서 열어 주세요.'
        : '영상을 불러오지 못했어요. 다시 시도하거나 다른 음악을 선택해 주세요.',
    );
  }, []);
  const onEnd = useCallback(() => {
    wantsPlayback.current = false;
    setStatus('ended');
    ended.current();
  }, []);
  return {
    status,
    error,
    activated,
    attempt,
    play,
    pause,
    prepare,
    onReady,
    onStateChange,
    onError,
    onEnd,
    toggle: status === 'playing' || status === 'loading' ? pause : play,
  };
}
