'use client';
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * TV 화면에서 뿜어져 나오는 빛 효과 (Volume light / 광원 빔)
 * TV 위치 기준: position=[0, -0.3, 0], 스크린은 +X 방향을 향함
 */
const TVGlow = () => {
  const glowRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (glowRef.current) {
      glowRef.current.material instanceof THREE.MeshBasicMaterial &&
        (glowRef.current.material.opacity = 0.08 + Math.sin(t * 2) * 0.015);
    }
    if (beamRef.current) {
      beamRef.current.material instanceof THREE.MeshBasicMaterial &&
        (beamRef.current.material.opacity = 0.04 + Math.sin(t * 1.5 + 1) * 0.01);
    }
  });

  return (
    <group position={[0.4, -0.05, 0]}>
      {/* TV 앞에 퍼지는 소프트 글로우 */}
      <mesh
        ref={glowRef}
        rotation={[0, Math.PI / 2, 0]}
        position={[0.3, 0, 0]}
      >
        <planeGeometry args={[2.5, 2.0]} />
        <meshBasicMaterial
          color="#4488ff"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* TV 빛이 방 전체를 밝히는 넓은 글로우 */}
      <mesh
        ref={beamRef}
        rotation={[0, Math.PI / 2, 0]}
        position={[1.5, 0, 0]}
      >
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial
          color="#2255cc"
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default TVGlow;
