import type { CSSProperties } from 'react';
export type IconName =
  | 'moon'
  | 'rain'
  | 'sun'
  | 'play'
  | 'pause'
  | 'next'
  | 'previous'
  | 'volume'
  | 'mute'
  | 'music'
  | 'close'
  | 'plus'
  | 'search'
  | 'settings'
  | 'check'
  | 'lamp'
  | 'clock'
  | 'reset'
  | 'arrow'
  | 'link'
  | 'trash'
  | 'up'
  | 'down'
  | 'repeat'
  | 'leaf'
  | 'expand'
  | 'help';
const paths: Record<IconName, string> = {
  moon: 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z',
  rain: 'M7 15a5 5 0 1 1 1.2-9.85A6 6 0 0 1 20 8a3.5 3.5 0 0 1-.5 7M8 18l-1 3m6-3-1 3m6-3-1 3',
  sun: 'M12 3V1m0 22v-2M3 12H1m22 0h-2M4.2 4.2 2.8 2.8m18.4 18.4-1.4-1.4M4.2 19.8l-1.4 1.4M21.2 2.8l-1.4 1.4M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
  play: 'm9 5 11 7-11 7V5Z',
  pause: 'M8 5v14M16 5v14',
  next: 'm5 5 10 7-10 7V5ZM19 5v14',
  previous: 'm19 5-10 7 10 7V5ZM5 5v14',
  volume: 'm11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
  mute: 'm11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6',
  music:
    'M9 18V5l11-2v13M9 7l11-2M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0m11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  close: 'm6 6 12 12M6 18 18 6',
  plus: 'M12 5v14M5 12h14',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  settings: 'M4 7h16M4 17h16M8 4v6m8 4v6',
  check: 'm5 12 4 4L20 5',
  lamp: 'm8 3-5 10h18L16 3H8Zm4 10v8m-4 0h8',
  clock: 'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  reset: 'M3 10a9 9 0 1 1 1.5 7M3 3v7h7',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  link: 'm10 13 4-4m-5 7-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2-1 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  up: 'm6 15 6-6 6 6',
  down: 'm6 9 6 6 6-6',
  repeat:
    'M3 10V8a3 3 0 0 1 3-3h14m-4-4 4 4-4 4M21 14v2a3 3 0 0 1-3 3H4m4 4-4-4 4-4',
  leaf: 'M20 3C8 1 1 8 5 16c4 8 17 3 15-13ZM4 21 15 10',
  expand: 'M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6',
  help: 'M9 9a3 3 0 1 1 5 2c-2 1-2 1-2 3m0 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
};
export function Icon({
  name,
  size = 20,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
