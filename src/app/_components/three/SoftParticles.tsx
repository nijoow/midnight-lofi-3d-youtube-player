'use client';
import { Points, PointMaterial } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 먼지 파티클 - 공기 중 먼지가 TV 빛에 반짝이는 효과
 * 따뜻한 주황빛 + 블루빛 계열 두 레이어로 분리
 */
const SoftParticles = () => {
  const dustRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Points>(null);

  const { dustPositions, glowPositions } = useMemo(() => {
    const dustCount = 800;
    const glowCount = 300;

    const dp = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dp[i * 3] = (Math.random() - 0.5) * 8;
      dp[i * 3 + 1] = (Math.random() - 0.5) * 5;
      dp[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }

    // TV 빛 근처에 집중 (X+ 방향)
    const gp = new Float32Array(glowCount * 3);
    for (let i = 0; i < glowCount; i++) {
      gp[i * 3] = Math.random() * 3.5;
      gp[i * 3 + 1] = (Math.random() - 0.5) * 3;
      gp[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }

    return { dustPositions: dp, glowPositions: gp };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (dustRef.current) {
      // 먼지 - 천천히 떠다님
      dustRef.current.rotation.y = t * 0.015;
      dustRef.current.position.y = Math.sin(t * 0.08) * 0.03;
    }
    if (glowRef.current) {
      // TV 빛 속 먼지 - 조금 더 역동적
      glowRef.current.rotation.y = -t * 0.02;
      glowRef.current.rotation.x = Math.sin(t * 0.12) * 0.04;
      glowRef.current.position.y = Math.sin(t * 0.15 + 1) * 0.04;
    }
  });

  return (
    <>
      {/* 공기 중 먼지 - 따뜻한 주황 */}
      <Points
        ref={dustRef}
        positions={dustPositions}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#cc7722"
          size={0.025}
          sizeAttenuation
          depthWrite={false}
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* TV 빛 속 먼지 - 블루-화이트 */}
      <Points
        ref={glowRef}
        positions={glowPositions}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#88bbff"
          size={0.018}
          sizeAttenuation
          depthWrite={false}
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </>
  );
};

export default SoftParticles;
