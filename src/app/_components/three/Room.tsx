import React from 'react';

const Room = () => {
  const wallColor = '#1a1008'; // 매우 어두운 색상
  const wallRoughness = 0.9;
  const wallMetalness = 0.05;

  return (
    <group>
      {/* Wall behind the TV (TV faces +X, so wall is at -X) */}
      <mesh
        position={[-1.2, 1.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={wallRoughness}
          metalness={wallMetalness}
        />
      </mesh>

      {/* Left wall (viewer's left when looking at TV -> -Z) */}
      <mesh position={[2.8, 1.5, -4]} rotation={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 7]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={wallRoughness}
          metalness={wallMetalness}
        />
      </mesh>

      {/* Right wall (viewer's right -> +Z) */}
      <mesh position={[2.8, 1.5, 4]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[8, 7]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={wallRoughness}
          metalness={wallMetalness}
        />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 4.5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0d0804" roughness={1} metalness={0} />
      </mesh>

      {/* Baseboards */}
      {/* Behind TV */}
      <mesh position={[-1.18, -0.8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 0.4]} />
        <meshStandardMaterial color="#2a1a0c" roughness={0.7} />
      </mesh>
      {/* Left */}
      <mesh position={[2.8, -0.8, -3.98]}>
        <planeGeometry args={[8, 0.4]} />
        <meshStandardMaterial color="#2a1a0c" roughness={0.7} />
      </mesh>
      {/* Right */}
      <mesh position={[2.8, -0.8, 3.98]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[8, 0.4]} />
        <meshStandardMaterial color="#2a1a0c" roughness={0.7} />
      </mesh>
    </group>
  );
};

export default Room;
