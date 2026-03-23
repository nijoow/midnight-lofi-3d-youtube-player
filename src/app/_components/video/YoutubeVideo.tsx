import React from 'react';
import YouTube from 'react-youtube';

interface YoutubeVideoProps {
  videoId: string;
  onEnd?: () => void;
}

const YoutubeVideo = ({ videoId, onEnd }: YoutubeVideoProps) => {
  return (
    <YouTube
      videoId={videoId}
      onEnd={onEnd}
      opts={{
        height: '100%',
        width: '100%',
        playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
      }}
      className="h-full w-full"
    />
  );
};

export default YoutubeVideo;
