'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PlayerControlsProps {
  isPlaying: boolean;
  hasVideo: boolean;
  onTogglePlay: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onTogglePlaylist: () => void;
  isPlaylistOpen: boolean;
}

const PlayerControls = ({
  isPlaying,
  hasVideo,
  onTogglePlay,
  volume,
  onVolumeChange,
  onToggleMute,
  isMuted,
  onTogglePlaylist,
  isPlaylistOpen,
}: PlayerControlsProps) => {
  return (
    <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-md">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-6 rounded-2xl border border-[#3A2E26] bg-[#120F0D]/80 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        {/* Play / Pause */}
        <button
          onClick={onTogglePlay}
          disabled={!hasVideo}
          aria-label={isPlaying ? "음악 일시정지" : "음악 재생"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1613] text-[#C28464] border border-[#3A2E26] transition-colors hover:bg-[#2A201A] hover:text-[#E8E1D5]"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6 ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Volume Control */}
        <div className="flex flex-1 items-center gap-3 group">
          <button
            onClick={onToggleMute}
            className="text-[#8C7A6E] transition-colors hover:text-[#C28464]"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            aria-label="음악 볼륨"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#3A2E26] accent-[#C28464] hover:bg-[#5A3D31]"
          />
        </div>

        {/* Playlist Toggle */}
        <button
          onClick={onTogglePlaylist}
          aria-label="음악 목록"
          className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
            isPlaylistOpen
              ? 'bg-[#804D3B]/20 text-[#C28464] border-[#C28464]/50'
              : 'bg-[#1A1613] text-[#8C7A6E] border-[#3A2E26] hover:bg-[#2A201A] hover:text-[#E8E1D5]'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 12h16.5m-16.5-6.75h16.5M3.75 18.75h16.5"
            />
          </svg>
        </button>
      </motion.div>
    </div>
  );
};

export default PlayerControls;
