'use client';
import type { Track, RepeatMode } from '../../_lib/room';
import type { useYouTubePlayer } from '../../_hooks/useYouTubePlayer';
import { Icon } from './Icon';
export function PlayerDock({
  track,
  player,
  volume,
  muted,
  repeat,
  onVolume,
  onMute,
  onRepeat,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
  onLibrary,
}: {
  track: Track | undefined;
  player: ReturnType<typeof useYouTubePlayer>;
  volume: number;
  muted: boolean;
  repeat: RepeatMode;
  onVolume: (value: number) => void;
  onMute: () => void;
  onRepeat: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
  onLibrary: () => void;
}) {
  const playing = player.status === 'playing';
  const labels = {
    idle: '재생 준비',
    loading: '연결 중…',
    playing: '재생 중',
    paused: '일시정지',
    ended: '재생 종료',
    error: '재생 오류',
  };
  return (
    <section className="player-dock" aria-label="음악 플레이어">
      <div className="player-main">
        <div className="now-playing-label">
          <span
            className={'equalizer' + (playing ? ' playing' : '')}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="eyebrow">
            {track ? labels[player.status] : '선택한 음악 없음'}
          </span>
        </div>
        <h2 title={track?.title}>{track?.title || '음악을 선택해 주세요'}</h2>
        <div className="playback-controls">
          <button
            className="icon-button"
            aria-label="이전 음악"
            disabled={!canPrevious}
            onClick={onPrevious}
          >
            <Icon name="previous" size={20} />
          </button>
          <button
            className="play-button"
            aria-label={
              playing || player.status === 'loading'
                ? '음악 일시정지'
                : '음악 재생'
            }
            disabled={!track}
            onClick={player.toggle}
          >
            <Icon
              name={playing || player.status === 'loading' ? 'pause' : 'play'}
              size={23}
            />
          </button>
          <button
            className="icon-button"
            aria-label="다음 음악"
            disabled={!canNext}
            onClick={onNext}
          >
            <Icon name="next" size={20} />
          </button>
          <button
            className={
              'icon-button repeat-button' +
              (repeat !== 'off' ? ' selected' : '')
            }
            onClick={onRepeat}
            aria-label={
              '반복 모드: ' +
              { off: '반복 없음', all: '전체 반복', one: '한 곡 반복' }[repeat]
            }
            title="반복 모드 변경"
          >
            <Icon name="repeat" size={17} />
            {repeat === 'one' && <span>1</span>}
          </button>
        </div>
      </div>
      <div className="player-options">
        <button className="library-button" onClick={onLibrary}>
          <Icon name="music" size={17} />
          <span>음악 고르기</span>
          <Icon name="arrow" size={17} />
        </button>
        <div className="volume-control">
          <button
            className="icon-button"
            onClick={onMute}
            aria-label={muted ? '음소거 해제' : '음소거'}
          >
            <Icon name={muted || volume === 0 ? 'mute' : 'volume'} size={18} />
          </button>
          <input
            type="range"
            aria-label="음악 볼륨"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={e => onVolume(Number(e.target.value))}
          />
          <span>{muted ? '0' : volume}</span>
        </div>
        <span className="keyboard-hint">
          <kbd>space</kbd> 재생 / 일시정지
        </span>
      </div>
    </section>
  );
}
