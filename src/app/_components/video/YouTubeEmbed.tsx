'use client';
import { useEffect, useRef } from 'react';
import YouTube, { type YouTubeProps } from 'react-youtube';
export default function YouTubeEmbed({ videoId, ...props }: YouTubeProps) {
  const player = useRef<YouTube>(null);
  const initialVideoId = useRef(videoId);
  const previousVideoId = useRef(videoId);
  useEffect(() => {
    if (previousVideoId.current === videoId) return;
    previousVideoId.current = videoId;
    const api = player.current?.getInternalPlayer();
    if (videoId) void api?.cueVideoById({ videoId });
    else void api?.stopVideo();
  }, [videoId]);
  // react-youtube 10 resets its player when its videoId prop changes, even
  // with a stable React key. Cue subsequent tracks through the ready API.
  return <YouTube ref={player} {...props} videoId={initialVideoId.current} />;
}
