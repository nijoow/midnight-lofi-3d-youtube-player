import React from 'react';

// 레트로 카페/거실 컨셉의 세련된 가구
// ─────────────────────────────────────────────────────

/** TV 받침대 (TV 크기에 맞춘 와이드 사이드보드) */
const TVStand = ({
  position,
}: {
  position: [number, number, number];
}) => {
  return (
    <group position={position}>
      {/* 메인 본체 (X: Depth, Y: Height, Z: Width) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.35, 1.8]} />
        <meshStandardMaterial color="#1c120a" roughness={0.4} metalness={0.15} />
      </mesh>
      {/* 상판 */}
      <mesh position={[0, 0.185, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.03, 1.9]} />
        <meshStandardMaterial color="#2a1c0e" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* 서랍 손잡이 x2 (앞면은 +X 방향이므로 X=0.32 위치) */}
      <mesh position={[0.32, 0, -0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.18, 8]} />
        <meshStandardMaterial color="#b8860b" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0.32, 0, 0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.18, 8]} />
        <meshStandardMaterial color="#b8860b" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* 가느다란 다리 x4 */}
      {(
        [
          [-0.2, -0.8],
          [0.2, -0.8],
          [-0.2, 0.8],
          [0.2, 0.8],
        ] as [number, number][]
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, -0.22, z]} castShadow>
          <cylinderGeometry args={[0.02, 0.018, 0.22, 8]} />
          <meshStandardMaterial color="#b8860b" roughness={0.2} metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

/** 레트로 소파 */
const Sofa = ({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) => {
  return (
    <group position={position} rotation={rotation ?? [0, 0, 0]}>
      {/* 소파 시트 */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.2, 0.7]} />
        <meshStandardMaterial color="#4a3020" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* 등받이 */}
      <mesh position={[0, 0.35, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.5, 0.14]} />
        <meshStandardMaterial color="#4a3020" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* 좌측 팔걸이 */}
      <mesh position={[-0.85, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.3, 0.7]} />
        <meshStandardMaterial color="#3a2210" roughness={0.9} />
      </mesh>
      {/* 우측 팔걸이 */}
      <mesh position={[0.85, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.3, 0.7]} />
        <meshStandardMaterial color="#3a2210" roughness={0.9} />
      </mesh>
      {/* 쿠션 x2 */}
      <mesh position={[-0.4, 0.14, 0.05]} castShadow>
        <boxGeometry args={[0.7, 0.08, 0.55]} />
        <meshStandardMaterial color="#5a3828" roughness={0.95} />
      </mesh>
      <mesh position={[0.4, 0.14, 0.05]} castShadow>
        <boxGeometry args={[0.7, 0.08, 0.55]} />
        <meshStandardMaterial color="#5a3828" roughness={0.95} />
      </mesh>
      {/* 다리 x4 */}
      {(
        [
          [-0.8, -0.25],
          [0.8, -0.25],
          [-0.8, 0.25],
          [0.8, 0.25],
        ] as [number, number][]
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, -0.15, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.02, 0.2, 8]} />
          <meshStandardMaterial color="#1a0e06" roughness={0.6} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
};

/** 사이드 협탁 */
const SideTable = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.04, 24]} />
        <meshStandardMaterial color="#2a1c0e" roughness={0.4} metalness={0.1} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * 0.16, -0.22, Math.cos(angle) * 0.16]}
            rotation={[Math.sin(angle) * 0.18, 0, -Math.cos(angle) * 0.18]}
            castShadow
          >
            <cylinderGeometry args={[0.015, 0.01, 0.44, 8]} />
            <meshStandardMaterial color="#b8860b" roughness={0.2} metalness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
};

