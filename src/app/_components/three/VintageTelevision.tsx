'use client';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Mesh } from 'three';

/** The project's original television, with its original textures and geometry. */
export function VintageTelevision() {
  const { scene } = useGLTF('/3D/vintage-television.glb');
  const television = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse(object => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return copy;
  }, [scene]);
  return (
    <primitive object={television} position={[0, -0.3, 0]} dispose={null} />
  );
}
