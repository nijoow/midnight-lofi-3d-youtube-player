'use client';
import dynamic from 'next/dynamic';
import {
  Component,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { VintageRoomProps } from './VintageRoom';
import { MOODS, type Mood } from '../../_lib/room';
const VintageRoom = dynamic(() => import('./VintageRoom'), {
  ssr: false,
  loading: () => (
    <div className="scene-loading">
      <span /> TV를 준비하고 있어요
    </div>
  ),
});
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function TelevisionBackdrop({ mood }: { mood: Mood }) {
  return (
    <div
      className="flat-television"
      role="img"
      aria-label={MOODS[mood].label + '의 빈티지 TV'}
    >
      <div className="flat-case">
        <div className="flat-bezel" />
        <div className="flat-controls">
          <span />
          <span />
          <i />
          <small>STEREO SOUND</small>
        </div>
      </div>
      <div className="flat-feet" />
    </div>
  );
}
export function RoomScene({
  mode,
  onFallback,
  ...props
}: Omit<VintageRoomProps, 'active' | 'onFailure'> & {
  mode: '3d' | '2d';
  onFallback: () => void;
}) {
  const [active, setActive] = useState(true);
  const [failed, setFailed] = useState(false);
  const fallback = useCallback(() => {
    setFailed(true);
    onFallback();
  }, [onFallback]);
  useEffect(() => {
    const handle = () => setActive(!document.hidden);
    handle();
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, []);
  if (mode === '2d' || failed) return <TelevisionBackdrop mood={props.mood} />;
  return (
    <SceneBoundary onFailure={fallback}>
      <VintageRoom {...props} active={active} onFailure={fallback} />
    </SceneBoundary>
  );
}
