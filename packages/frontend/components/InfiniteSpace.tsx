// packages/frontend/components/InfiniteSpace.tsx
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const numStars = 1000;

const InfiniteSpace: React.FC = () => {
  const starsRef = useRef<THREE.Points>(null!);
  const { viewport } = useThree();

  // Initialize star positions
  const positions = useMemo(() => {
    const pos = new Float32Array(numStars * 3);
    for (let i = 0; i < numStars; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 10;     // x: wide spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 10; // y: wide spread
      pos[i * 3 + 2] = -Math.random() * 900;                         // z: between -900 and 0
    }
    return pos;
  }, [viewport]);

  // Animate stars
  useFrame((_, delta) => {
    if (!starsRef.current) return;

    const geometry = starsRef.current.geometry as THREE.BufferGeometry;
    const positionsArray = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < numStars; i++) {
      positionsArray[i * 3 + 2] += delta * 200; // Move towards camera at 200 units/sec
      if (positionsArray[i * 3 + 2] > 100) {    // When past camera (z=100)
        positionsArray[i * 3 + 2] = -900;       // Reset to far distance
      }
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          itemSize={3}
          count={numStars}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={5}
        sizeAttenuation={true}
        transparent
        opacity={0.8}
      />
    </points>
  );
};

export default InfiniteSpace;