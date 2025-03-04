// packages/frontend/components/InfiniteSpace.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const numStars = 2000; // Increase number of stars for visibility

const InfiniteSpace: React.FC = () => {
  const starsRef = useRef<THREE.Points>(null!);
  const { viewport } = useThree();

  // Generate star positions
  const positions = useMemo(() => {
    const pos = new Float32Array(numStars * 3);
    for (let i = 0; i < numStars; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 10;
      pos[i * 3 + 2] = -Math.random() * 1000;
    }
    return pos;
  }, [viewport]);

  // Star sizes for better visibility
  const sizes = useMemo(() => {
    const data = new Float32Array(numStars);
    for (let i = 0; i < numStars; i++) {
      data[i] = Math.random() * 4 + 2;
    }
    return data;
  }, []);

  // Custom shader for blurred stars
  const starMaterial = useMemo(() => {
    // Vertex shader - passes size and position to fragment shader
    const vertexShader = `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = vec3(1.0, 1.0, 1.0); // White stars
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    // Fragment shader - creates a soft circular gradient for each point
    const fragmentShader = `
      varying vec3 vColor;
      void main() {
        // Calculate distance from center of point
        float r = 0.0;
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        r = dot(cxy, cxy);

        // Softer falloff for a blurry effect
        float alpha = 1.0 - smoothstep(0.1, 1.0, r);
        gl_FragColor = vec4(vColor, alpha * 0.8); // Adjust opacity here
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthWrite: true,
      transparent: true,
    });
  }, []);

  useFrame((_, delta) => {
    if (!starsRef.current) return;

    const posAttr = starsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < numStars; i++) {
      const i3 = i * 3;
      posArray[i3 + 2] += delta * 75; // Move stars toward camera
      if (posArray[i3 + 2] > 200) {
        posArray[i3 + 2] = -1000;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={numStars} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={numStars} array={sizes} itemSize={1} args={[positions, 3]}/>
      </bufferGeometry>
      <primitive object={starMaterial} attach="material" />
      {/* <pointsMaterial
        size={2}
        color="#FFFFFF"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        depthWrite={false}
      /> */}
    </points>
  );
};

export default InfiniteSpace;

