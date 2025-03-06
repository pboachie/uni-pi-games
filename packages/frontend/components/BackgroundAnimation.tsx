// packages/frontend/components/BackgroundAnimation.tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import ScrollZoomCamera from './ScrollZoomCamera';
import InfiniteSpace from './InfiniteSpace';
import Coins from './Coins';
import { SpaceSpeedProvider } from './SpaceSpeedContext';

interface BackgroundAnimationProps {
  enableControls?: boolean;
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ enableControls = false }) => {
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
        background: '#000000',
      }}
    >
      <SpaceSpeedProvider value={{ spaceSpeed: 1 }}>
        {enableControls ? (
          <ScrollZoomCamera>
            <InfiniteSpace />
            <ambientLight intensity={1} />
            <Coins />
          </ScrollZoomCamera>
        ) : (
          <>
            <InfiniteSpace />
            <ambientLight intensity={1} />
            <Coins />
          </>
        )}
      </SpaceSpeedProvider>
    </Canvas>
  );
};

export default BackgroundAnimation;