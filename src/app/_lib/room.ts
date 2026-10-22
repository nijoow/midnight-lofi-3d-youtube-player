export type Mood = 'rain' | 'night' | 'sunset';
export type CameraView = 'room' | 'desk' | 'tv';
export type RepeatMode = 'off' | 'all' | 'one';
export interface Track {
  id: string;
  title: string;
  channel?: string;
}
export interface Preferences {
  mood: Mood;
  camera: CameraView;
  lampOn: boolean;
  quality: 'balanced' | 'low';
  mode: '3d' | '2d';
  reducedMotion: boolean;
  volume: number;
  muted: boolean;
  repeat: RepeatMode;
}
export interface SavedRoom {
  version: 1;
  preferences: Preferences;
  playlist: Track[];
  currentId: string | null;
}
export const STORAGE_KEY = 'midnight-room:v1';
export const MOODS = {
  rain: {
    label: '비 오는 새벽',
    english: 'RAINY DAWN',
    description: '창밖의 비처럼, 생각도 잠시 흘려보내요.',
    wall: '#809c91',
    floor: '#99734e',
    sky: '#536f86',
    window: '#8da9b3',
    accent: '#d8c39e',
    background: '#0d0804',
  },
  night: {
    label: '조용한 밤',
    english: 'QUIET NIGHT',
    description: '고요한 밤, 오롯이 나만의 속도로.',
    wall: '#72868e',
    floor: '#866545',
    sky: '#202e56',
    window: '#657aa8',
    accent: '#b8c9d8',
    background: '#0b0b10',
  },
  sunset: {
    label: '노을 지는 방',
    english: 'GOLDEN HOUR',
    description: '하루의 끝에 남은, 다정한 빛 한 조각.',
    wall: '#bba790',
    floor: '#a47850',
    sky: '#c48275',
    window: '#efbb87',
    accent: '#edc29e',
    background: '#160e08',
  },
} satisfies Record<
  Mood,
  {
    label: string;
    english: string;
    description: string;
    wall: string;
    floor: string;
    sky: string;
    window: string;
    accent: string;
    background: string;
  }
>;
export const RECOMMENDATIONS: Track[] = [
  { id: 'W6eCLgTC-64', title: '온기가 머무는 순간 · 로파이 재즈' },
  {
    id: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio · beats to relax/study to',
    channel: 'Lofi Girl',
  },
  {
    id: 'rUxyKA_-grg',
    title: 'synthwave radio · beats to chill/game to',
    channel: 'Lofi Girl',
  },
];
export const DEFAULT_PREFERENCES: Preferences = {
  mood: 'rain',
  camera: 'room',
  lampOn: true,
  quality: 'balanced',
  mode: '3d',
  reducedMotion: false,
  volume: 40,
  muted: false,
  repeat: 'all',
};
export const DEFAULT_ROOM: SavedRoom = {
  version: 1,
  preferences: DEFAULT_PREFERENCES,
  playlist: [RECOMMENDATIONS[0]],
  currentId: RECOMMENDATIONS[0].id,
};
const VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;
export function parseVideoId(value: string): string | null {
  const input = value.trim();
  if (VIDEO_ID.test(input)) return input;
  try {
    const url = new URL(input);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === 'youtu.be') id = url.pathname.split('/')[1];
    else if (
      [
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'music.youtube.com',
        'www.youtube-nocookie.com',
      ].includes(host)
    ) {
      id =
        url.pathname === '/watch'
          ? url.searchParams.get('v')
          : /^\/(shorts|embed|live)\//.test(url.pathname)
            ? url.pathname.split('/')[2]
            : null;
    }
    return id && VIDEO_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}
function isTrack(value: unknown): value is Track {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    VIDEO_ID.test(v.id) &&
    typeof v.title === 'string' &&
    v.title.length > 0 &&
    v.title.length <= 500
  );
}
export function restoreRoom(raw: string | null): SavedRoom | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.playlist)) return null;
    const playlist: Track[] = Array.from(
      new Map<string, Track>(
        data.playlist
          .filter(isTrack)
          .slice(0, 200)
          .map((t: Track) => [
            t.id,
            {
              id: t.id,
              title: t.title,
              ...(typeof t.channel === 'string'
                ? { channel: t.channel.slice(0, 150) }
                : {}),
            },
          ]),
      ).values(),
    );
    const p = data.preferences || {};
    const preferences: Preferences = {
      mood: ['rain', 'night', 'sunset'].includes(p.mood) ? p.mood : 'rain',
      camera: ['room', 'desk', 'tv'].includes(p.camera) ? p.camera : 'room',
      quality: p.quality === 'low' ? 'low' : 'balanced',
      mode: p.mode === '2d' ? '2d' : '3d',
      lampOn: typeof p.lampOn === 'boolean' ? p.lampOn : true,
      reducedMotion: p.reducedMotion === true,
      volume:
        typeof p.volume === 'number' && Number.isFinite(p.volume)
          ? Math.min(100, Math.max(0, p.volume))
          : 40,
      muted: p.muted === true,
      repeat: ['off', 'all', 'one'].includes(p.repeat) ? p.repeat : 'all',
    };
    return {
      version: 1,
      preferences,
      playlist,
      currentId: playlist.some(t => t.id === data.currentId)
        ? data.currentId
        : playlist[0]?.id ?? null,
    };
  } catch {
    return null;
  }
}
export function removeTrack(room: SavedRoom, id: string): SavedRoom {
  const index = room.playlist.findIndex(t => t.id === id);
  const playlist = room.playlist.filter(t => t.id !== id);
  return {
    ...room,
    playlist,
    currentId:
      room.currentId === id
        ? playlist[Math.min(index, playlist.length - 1)]?.id ?? null
        : room.currentId,
  };
}
export function adjacentTrack(
  playlist: Track[],
  id: string | null,
  direction: -1 | 1,
  repeat: RepeatMode,
  ended = false,
): string | null {
  if (!playlist.length) return null;
  const index = playlist.findIndex(t => t.id === id);
  if (ended && repeat === 'one') return id;
  const next = index + direction;
  if (next >= 0 && next < playlist.length) return playlist[next].id;
  return repeat === 'all'
    ? playlist[(next + playlist.length) % playlist.length].id
    : null;
}
export function moveTrack(
  playlist: Track[],
  id: string,
  direction: -1 | 1,
): Track[] {
  const from = playlist.findIndex(t => t.id === id),
    to = from + direction;
  if (from < 0 || to < 0 || to >= playlist.length) return playlist;
  const copy = [...playlist];
  [copy[from], copy[to]] = [copy[to], copy[from]];
  return copy;
}
export function formatTime(seconds: number): string {
  const value = Math.max(0, Math.floor(seconds));
  return (
    String(Math.floor(value / 60)).padStart(2, '0') +
    ':' +
    String(value % 60).padStart(2, '0')
  );
}
