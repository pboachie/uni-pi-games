// packages/frontend/components/BackgroundAnimation.tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import InfiniteSpace from './InfiniteSpace';
import Coins from './Coins';

interface BackgroundAnimationProps {
  spaceSpeed?: number;
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ spaceSpeed = 1 }) => {
  return (
    <Canvas
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 50], near: 1, far: 5000 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: '#000000' // Explicitly set background
      }}
    >
      <InfiniteSpace speed={spaceSpeed} />
      <ambientLight intensity={1} />
      <Coins speed={spaceSpeed} />
    </Canvas>
  );
};

export default BackgroundAnimation;