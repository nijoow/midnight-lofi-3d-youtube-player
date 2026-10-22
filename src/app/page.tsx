'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { RoomScene } from './_components/three/RoomScene';
import { FocusPanel } from './_components/ui/FocusPanel';
import { PlayerScreen } from './_components/ui/PlayerScreen';
import { PlayerDock } from './_components/ui/PlayerDock';
import { MusicLibrary } from './_components/ui/MusicLibrary';
import { RoomSettings } from './_components/ui/RoomSettings';
import { Icon, type IconName } from './_components/ui/Icon';
import { Dialog } from './_components/ui/Dialog';
import { useRoomState } from './_hooks/useRoomState';
import { useFocusTimer } from './_hooks/useFocusTimer';
import { useYouTubePlayer } from './_hooks/useYouTubePlayer';
import { useSleepTimer } from './_hooks/useSleepTimer';
import {
  MOODS,
  formatTime,
  adjacentTrack,
  moveTrack,
  removeTrack,
  type CameraView,
  type Mood,
  type Track,
} from './_lib/room';

const MOOD_ICONS: Record<Mood, IconName> = {
  rain: 'rain',
  night: 'moon',
  sunset: 'sun',
};
export default function Home() {
  const {
    room,
    setRoom,
    updatePreferences,
    hydrated,
    storageUnavailable,
    reducedMotion,
  } = useRoomState();
  const preferences = room.preferences;
  const [panel, setPanel] = useState<'music' | 'settings' | 'help' | null>(
    null,
  );
  const screenRef = useRef<HTMLDivElement>(null);
  const [focusOpen, setFocusOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [cameraRevision, setCameraRevision] = useState(0);
  const focus = useFocusTimer();
  const currentTrack = room.playlist.find(track => track.id === room.currentId);
  const player = useYouTubePlayer({
    videoId: currentTrack?.id ?? null,
    volume: preferences.volume,
    muted: preferences.muted,
    onEnded: () => {
      const next = adjacentTrack(
        room.playlist,
        room.currentId,
        1,
        preferences.repeat,
        true,
      );
      if (!next) return;
      if (next === room.currentId) player.play();
      else {
        player.prepare();
        setRoom(prev => ({ ...prev, currentId: next }));
      }
    },
  });
  const sleep = useSleepTimer(() => {
    player.pause();
    setNotice('취침 예약 시간이 되어 음악을 멈췄어요.');
  });
  const openMusic = useCallback(() => setPanel('music'), []);
  const toggleLamp = useCallback(
    () =>
      setRoom(prev => ({
        ...prev,
        preferences: { ...prev.preferences, lampOn: !prev.preferences.lampOn },
      })),
    [setRoom],
  );
  const focusClock = useCallback(() => setFocusOpen(true), []);
  useEffect(() => {
    if (focusOpen) document.getElementById('focus-start')?.focus();
  }, [focusOpen]);
  const sceneFallback = useCallback(() => {
    updatePreferences({ mode: '2d' });
    setNotice(
      '이 기기에서는 2D 방으로 전환했어요. 음악과 타이머는 그대로 사용할 수 있어요.',
    );
  }, [updatePreferences]);
  const selectTrack = (id: string) => {
    if (id === room.currentId) {
      player.play();
      return;
    }
    player.prepare();
    setRoom(prev => ({
      ...prev,
      currentId: prev.playlist.some(track => track.id === id)
        ? id
        : prev.currentId,
    }));
  };
  const navigateTrack = (direction: -1 | 1) => {
    const id = adjacentTrack(
      room.playlist,
      room.currentId,
      direction,
      preferences.repeat,
    );
    if (id) selectTrack(id);
  };
  const addTrack = (track: Track) => {
    if (
      room.playlist.some(item => item.id === track.id) ||
      room.playlist.length >= 200
    )
      return false;
    setRoom(prev =>
      prev.playlist.some(item => item.id === track.id) ||
      prev.playlist.length >= 200
        ? prev
        : {
            ...prev,
            playlist: [...prev.playlist, track],
            currentId: prev.currentId ?? track.id,
          },
    );
    return true;
  };
  const togglePlayback = player.toggle;
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.code !== 'Space' ||
        event.repeat ||
        panel ||
        target.closest(
          'button, input, select, textarea, a, [contenteditable="true"]',
        )
      )
        return;
      event.preventDefault();
      togglePlayback();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [panel, togglePlayback]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 7000);
    return () => clearTimeout(timeout);
  }, [notice]);
  return (
    <main
      className={'midnight-app' + (reducedMotion ? ' reduce-motion' : '')}
      data-mood={preferences.mood}
      data-view={preferences.mode}
    >
      <button onClick={focusClock} className="skip-link">
        집중 타이머로 이동
      </button>
      <h1 className="sr-only">Midnight Lofi</h1>
      <header className="app-header">
        <Link href="/" className="wordmark" aria-label="Midnight Lofi 홈">
          <Icon name="moon" size={21} />
          <span>
            midnight <em>lofi</em>
          </span>
        </Link>
        <nav className="mood-switcher glass" aria-label="방 분위기">
          {(Object.keys(MOODS) as Mood[]).map(key => (
            <button
              key={key}
              aria-pressed={preferences.mood === key}
              onClick={() => updatePreferences({ mood: key })}
            >
              <Icon name={MOOD_ICONS[key]} size={16} />
              <span>{MOODS[key].label}</span>
            </button>
          ))}
        </nav>
        <div className="header-actions glass">
          <button
            className={'icon-button' + (focusOpen ? ' selected' : '')}
            aria-label="집중 타이머"
            id="focus-toggle"
            aria-expanded={focusOpen}
            aria-controls="focus-panel"
            onClick={() => setFocusOpen(value => !value)}
          >
            <Icon name="clock" size={18} />
            {focus.timer.running && (
              <span className="running-clock">
                {formatTime(focus.remaining)}
              </span>
            )}
          </button>
          <button
            className="icon-button"
            aria-label="방 설정"
            onClick={() => setPanel('settings')}
          >
            <Icon name="settings" size={19} />
          </button>
        </div>
      </header>
      <section className="room-stage" aria-label="빈티지 TV가 있는 밤의 거실">
        <div className="room-canvas">
          {hydrated ? (
            <RoomScene
              key={preferences.mode}
              mode={preferences.mode}
              mood={preferences.mood}
              camera={preferences.camera}
              cameraRevision={cameraRevision}
              lampOn={preferences.lampOn}
              focusing={focus.focusing}
              playing={player.status === 'playing'}
              reducedMotion={reducedMotion}
              lowQuality={preferences.quality === 'low'}
              screenRef={screenRef}
              onLamp={toggleLamp}
              onFallback={sceneFallback}
            />
          ) : (
            <div className="scene-loading">
              <span />
              TV를 준비하고 있어요
            </div>
          )}
        </div>
        <PlayerScreen
          track={currentTrack}
          player={player}
          onLibrary={openMusic}
          screenRef={screenRef}
          mood={preferences.mood}
        />
        <div className="room-vignette" aria-hidden="true" />
      </section>
      <aside
        id="focus-panel"
        className="focus-widget glass"
        hidden={!focusOpen}
      >
        <div className="focus-widget-heading">
          <span>집중 타이머</span>
          <button
            className="icon-button"
            aria-label="타이머 접기"
            onClick={() => {
              setFocusOpen(false);
              document.getElementById('focus-toggle')?.focus();
            }}
          >
            <Icon name="close" size={17} />
          </button>
        </div>
        <FocusPanel focus={focus} />
      </aside>
      <div className="scene-bottom">
        <div
          className="camera-switcher glass"
          role="group"
          aria-label="카메라 시점"
        >
          {(
            [
              { id: 'room', label: '기본 시점' },
              { id: 'desk', label: '거실' },
              { id: 'tv', label: 'TV 정면' },
            ] as { id: CameraView; label: string }[]
          ).map(view => (
            <button
              key={view.id}
              disabled={preferences.mode === '2d'}
              aria-pressed={preferences.camera === view.id}
              onClick={() => {
                updatePreferences({ camera: view.id });
                setCameraRevision(value => value + 1);
              }}
            >
              {view.label}
            </button>
          ))}
        </div>
        <div className="scene-tools glass">
          <button
            className={
              'icon-button' +
              (preferences.lampOn || focus.focusing ? ' selected' : '')
            }
            aria-label="거실 조명 전환"
            aria-pressed={preferences.lampOn || focus.focusing}
            onClick={toggleLamp}
          >
            <Icon name="lamp" size={17} />
          </button>
          <button
            className="icon-button mode-button"
            aria-label={
              preferences.mode === '3d' ? '2D 보기로 전환' : '3D 보기로 전환'
            }
            onClick={() =>
              updatePreferences({
                mode: preferences.mode === '3d' ? '2d' : '3d',
              })
            }
          >
            {preferences.mode === '3d' ? '2D' : '3D'}
          </button>
        </div>
      </div>
      <PlayerDock
        track={currentTrack}
        player={player}
        volume={preferences.volume}
        muted={preferences.muted}
        repeat={preferences.repeat}
        onVolume={volume =>
          updatePreferences({ volume, ...(volume > 0 ? { muted: false } : {}) })
        }
        onMute={() => updatePreferences({ muted: !preferences.muted })}
        onRepeat={() =>
          updatePreferences({
            repeat:
              preferences.repeat === 'off'
                ? 'all'
                : preferences.repeat === 'all'
                  ? 'one'
                  : 'off',
          })
        }
        onPrevious={() => navigateTrack(-1)}
        onNext={() => navigateTrack(1)}
        canPrevious={
          room.playlist.length > 1 &&
          !!adjacentTrack(room.playlist, room.currentId, -1, preferences.repeat)
        }
        canNext={
          room.playlist.length > 1 &&
          !!adjacentTrack(room.playlist, room.currentId, 1, preferences.repeat)
        }
        onLibrary={openMusic}
      />
      <footer className="app-footer">
        <span>드래그로 시점 이동</span>
        {(storageUnavailable || sleep.deadline) && (
          <span>
            {storageUnavailable ? '설정을 저장할 수 없어요' : ''}
            {storageUnavailable && sleep.deadline ? ' · ' : ''}
            {sleep.deadline ? sleep.minutes + '분 뒤 음악 종료' : ''}
          </span>
        )}
        <button onClick={() => setPanel('help')} className="text-button">
          사용법
        </button>
      </footer>
      <MusicLibrary
        open={panel === 'music'}
        onClose={() => setPanel(null)}
        playlist={room.playlist}
        currentId={room.currentId}
        onAdd={addTrack}
        onSelect={selectTrack}
        onRemove={id => {
          if (id === room.currentId) player.pause();
          setRoom(prev => removeTrack(prev, id));
        }}
        onMove={(id, direction) =>
          setRoom(prev => ({
            ...prev,
            playlist: moveTrack(prev.playlist, id, direction),
          }))
        }
      />
      <RoomSettings
        open={panel === 'settings'}
        onClose={() => setPanel(null)}
        preferences={preferences}
        onChange={updatePreferences}
        sleep={sleep}
      />
      <Dialog
        open={panel === 'help'}
        onClose={() => setPanel(null)}
        title="사용법"
      >
        <div className="help-body">
          <p>음악을 고르고 재생 버튼을 눌러주세요.</p>
          <ul>
            <li>
              <Icon name="music" />
              TV 화면을 눌러 재생하거나 ‘음악 고르기’에서 음악을 담아보세요.
            </li>
            <li>
              <Icon name="lamp" />
              스탠드를 눌러 불빛을 켜고 끌 수 있어요.
            </li>
            <li>
              <Icon name="clock" />
              상단 시계 버튼에서 집중 타이머를 열고 접을 수 있어요.
            </li>
            <li>
              <Icon name="expand" />
              3D 방을 드래그해 둘러보세요. ‘기본 시점’으로 돌아올 수 있어요.
            </li>
            <li>
              <Icon name="leaf" />
              기기가 뜨거워지면 설정에서 절전 모드나 2D 보기를 선택해 주세요.
            </li>
          </ul>
          <p className="subtle-text">
            음악은 재생 버튼을 누르면 시작해요. 브라우저가 자동 재생을 막으면
            영상 안의 재생 버튼을 눌러주세요.
          </p>
          <p className="subtle-text">
            집중과 취침 예약은 이 탭이 열려 있을 때 동작해요. 기기 절전으로
            중단되면 돌아왔을 때 남은 시간을 다시 확인해요.
          </p>
        </div>
      </Dialog>
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" size={16} />
          <span>{notice}</span>
          <button
            className="small-icon-button"
            onClick={() => setNotice('')}
            aria-label="안내 닫기"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
      {focus.notice && (
        <div className="focus-complete" role="status">
          <Icon name="leaf" size={19} />
          {focus.notice}
        </div>
      )}
    </main>
  );
}
