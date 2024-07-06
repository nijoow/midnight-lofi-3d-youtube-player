import * as THREE from 'three';
import React, { useRef } from 'react';
import { Html, Mask, useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import YoutubeVideo from '../video/YoutubeVideo';

interface GLTFAction extends THREE.AnimationClip {}

type GLTFResult = GLTF & {
  nodes: {
    Cube: THREE.Mesh;
    Cube001: THREE.Mesh;
    Cube002: THREE.Mesh;
    Cube003: THREE.Mesh;
    Cube004: THREE.Mesh;
    Cube005: THREE.Mesh;
    Cube006: THREE.Mesh;
    Cube008_1: THREE.Mesh;
    Cube008_2: THREE.Mesh;
    Cube009: THREE.Mesh;
    Cube011_1: THREE.Mesh;
    Cube011_2: THREE.Mesh;
    Cube012_1: THREE.Mesh;
    Cube012_2: THREE.Mesh;
    Cube014: THREE.Mesh;
  };
  materials: {
    ['Material.008']: THREE.MeshStandardMaterial;
    ['Material.013']: THREE.MeshStandardMaterial;
    ['Material.003']: THREE.MeshStandardMaterial;
    ['Material.004']: THREE.MeshStandardMaterial;
    ['Material.002']: THREE.MeshStandardMaterial;
    ['Material.005']: THREE.MeshStandardMaterial;
    Material: THREE.MeshStandardMaterial;
    ['Material.011']: THREE.MeshStandardMaterial;
    ['Material.010']: THREE.MeshStandardMaterial;
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
      <mesh
        geometry={nodes.Cube.geometry}
        material={materials['Material.008']}
        position={[0.081, 0.284, 0]}
        scale={[0.521, 0.937, 1.532]}
      />
      <mesh
        geometry={nodes.Cube001.geometry}
        material={materials['Material.013']}
        position={[-0.384, 0.259, 0]}
        scale={[0.336, 0.951, 1.526]}
      />
      <mesh
        geometry={nodes.Cube002.geometry}
        material={materials['Material.003']}
        position={[0.081, 0.284, 0]}
        scale={[0.521, 0.937, 1.532]}
      />
      <mesh
        geometry={nodes.Cube003.geometry}
        material={materials['Material.004']}
        position={[0.081, 0.284, 0]}
        scale={[0.521, 0.937, 1.532]}
      />
      <mesh
        geometry={nodes.Cube004.geometry}
        material={materials['Material.002']}
        position={[0.081, 0.284, 0]}
        scale={[0.521, 0.937, 1.532]}
      />
      <mesh
        geometry={nodes.Cube005.geometry}
        material={materials['Material.005']}
        position={[0.081, 0.284, 0]}
        scale={[0.521, 0.937, 1.532]}
      />
      <Mask
        geometry={nodes.Cube005.geometry}
        id={1}
        colorWrite={false}
        depthWrite={false}
        castShadow
        receiveShadow
      >
        <Html
          position={[0.4, 0.3, 0.34]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.1, 0.1, 1]}
          transform
          occlude="blending"
          className="relative aspect-[5/4] w-[800px] overflow-hidden rounded-sm"
        >
          <div className="h-full w-full">
            <YoutubeVideo />
          </div>
        </Html>
      </Mask>
      <mesh
        geometry={nodes.Cube006.geometry}
        material={materials.Material}
        position={[0.081, 0.284, 0]}
        scale={[0.521, 0.937, 1.532]}
      />
      <group position={[0.081, 0.284, 0]} scale={[0.521, 0.937, 1.532]}>
        <mesh
          geometry={nodes.Cube008_1.geometry}
          material={materials['Material.011']}
        />
        <mesh
          geometry={nodes.Cube008_2.geometry}
          material={materials['Material.010']}
        />
      </group>
      <mesh
        geometry={nodes.Cube009.geometry}
        material={materials['Material.008']}
        position={[-0.384, 0.259, 0]}
        scale={[0.336, 0.951, 1.526]}
      />
      <group position={[0.081, 0.284, 0]} scale={[0.521, 0.937, 1.532]}>
        <mesh
          geometry={nodes.Cube011_1.geometry}
          material={materials['Material.003']}
        />
        <mesh
          geometry={nodes.Cube011_2.geometry}
          material={materials['Material.002']}
        />
      </group>
      <group position={[0.081, 0.284, 0]} scale={[0.521, 0.937, 1.532]}>
        <mesh
          geometry={nodes.Cube012_1.geometry}
          material={materials['Material.002']}
        />
        <mesh
          geometry={nodes.Cube012_2.geometry}
          material={materials['Material.003']}
        />
      </group>
      <mesh
        geometry={nodes.Cube014.geometry}
        material={materials['Material.008']}
        position={[-0.384, 0.259, 0]}
        scale={[0.336, 0.951, 1.526]}
      />
    </group>
  );
}

useGLTF.preload('/3D/vintage-television.glb');
