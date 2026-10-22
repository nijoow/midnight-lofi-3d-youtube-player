'use client';
import YouTube, { type YouTubeProps } from 'react-youtube';
export default function YouTubeEmbed(props: YouTubeProps) {
  return <YouTube {...props} />;
}
