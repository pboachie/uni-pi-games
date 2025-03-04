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

  // Random speed for each coin (between 300 and 500 units per second)
  const speed = useRef(Math.random() * 200 + 300);

  // Function to reset the coin's position to far away
  const resetPosition = () => {
    if (spriteRef.current) {
      spriteRef.current.position.set(
        (Math.random() - 0.5) * viewport.width * 10, // Random x
        (Math.random() - 0.5) * viewport.height * 10, // Random y
        -2000 // Spawn further away from camera
      );
      // Optionally adjust the speed range as needed
      speed.current = Math.random() * 200 + 300;
    }
  };

  // Set initial position with simulated prior movement
  useEffect(() => {
    if (spriteRef.current) {
      const timeOffset = Math.random() * 10; // Simulate up to 10 seconds of movement
      let initialZ = -2000 + speed.current * timeOffset;
      if (initialZ > 100) initialZ = -2000; // Ensure it doesn’t start beyond the camera
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