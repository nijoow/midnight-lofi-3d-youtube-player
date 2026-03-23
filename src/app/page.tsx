'use client';
import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { VintageTelevision } from './_components/three/VintageTelevision';
import Floor from './_components/three/Floor';
import LightControler from './_components/three/LightControler';
import SoftParticles from './_components/three/SoftParticles';
import { Furniture } from './_components/three/Furniture';
import Room from './_components/three/Room';
import TVGlow from './_components/three/TVGlow';
import { FloatingControlButton } from './_components/ui/FloatingControlButton';
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

  const currentVideo = playlist[currentIndex];

  const handleVideoEnd = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <main className="relative h-screen w-screen bg-[#0d0804]">
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
          />
          <TVGlow />
          <Floor />
          <SoftParticles />
        </Suspense>
      </Canvas>

      {/* UI Layer */}
      <FloatingControlButton
        onClick={() => setIsModalOpen(!isModalOpen)}
        isOpen={isModalOpen}
      />
      <YouTubeControlModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playlist={playlist}
        currentIndex={currentIndex}
        onAddVideo={video => setPlaylist(prev => [...prev, video])}
        onPlayVideo={idx => setCurrentIndex(idx)}
        onRemoveVideo={idx => {
          setPlaylist(prev => prev.filter((_, i) => i !== idx));
          if (idx < currentIndex) setCurrentIndex(prev => prev - 1);
          else if (idx === currentIndex) setCurrentIndex(0);
        }}
      />
    </main>
  );
}