/** 스탠드 램프 */
const FloorLamp = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.06, 20]} />
        <meshStandardMaterial color="#1a1208" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 2.0, 10]} />
        <meshStandardMaterial color="#b8860b" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[0.25, 0.35, 20, 1, true]} />
        <meshStandardMaterial color="#d4a04a" roughness={0.6} metalness={0.1} side={2} />
      </mesh>
      <mesh position={[0, 2.18, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
        <meshStandardMaterial color="#b8860b" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};

/** 빈티지 화분 */
const VintagePlant = ({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) => {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.175, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.35, 16]} />
        <meshStandardMaterial color="#7a3b1e" roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.355, 0]}>
        <torusGeometry args={[0.165, 0.018, 8, 20]} />
        <meshStandardMaterial color="#6a2e14" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.325, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 16]} />
        <meshStandardMaterial color="#2a1a0a" roughness={1} />
      </mesh>
      <mesh position={[0, 0.625, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.6, 8]} />
        <meshStandardMaterial color="#2d5a1e" roughness={0.9} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const angle = (i / 7) * Math.PI * 2;
        const h = 0.575 + i * 0.08;
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * 0.15, h, Math.cos(angle) * 0.15]}
            rotation={[Math.sin(angle) * 0.6, angle, Math.cos(angle) * -0.6]}
            scale={[1, 0.5, 1]}
            castShadow
          >
            <planeGeometry args={[0.25, 0.15, 1]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#2d6a1e' : '#3d8a2e'}
              roughness={0.8}
              side={2}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/** 책꽂이 */
const Bookshelf = ({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) => {
  const bookColors = [
    '#8b0000', '#00008b', '#006400', '#8b4513',
    '#4b0082', '#b8860b', '#2f4f4f', '#800000',
    '#556b2f', '#8b008b', '#483d8b', '#b22222',
  ];

  return (
    <group position={position} rotation={rotation ?? [0, 0, 0]}>
      {/* 프레임 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 1.8, 0.3]} />
        <meshStandardMaterial color="#1c120a" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* 선반판 4개 */}
      {[0.25, 0.75, -0.25, -0.75].map((y, i) => (
        <mesh key={i} position={[0, y, 0.01]} castShadow>
          <boxGeometry args={[0.78, 0.025, 0.28]} />
          <meshStandardMaterial color="#2a1c0e" roughness={0.5} />
        </mesh>
      ))}
      {/* 책들 */}
      {bookColors.map((color, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const x = -0.3 + col * 0.15;
        const y = -0.85 + row * 0.5 + 0.12;
        const tilt = (Math.random() - 0.5) * 0.2;
        return (
          <mesh key={i} position={[x, y, 0.08]} rotation={[0, 0, tilt]} castShadow>
            <boxGeometry args={[0.06, 0.24, 0.2]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
};

/** 커피 머그컵 */
const Mug = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position} scale={0.7}>
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.052, 0.12, 16]} />
        <meshStandardMaterial color="#e8d5b0" roughness={0.5} />
      </mesh>
      <mesh position={[0.08, 0, 0]}>
        <torusGeometry args={[0.04, 0.012, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#e8d5b0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.052, 0]}>
        <cylinderGeometry args={[0.056, 0.056, 0.01, 16]} />
        <meshStandardMaterial color="#3a1a08" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
};

export const Furniture = () => {
  return (
    <group>
      {/* 소파 - TV 맞은편 (TV는 +X를 보므로 소파는 -X를 마주보게) */}
      <Sofa position={[2.2, -0.82, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* 소파 사이드 테이블 (소파 우측) */}
      <SideTable position={[2.2, -0.58, -1.4]} />
      <Mug position={[2.2, -0.52, -1.4]} />

      {/* 스탠드 램프 - 방 양쪽 모서리 부근 */}
      <FloorLamp position={[-0.8, -1.02, -2.5]} />
      <FloorLamp position={[-0.8, -1.02, 2.5]} />

      {/* 화분들 - 모서리나 여백 채우기 */}
      <VintagePlant position={[2.0, -1.02, 2.5]} scale={1.3} />
      <VintagePlant position={[0.5, -1.02, -2.8]} scale={0.9} />

      {/* 책꽂이 - 왼쪽 벽 (Z=-4 근처)에 붙여서 배치 */}
      <Bookshelf position={[0.8, -0.12, -3.2]} rotation={[0, 0, 0]} />
    </group>
  );
};
