import React from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

interface YoutubeVideoProps {
  videoId: string;
  onEnd?: () => void;
  onReady?: YouTubeProps['onReady'];
  onStateChange?: YouTubeProps['onStateChange'];
  onError?: YouTubeProps['onError'];
  autoplay?: boolean;
}

const YoutubeVideo = ({ videoId, onEnd, onReady, onStateChange, onError, autoplay = false }: YoutubeVideoProps) => {
  return (
    <YouTube
      videoId={videoId}
      onEnd={onEnd}
      onReady={onReady}
      onStateChange={onStateChange}
      onError={onError}
      opts={{
        height: '100%',
        width: '100%',
        playerVars: { autoplay: autoplay ? 1 : 0, playsinline: 1, rel: 0 },
      }}
      className="h-full w-full"
    />
  );
};

export default YoutubeVideo;
