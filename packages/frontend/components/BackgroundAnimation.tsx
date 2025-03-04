// packages/frontend/components/BackgroundAnimation.tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import InfiniteSpace from './InfiniteSpace';
import Coins from './Coins';

const BackgroundAnimation: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 100], fov: 75, near: 0.1, far: 1000 }}
      style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
      onCreated={(state) => state.gl.setClearColor(0x000000, 1)} // Black background
    >
      <InfiniteSpace />
      <ambientLight intensity={0.5} />
      <Coins />
    </Canvas>
  );
};

export default BackgroundAnimation;