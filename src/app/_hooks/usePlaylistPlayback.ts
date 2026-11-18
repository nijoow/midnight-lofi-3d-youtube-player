'use client';
import type { Dispatch, SetStateAction } from 'react';
import { useYouTubePlayer } from './useYouTubePlayer';
import {
  adjacentTrack,
  appendTrack,
  canAddTrack,
  moveTrack,
  removeTrack,
  type SavedRoom,
  type Track,
} from '../_lib/room';

/** Coordinate queue changes with playback intent; room persistence stays with useRoomState. */
export function usePlaylistPlayback(
  room: SavedRoom,
  setRoom: Dispatch<SetStateAction<SavedRoom>>,
) {
  const preferences = room.preferences;
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
    if (!canAddTrack(room.playlist, track.id)) return false;
    setRoom(prev => appendTrack(prev, track));
    return true;
  };
  return {
    currentTrack,
    player,
    selectTrack,
    navigateTrack,
    addTrack,
    removeTrack: (id: string) => {
      if (id === room.currentId) player.pause();
      setRoom(prev => removeTrack(prev, id));
    },
    moveTrack: (id: string, direction: -1 | 1) =>
      setRoom(prev => ({
        ...prev,
        playlist: moveTrack(prev.playlist, id, direction),
      })),
    canPrevious:
      room.playlist.length > 1 &&
      !!adjacentTrack(room.playlist, room.currentId, -1, preferences.repeat),
    canNext:
      room.playlist.length > 1 &&
      !!adjacentTrack(room.playlist, room.currentId, 1, preferences.repeat),
  };
}
