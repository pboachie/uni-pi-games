import React from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useWindowSize from '../hooks/useWindowSize';

interface PiSpriteProps {
  initialPosition: [number, number, number];
  scale: [number, number, number];
}

const PiSprite: React.FC<PiSpriteProps> = ({ initialPosition, scale }) => {
  const spriteRef = React.useRef<THREE.Sprite>(null);
  const { width, height } = useWindowSize();
  // Calculate boundaries based on window dimensions (in world units)
  const left = -width / 2;
  const right = width / 2;
  const bottom = -height / 2;
  const top = height / 2;
  const vx = React.useRef(Math.random() * 0.3 - 0.15);
  const vy = React.useRef(Math.random() * 0.3 - 0.15);
  const texture = useLoader(THREE.TextureLoader, '/pi-symbol.png');

  // Set initial position once
  React.useEffect(() => {
    if (spriteRef.current) {
      spriteRef.current.position.set(...initialPosition);
    }
  }, [initialPosition]);

  useFrame((_, delta) => {
    if (spriteRef.current) {
      const sprite = spriteRef.current;
      sprite.position.x += vx.current * delta * 60;
      sprite.position.y += vy.current * delta * 60;
      // Bounce when hitting boundaries
      if (sprite.position.x < left || sprite.position.x > right) {
        vx.current *= -1;
      }
      if (sprite.position.y < bottom || sprite.position.y > top) {
        vy.current *= -1;
      }
    }
  });

  return (
    <sprite ref={spriteRef} scale={scale}>
      <spriteMaterial map={texture} color="#FF6B35" transparent opacity={0.2} />
    </sprite>
  );
};

const BackgroundAnimation: React.FC = () => {
  const { width, height } = useWindowSize();
  // Check for window existence and provide fallback values
  const sceneWidth = width || (typeof window !== 'undefined' ? window.innerWidth : 800);
  const sceneHeight = height || (typeof window !== 'undefined' ? window.innerHeight : 600);
  // Number of coins between 5 and 15
  const numCoins = Math.floor(Math.random() * 11) + 5;

  // Coins component to generate sprites within the orthographic bounds.
  const Coins = () => {
    return (
      <>
        {Array.from({ length: numCoins }, (_, i) => {
          const scaleVal = Math.random() * 0.4 + 0.3;
          // Random x from left to right; y from bottom to top.
          const x = Math.random() * sceneWidth - sceneWidth / 2;
          const y = Math.random() * sceneHeight - sceneHeight / 2;
          return (
            <PiSprite
              key={i}
              initialPosition={[x, y, -5]}
              scale={[scaleVal, scaleVal, 1]}
            />
          );
        })}
      </>
    );
  };

  return (
    <Canvas
      orthographic
      camera={{
        left: -sceneWidth / 2,
        right: sceneWidth / 2,
        top: sceneHeight / 2,
        bottom: -sceneHeight / 2,
        near: 0.1,
        far: 1000,
        position: [0, 0, 100],
      }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
    >
      <ambientLight intensity={0.5} />
      <Coins />
    </Canvas>
  );
};

export default BackgroundAnimation;