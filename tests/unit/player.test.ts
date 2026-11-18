import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { YouTubePlayer } from 'react-youtube';
import { useYouTubePlayer } from '../../src/app/_hooks/useYouTubePlayer';

test('a queued next video reuses the ready API and plays after cue; pause and retry remain functional', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true, window: globalThis });
  const calls: string[] = [];
  const target = {
    playVideo: () => calls.push('play'), pauseVideo: () => calls.push('pause'),
    setVolume: () => {}, mute: () => {}, unMute: () => {},
  } as unknown as YouTubePlayer;
  let player!: ReturnType<typeof useYouTubePlayer>;
  let videoId: string | null = 'abcdefghijk';
  const onEnded = () => player.prepare();
  function Harness() {
    player = useYouTubePlayer({videoId, volume:40, muted:false, onEnded});
    return null;
  }
  let root!: ReactTestRenderer;
  try {
    await act(() => { root = create(createElement(Harness)); });
    await act(() => player.play());
    await act(() => player.onReady({target, data:undefined}));
    await act(() => player.onStateChange({target, data:1}));
    assert.equal(player.status, 'playing');
    await act(() => { player.onEnd(); videoId = 'lmnopqrstuv'; root.update(createElement(Harness)); });
    assert.equal(player.attempt, 0, 'a next song must not remount the iframe');
    assert.equal(player.status, 'loading');
    const before = calls.length;
    await act(() => player.onStateChange({target, data:5}));
    assert.equal(calls.length, before + 1);
    assert.equal(calls.at(-1), 'play');
    await act(() => player.onStateChange({target, data:1}));
    await act(() => player.pause());
    assert.equal(calls.at(-1), 'pause', 'the ready API must survive track changes');
    await act(() => player.onStateChange({target, data:2}));
    const pausedCalls = calls.length;
    await act(() => player.onStateChange({target, data:5}));
    assert.equal(calls.length, pausedCalls, 'a paused track must not auto-start');
    await act(() => player.onError({target, data:150}));
    await act(() => player.play());
    assert.equal(player.attempt, 1, 'explicit retry may remount a failed iframe');
    await act(() => player.onReady({target, data:undefined}));
    await act(() => { videoId = null; root.update(createElement(Harness)); });
    assert.equal(player.status, 'idle');
  } finally {
    await act(() => root?.unmount());
    Reflect.deleteProperty(globalThis, 'window');
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
  }
});
