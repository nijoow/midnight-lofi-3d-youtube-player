import { MeshReflectorMaterial } from '@react-three/drei';
import React from 'react';
import { Color } from 'three';

const Floor = () => {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.02, 0]}
      receiveShadow
    >
      <planeGeometry attach="geometry" args={[40, 40]} />
      <MeshReflectorMaterial
        attach="material"
        color="#e11d48"
        mirror={0.6}
        metalness={0.2}
      />
    </mesh>
  );
};

export default Floor;
