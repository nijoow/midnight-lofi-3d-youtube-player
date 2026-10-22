'use client';
import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useRef } from 'react';
import type { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { nextIndex, removeFromQueue } from './_lib/youtube';
import { VintageTelevision } from './_components/three/VintageTelevision';
import Floor from './_components/three/Floor';
import LightControler from './_components/three/LightControler';
import SoftParticles from './_components/three/SoftParticles';
import { Furniture } from './_components/three/Furniture';
import Room from './_components/three/Room';
import TVGlow from './_components/three/TVGlow';
import PlayerControls from './_components/ui/PlayerControls';
import { YouTubeControlModal } from './_components/ui/YouTubeControlModal';

export default function Home() {
  const [playlist, setPlaylist] = useState([
    {
      id: 'W6eCLgTC-64',
      title:
        '【𝗣𝗹𝗮𝘆𝗹𝗶𝘀𝘁】 온기가 머무는 순간 🐱 | 당신의 몰입을 위한 로파이 재즈 음악 🎧 | 휴식·공부·코딩·작업용 플리',
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [playerError, setPlayerError] = useState('');
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(50);
  const playerRef = useRef<YouTubePlayer | null>(null);

  const currentVideo = playlist[currentIndex];

  const handleVideoEnd = () => {
    const next = nextIndex(currentIndex, playlist.length);
    setIsPlaying(false);
    if (next !== null) {
      setAutoplay(true);
      setCurrentIndex(next);
    }
  };

  const handlePlayerReady: YouTubeProps['onReady'] = event => {
    playerRef.current = event.target;
    event.target.setVolume(isMuted ? 0 : volume);
  };

  const handlePlayerState: YouTubeProps['onStateChange'] = event => {
    setIsPlaying(event.data === 1);
    if (event.data === 1) setPlayerError('');
  };

  const togglePlay = () => {
    if (!playerRef.current || !currentVideo) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      setAutoplay(true);
      setPlayerError('');
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.setVolume(prevVolume);
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      playerRef.current.setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  return (
    <main className="relative h-screen w-screen bg-[#0d0804] select-none">
      <Canvas
        className="absolute left-0 top-0 z-0 h-screen w-screen"
        camera={{ position: [2.8, 0.3, 1.2], fov: 55 }}
        shadows
        gl={{ antialias: true, toneMapping: 4, toneMappingExposure: 1.2 }}
      >
        <OrbitControls
          maxDistance={5}
          minDistance={2.0}
          maxPolarAngle={Math.PI * 0.5} // Prevents looking below the target (Y=-0.2)
          minPolarAngle={Math.PI * 0.2}
          minAzimuthAngle={0} // Prevents looking behind the TV left side
          maxAzimuthAngle={Math.PI} // Prevents looking behind the TV right side
          enablePan={false}
          target={[0, -0.2, 0]}
          autoRotate={false}
        />
        <LightControler />
        <Environment preset="night" />
        <Suspense fallback={null}>
          <Room />
          <Furniture />
          <VintageTelevision
            position={[0, -0.3, 0]}
            videoId={currentVideo?.id}
            onEnd={handleVideoEnd}
            onReady={handlePlayerReady}
            onStateChange={handlePlayerState}
            autoplay={autoplay}
            onError={() => {
              setIsPlaying(false);
              setPlayerError('이 영상을 재생할 수 없어요. 목록에서 다른 음악을 선택해 주세요.');
            }}
          />
          <TVGlow />
          <Floor />
          <SoftParticles />
        </Suspense>
      </Canvas>

      {/* UI Layer */}
      {playerError && <p role="alert" className="fixed bottom-32 left-4 right-4 z-50 text-center text-[#E8E1D5]">{playerError}</p>}
      <PlayerControls
        isPlaying={isPlaying}
        hasVideo={Boolean(currentVideo)}
        onTogglePlay={togglePlay}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
        isMuted={isMuted}
        onTogglePlaylist={() => setIsModalOpen(!isModalOpen)}
        isPlaylistOpen={isModalOpen}
      />

      <YouTubeControlModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playlist={playlist}
        currentIndex={currentIndex}
        onAddVideo={video => setPlaylist(prev => prev.some(item => item.id === video.id) ? prev : [...prev, video])}
        onPlayVideo={idx => {
          setAutoplay(true);
          setPlayerError('');
          if (idx === currentIndex) playerRef.current?.playVideo();
          else setCurrentIndex(idx);
        }}
        onRemoveVideo={idx => {
          const next = removeFromQueue({ tracks: playlist, index: currentIndex }, idx);
          setPlaylist(next.tracks);
          setCurrentIndex(next.index);
          if (!next.tracks.length) {
            playerRef.current?.stopVideo();
            setIsPlaying(false);
            setAutoplay(false);
          }
          setPlayerError('');
        }}
      />
    </main>
  );
}
