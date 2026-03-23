import { useState, KeyboardEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface YouTubeVideoItem {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

interface YouTubeControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: { id: string; title: string }[];
  currentIndex: number;
  onAddVideo: (video: { id: string; title: string }) => void;
  onPlayVideo: (idx: number) => void;
  onRemoveVideo: (idx: number) => void;
}

export const YouTubeControlModal = ({
  isOpen,
  onClose,
  playlist,
  currentIndex,
  onAddVideo,
  onPlayVideo,
  onRemoveVideo,
}: YouTubeControlModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const currentVideo = playlist[currentIndex];

  const handleSearch = async (loadMore = false) => {
    if (!searchQuery.trim()) return;

    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setNextPageToken(null);
    }
    setError(null);

    try {
      let url = `/api/youtube/search?q=${encodeURIComponent(searchQuery)}`;
      if (loadMore && nextPageToken) {
        url += `&pageToken=${nextPageToken}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch YouTube videos');
      }

      if (loadMore) {
        setSearchResults(prev => [...prev, ...(data.items || [])]);
      } else {
        setSearchResults(data.items || []);
      }
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred during search',
      );
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - Dark and moody to match the lofi midnight vibe */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 bg-[url('/noise.png')] bg-repeat backdrop-blur-sm"
          >
            {/* Very subtle warm vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(20,15,10,0.8)_100%)]" />
          </motion.div>

          {/* Modal Content - Midnight Lofi Analog Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-4 z-50 flex shrink-0 flex-col overflow-hidden rounded-2xl border border-[#3A2E26] bg-[#120F0D]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md sm:inset-10 sm:p-10 md:inset-x-20 md:inset-y-12 lg:inset-x-40 lg:inset-y-16"
          >
            {/* Soft inner glow top edge */}
            <div className="pointer-events-none absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#5A3D31] to-transparent opacity-50" />

            <div className="relative z-10 flex h-full flex-col font-serif text-[#E8E1D5]">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between border-b border-[#3A2E26] pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-[#C28464] shadow-[0_0_8px_#C28464]" />
                  <h2 className="text-xl font-semibold tracking-wide text-[#E8E1D5]">
                    YOUTUBE PLAYLIST
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-[#8C7A6E] transition-colors hover:bg-[#2A201A] hover:text-[#E8E1D5]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Lofi elegant scrollbar inline styles */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #3A2E26; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #5A3D31; }
              `,
                }}
              />

              <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0 overflow-hidden">
                {/* Left Column: Playlist Queue & Current Info */}
                <div className="flex flex-col w-full md:w-1/3 shrink-0">
                  {/* Current Video Info */}
                  <div className="mb-6 rounded-xl border border-[#2A201A] bg-[#181411] p-4 shadow-inner shrink-0">
                    <div className="mb-1 font-sans text-xs uppercase tracking-widest text-[#8C7A6E]">
                      Now Playing Signal
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="line-clamp-2 font-sans text-base text-[#C28464]"
                        dangerouslySetInnerHTML={{ __html: currentVideo?.title || 'No Signal' }}
                      />
                    </div>
                  </div>

                  {/* Playlist List */}
                  <div className="mb-2 font-sans text-xs uppercase tracking-widest text-[#8C7A6E] shrink-0">
                    Up Next / Queue
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6 md:mb-0">
                    <div className="flex flex-col gap-2">
                      {playlist.map((item, idx) => (
                        <div 
                          key={idx + item.id} 
                          className={`flex justify-between items-center rounded-lg border p-3 transition-colors ${
                            idx === currentIndex 
                              ? 'border-[#C28464]/50 bg-[#2A201A]' 
                              : 'border-[#2A201A] bg-[#15120F] hover:bg-[#1A1613]'
                          }`}
                        >
                          <button 
                            className={`flex flex-1 text-left line-clamp-2 text-sm ${idx === currentIndex ? 'text-[#C28464]' : 'text-[#E8E1D5]'}`}
                            onClick={() => onPlayVideo(idx)}
                          >
                            <span className="mr-2 font-mono text-[#8C7A6E]">{idx + 1}.</span>
                            <span dangerouslySetInnerHTML={{ __html: item.title }} />
                          </button>
                          <button 
                            onClick={() => onRemoveVideo(idx)}
                            className="ml-2 px-2 py-1 text-xs text-[#8C7A6E] transition hover:text-[#D9534F] font-sans rounded hover:bg-[#D9534F]/10"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {playlist.length === 0 && (
                        <div className="p-4 text-center text-sm text-[#6B5A50] italic border border-dashed border-[#2A201A] rounded-lg">
                          Playlist is empty
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Search */}
                <div className="flex flex-col flex-1 min-w-0">
                  {/* Search Input Section */}
                  <div className="relative mb-6 flex gap-4 shrink-0">
                    <div className="group relative flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                        <svg
                          className="h-5 w-5 text-[#8C7A6E] transition-colors group-focus-within:text-[#C28464]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search Videos..."
                        className="w-full rounded-t-lg border-b-2 border-[#3A2E26] bg-[#1A1613] py-4 pl-12 pr-4 font-sans text-[#E8E1D5] placeholder-[#6B5A50] transition-all focus:border-[#C28464] focus:bg-[#201B17] focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleSearch(false)}
                      disabled={isLoading}
                      className="rounded-lg border border-[#965A46]/50 bg-[#804D3B] px-8 py-4 font-sans font-medium tracking-wide text-[#E8E1D5] shadow-[0_4px_14px_rgba(0,0,0,0.4)] transition-all hover:bg-[#965A46] active:translate-y-1 active:transform active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? 'SEARCHING...' : 'SEARCH'}
                    </button>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 rounded-lg border border-[#D9534F]/30 bg-[#3A1D1A]/30 p-3 font-sans text-sm text-[#D9534F] shrink-0">
                      [!] Connection lost: {error}
                    </div>
                  )}

                  {/* Search Results */}
                  <div
                    ref={searchContainerRef}
                    className="custom-scrollbar flex-1 overflow-y-auto rounded-xl border border-[#2A201A] bg-[#15120F] p-2 shadow-inner sm:p-4"
                  >
                    {searchResults.length === 0 && !isLoading && !error ? (
                      <div className="flex h-full flex-col items-center justify-center font-sans text-[#6B5A50] selection:bg-transparent">
                        <svg
                          className="mb-3 h-12 w-12 opacity-20"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1"
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm uppercase tracking-widest">
                          Awaiting Signal
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 font-sans">
                        {searchResults.map((video, sidx) => (
                          <div
                            key={video.id + sidx}
                            className="group flex flex-col gap-4 rounded-xl border border-transparent p-3 text-left transition-all hover:border-[#3A2E26] hover:bg-[#1A1613] sm:flex-row sm:items-center"
                          >
                            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-black sm:w-32 md:w-40">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                              />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col justify-center">
                              <h3
                                className="mb-1 line-clamp-2 font-medium text-[#E8E1D5] transition-colors group-hover:text-[#C28464]"
                                dangerouslySetInnerHTML={{
                                  __html: video.title,
                                }}
                              />
                              <p className="mb-1 text-sm text-[#8C7A6E]">
                                {video.channelTitle}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                onAddVideo({
                                  id: video.id,
                                  title: video.title,
                                })
                              }
                              className="shrink-0 px-4 py-2 border border-[#965A46]/50 bg-[#804D3B]/20 hover:bg-[#804D3B]/80 text-[#C28464] hover:text-[#E8E1D5] rounded-lg transition-all shadow-sm font-sans text-sm tracking-wide flex items-center"
                            >
                              <b className="mr-1">+</b> Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 무한 스크롤 / 더 보기 버튼 */}
                    {nextPageToken && searchResults.length > 0 && !isLoading && !error && (
                      <div className="mt-4 flex justify-center pb-2">
                        <button
                          onClick={() => handleSearch(true)}
                          disabled={isLoadingMore}
                          className="rounded-full border border-[#3A2E26] bg-[#1A1613] px-6 py-2 font-sans text-sm tracking-widest text-[#8C7A6E] transition-colors hover:bg-[#2A201A] hover:text-[#C28464] disabled:opacity-50"
                        >
                          {isLoadingMore ? 'LOADING...' : 'LOAD MORE'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
