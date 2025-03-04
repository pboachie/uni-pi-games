// packages/frontend/components/PiSprite.tsx
import React, { useEffect, useRef } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface PiSpriteProps {
  scale: [number, number, number];
}

const PiSprite: React.FC<PiSpriteProps> = ({ scale }) => {
  const spriteRef = useRef<THREE.Sprite>(null!);
  const { viewport } = useThree();
  const texture = useLoader(THREE.TextureLoader, '/pi-symbol2.png');

  // Random speed for each coin (between 100 and 200 units per second)
  const speed = useRef(Math.random() * 100 + 100);

  // Function to reset the coin's position to far away
  const resetPosition = () => {
    if (spriteRef.current) {
      spriteRef.current.position.set(
        (Math.random() - 0.5) * viewport.width * 10, // Random x
        (Math.random() - 0.5) * viewport.height * 10, // Random y
        -900 // Always reset to far end
      );
      speed.current = Math.random() * 100 + 100; // Assign a new random speed
    }
  };

  // Set initial position with simulated prior movement
  useEffect(() => {
    if (spriteRef.current) {
      const timeOffset = Math.random() * 10; // Simulate up to 10 seconds of movement
      let initialZ = -900 + speed.current * timeOffset;
      if (initialZ > 100) initialZ = -900; // Ensure it doesn’t start beyond the camera
      spriteRef.current.position.set(
        (Math.random() - 0.5) * viewport.width * 10, // Random x
        (Math.random() - 0.5) * viewport.height * 10, // Random y
        initialZ // Spread coins along z-axis initially
      );
    }
  }, [viewport]);

  // Animation loop: move and reset the coin
  useFrame((_, delta) => {
    if (spriteRef.current) {
      // Move coin toward the camera
      spriteRef.current.position.z += delta * speed.current;

      // Reset when it passes the camera (z > 100)
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