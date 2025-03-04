// packages/frontend/components/PiSprite.tsx
import React, { useEffect, useRef } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface PiSpriteProps {
  scale: [number, number, number];
  speed?: number;
}

const PiSprite: React.FC<PiSpriteProps> = ({ scale, speed = 1 }) => {
  const spriteRef = useRef<THREE.Sprite>(null!);
  const { viewport } = useThree();
  const texture = useLoader(THREE.TextureLoader, '/pi-symbol2.png');

  // Random base speed for each coin (between 300 and 500 units per second)
  const baseSpeed = useRef(Math.random() * 200 + 300);

  // Function to reset the coin's position to far away
  const resetPosition = () => {
    if (spriteRef.current) {
      spriteRef.current.position.set(
        (Math.random() - 0.5) * viewport.width * 10, // Random x
        (Math.random() - 0.5) * viewport.height * 10, // Random y
        -2000 // Spawn further away from camera
      );
      baseSpeed.current = Math.random() * 200 + 300;
    }
  };

  // Set initial position with simulated prior movement
  useEffect(() => {
    if (spriteRef.current) {
      const timeOffset = Math.random() * 10;
      let initialZ = -2000 + baseSpeed.current * timeOffset;
      if (initialZ > 100) initialZ = -2000;
      spriteRef.current.position.set(
        (Math.random() - 0.5) * viewport.width * 10,
        (Math.random() - 0.5) * viewport.height * 10,
        initialZ
      );
    }
  }, [viewport]);

  // Animation loop: move and reset the coin
  useFrame((_, delta) => {
    if (spriteRef.current) {
      // Apply the dynamic speed multiplier
      spriteRef.current.position.z += delta * baseSpeed.current * speed;

      if (spriteRef.current.position.z > 100) {
        resetPosition();
      }
    }
  });

  return (
    <sprite ref={spriteRef} scale={scale}>
      <spriteMaterial map={texture} color="#FF6B35" transparent opacity={0.8} />
    </sprite>
  );
};

export default PiSprite;