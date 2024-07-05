import * as THREE from 'three';
import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

interface GLTFAction extends THREE.AnimationClip {}

type GLTFResult = GLTF & {
  nodes: {
    Cube_1: THREE.Mesh;
    Cube_2: THREE.Mesh;
    Cube_3: THREE.Mesh;
    Cube_4: THREE.Mesh;
    Cube_5: THREE.Mesh;
    Cube_6: THREE.Mesh;
    Cube_7: THREE.Mesh;
    Cube_8: THREE.Mesh;
    Cube004: THREE.Mesh;
    Cube004_1: THREE.Mesh;
  };
  materials: {
    Material: THREE.MeshStandardMaterial;
    ['Material.002']: THREE.MeshStandardMaterial;
    ['Material.003']: THREE.MeshStandardMaterial;
    ['Material.004']: THREE.MeshStandardMaterial;
    ['Material.005']: THREE.MeshStandardMaterial;
    ['Material.008']: THREE.MeshStandardMaterial;
    ['Material.010']: THREE.MeshStandardMaterial;
    ['Material.011']: THREE.MeshStandardMaterial;
    ['Material.013']: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

type ContextType = Record<
  string,
  React.ForwardRefExoticComponent<JSX.IntrinsicElements['mesh']>
>;

export function VintageTelevision(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/3D/vintage-television.glb',
  ) as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <group position={[0, 0, 0]} scale={[0.156, 0.281, 0.46]}>
        <mesh geometry={nodes.Cube_1.geometry} material={materials.Material} />
        <mesh
          geometry={nodes.Cube_2.geometry}
          material={materials['Material.002']}
        />
        <mesh
          geometry={nodes.Cube_3.geometry}
          material={materials['Material.003']}
        />
        <mesh
          geometry={nodes.Cube_4.geometry}
          material={materials['Material.004']}
        />
        <mesh
          geometry={nodes.Cube_5.geometry}
          material={materials['Material.005']}
        />
        <mesh
          geometry={nodes.Cube_6.geometry}
          material={materials['Material.008']}
        />
        <mesh
          geometry={nodes.Cube_7.geometry}
          material={materials['Material.010']}
        />
        <mesh
          geometry={nodes.Cube_8.geometry}
          material={materials['Material.011']}
        />
      </group>
      <group position={[-0.14, 0, 0]} scale={[0.101, 0.285, 0.458]}>
        <mesh
          geometry={nodes.Cube004.geometry}
          material={materials['Material.008']}
        />
        <mesh
          geometry={nodes.Cube004_1.geometry}
          material={materials['Material.013']}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/3D/vintage-television.glb');
