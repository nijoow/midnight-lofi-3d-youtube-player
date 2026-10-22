'use client';
import dynamic from 'next/dynamic';
import type { RefObject } from 'react';
import type { Track, Mood } from '../../_lib/room';
import type { useYouTubePlayer } from '../../_hooks/useYouTubePlayer';
import { Icon } from './Icon';
const YouTube = dynamic(() => import('../video/YouTubeEmbed'), { ssr: false });
const OPTIONS = {
  width: '100%',
  height: '100%',
  playerVars: {
    autoplay: 0 as const,
    playsinline: 1 as const,
    rel: 0 as const,
  },
};
export function PlayerScreen({
  track,
  player,
  onLibrary,
  screenRef,
  mood,
}: {
  track: Track | undefined;
  player: ReturnType<typeof useYouTubePlayer>;
  onLibrary: () => void;
  screenRef: RefObject<HTMLDivElement | null>;
  mood: Mood;
}) {
  return (
    <div ref={screenRef} className="tv-screen" aria-label="TV 화면">
      <div className="video-monitor">
        {player.activated && track ? (
          <YouTube
            key={track.id + '-' + player.attempt}
            videoId={track.id}
            title={track.title}
            opts={OPTIONS}
            className="youtube-embed"
            onReady={player.onReady}
            onStateChange={player.onStateChange}
            onError={player.onError}
            onEnd={player.onEnd}
          />
        ) : (
          <button
            className="monitor-start"
            onClick={track ? player.play : onLibrary}
            aria-label={track ? '음악 켜기' : '첫 음악 고르기'}
          >
            <span className={'standby-landscape ' + mood} aria-hidden="true">
              <span className="standby-moon" />
              <span className="standby-ridge" />
              <span className="standby-horizon" />
            </span>
            <span className="standby-brand">
              midnight <em>lofi</em>
            </span>
            <span className="monitor-caption">
              <Icon name="play" size={12} />
              {track ? '재생' : '음악 고르기'}
            </span>
          </button>
        )}
        {player.error && (
          <div className="player-error">
            <Icon name="music" size={24} />
            <p>{player.error}</p>
            <div>
              <button className="secondary-button" onClick={player.play}>
                다시 시도
              </button>
              {track && (
                <a
                  href={'https://www.youtube.com/watch?v=' + track.id}
                  target="_blank"
                  rel="noreferrer"
                >
                  YouTube에서 열기 ↗
                </a>
              )}
            </div>
          </div>
        )}
        {player.status === 'loading' && (
          <span className="connection-status" role="status">
            음악에 연결 중…
          </span>
        )}
      </div>
    </div>
  );
}
