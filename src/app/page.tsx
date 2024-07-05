'use client';
import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { VintageTelevision } from './_components/three/VintageTelevision';

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <Canvas
        className="h-screen w-screen bg-black"
        camera={{ position: [2, 0, 0] }}
        shadows
      >
        <OrbitControls />
        <Environment preset="studio" />
        <Suspense fallback={null}>
          <VintageTelevision position={[0, 0, 0]} />
        </Suspense>
      </Canvas>
    </main>
  );
}
