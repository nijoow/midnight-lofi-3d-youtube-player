import React from 'react';

const LightControler = () => {
  return (
    <>
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
    </>
  );
};

export default LightControler;
