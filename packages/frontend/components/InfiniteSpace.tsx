// packages/frontend/components/InfiniteSpace.tsx
import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSpaceSpeed } from './SpaceSpeedContext';
import * as THREE from 'three';

const numStars = 2000;
const zRange = 1000; // Range for star distribution along Z-axis

const InfiniteSpace: React.FC = () => {
  const { spaceSpeed } = useSpaceSpeed();
  const starsRef = useRef<THREE.Points>(null!);
  const { viewport, camera } = useThree();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate base movement speed (slower on mobile)
  const baseSpeed = isMobile ? 100 : 200;

  // Initialize star positions
  const positions = useMemo(() => {
    const pos = new Float32Array(numStars * 3);
    for (let i = 0; i < numStars; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 10;     // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 10; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * zRange;              // Z (centered around 0)
    }
    return pos;
  }, [viewport]);

  // Star sizes for better visibility
  const sizes = useMemo(() => {
    const data = new Float32Array(numStars);
    const baseSizeMin = isMobile ? 8 : 5;
    const baseSizeMax = isMobile ? 14 : 8;

    for (let i = 0; i < numStars; i++) {
      data[i] = Math.random() * (baseSizeMax - baseSizeMin) + baseSizeMin;
    }
    return data;
  }, [isMobile]);

  // Custom shader for blurred stars
  const starMaterial = useMemo(() => {
    const sizeMultiplier = isMobile ? 200 : 400;

    const vertexShader = `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = vec3(1.0, 1.0, 1.0);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (${sizeMultiplier.toFixed(1)} / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      void main() {
        float r = 0.0;
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        r = dot(cxy, cxy);
        float alpha = 1.0 - smoothstep(0.1, 1.0, r);
        gl_FragColor = vec4(vColor, alpha * 0.9);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });
  }, [isMobile]);

  useFrame((_, delta) => {
    if (!starsRef.current) return;

    const geometry = starsRef.current.geometry as THREE.BufferGeometry;
    const positionsArray = geometry.attributes.position.array as Float32Array;
    const cameraZ = camera.position.z; // Get camera's Z-position

    for (let i = 0; i < numStars; i++) {
      // Move stars based on speed
      positionsArray[i * 3 + 2] += delta * baseSpeed * spaceSpeed;

      // Calculate star's Z-position relative to camera
      const relativeZ = positionsArray[i * 3 + 2] - cameraZ;

      // Wrap stars within zRange around the camera
      if (relativeZ > zRange / 2) {
        positionsArray[i * 3 + 2] -= zRange;
      } else if (relativeZ < -zRange / 2) {
        positionsArray[i * 3 + 2] += zRange;
      }
    }
    geometry.attributes.position.needsUpdate = true;
  });


  // useFrame((_, delta) => {
  //   if (!starsRef.current) return;

  //   const geometry = starsRef.current.geometry as THREE.BufferGeometry;
  //   const positionsArray = geometry.attributes.position.array as Float32Array;
  //   const cameraZ = camera.position.z;

  //   for (let i = 0; i < numStars; i++) {
  //     const relativeZ = positionsArray[i * 3 + 2] - cameraZ;
  //     if (relativeZ > zRange / 2) {
  //       positionsArray[i * 3 + 2] -= zRange;
  //     } else if (relativeZ < -zRange / 2) {
  //       positionsArray[i * 3 + 2] += zRange;
  //     }
  //   }
  //   geometry.attributes.position.needsUpdate = true;
  // });



  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <primitive object={starMaterial} attach="material" />
    </points>
  );
};

export default InfiniteSpace;