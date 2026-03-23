import React from 'react';

const LightControler = () => {
  return (
    <>
      {/* 매우 어두운 ambient - TV 화면 빛이 도드라지도록 */}
      <ambientLight intensity={0.08} color="#1a0c06" />

      {/* 방 전체를 약하게 밝히는 따뜻한 빛 */}
      <directionalLight
        position={[-3, 6, 2]}
        intensity={0.3}
        color="#ff9933"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* 스탠드 램프 (좌측) 포인트 라이트 */}
      <pointLight
        position={[-2.5, 0.8, -2.0]}
        intensity={1.8}
        color="#ffcc44"
        distance={5}
        decay={2}
        castShadow
      />

      {/* 스탠드 램프 (우측) 포인트 라이트 */}
      <pointLight
        position={[2.2, 0.8, 1.8]}
        intensity={1.5}
        color="#ffcc44"
        distance={5}
        decay={2}
        castShadow
      />

      {/* TV 화면에서 나오는 블루 포인트 라이트 */}
      <pointLight
        position={[1.0, -0.05, 0]}
        intensity={2.5}
        color="#4488ff"
        distance={4}
        decay={2}
      />

      {/* TV 화면에서 나오는 블루 빛 (TV 앞 넓은 영역에 영향) */}
      <pointLight
        position={[2.5, 0, 0]}
        intensity={0.8}
        color="#2255cc"
        distance={6}
        decay={2}
      />

      {/* 천장에서 내려오는 약한 spot - 방 중앙 */}
      <spotLight
        position={[0, 4, 0]}
        angle={0.6}
        penumbra={1}
        intensity={0.4}
        color="#ff8822"
        castShadow
      />

      {/* 벽 반사 느낌의 fill light */}
      <pointLight position={[-5, 2, -4]} intensity={0.2} color="#dd5500" />
    </>
  );
};

export default LightControler;
