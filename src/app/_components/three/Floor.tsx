import { MeshReflectorMaterial } from '@react-three/drei';
import React from 'react';

const Floor = () => {
  return (
    <group>
      {/* 반사 바닥 - 어두운 원목 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          color="#1a0d07"
          blur={[600, 200]}
          mixBlur={0.8}
          mixStrength={60}
          mixContrast={1.2}
          resolution={512}
          mirror={0.7}
          depthScale={1.5}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.5}
          roughness={0.3}
          metalness={0.05}
        />
      </mesh>

      {/* 소파 앞 러그 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[1.1, -1.015, 0]}
        receiveShadow
      >
        <planeGeometry args={[1.6, 2.2]} />
        <meshStandardMaterial
          color="#2a1810"
          roughness={1.0}
          metalness={0}
        />
      </mesh>
    </group>
  );
};

export default Floor;
