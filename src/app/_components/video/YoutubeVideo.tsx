import React from 'react';
import YouTube from 'react-youtube';

const YoutubeVideo = () => {
  return (
    <YouTube
      videoId="xjjpTuG9GyU"
      opts={{
        height: '100%',
        width: '100%',
        playerVars: { autoplay: 1, loop: 1, modestbranding: undefined, rel: 0 },
      }}
      className="h-full w-full"
    />
  );
};

export default YoutubeVideo;
