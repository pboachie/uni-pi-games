// packages/frontend/components/Coins.tsx
import React from 'react';
import { useThree } from '@react-three/fiber';
import PiSprite from './PiSprite';

const Coins: React.FC = () => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 768;
  // Number of coins: 3-5 on mobile, 8-18 on desktop
  const numCoins = isMobile ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 11) + 8;

  return (
    <>
      {Array.from({ length: numCoins }, (_, i) => {
        const scaleVal = Math.random() * 40 + 30; // Random size between 30 and 70
        return <PiSprite key={i} scale={[scaleVal, scaleVal, 1]} />;
      })}
    </>
  );
};

export default Coins;