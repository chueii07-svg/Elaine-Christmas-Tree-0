import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

const vertexShader = `
  uniform float uProgress;
  uniform float uTime;
  attribute vec3 aChaosPos;
  attribute vec3 aTargetPos;
  attribute float aRandom;
  
  varying float vAlpha;

  void main() {
    // Cubic bezier ease-in-out approximation for smoother transition
    float t = uProgress;
    float ease = t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;

    // Mix positions
    vec3 pos = mix(aChaosPos, aTargetPos, ease);

    // Add some subtle wind/breathing movement when formed
    if (uProgress > 0.8) {
      pos.x += sin(uTime * 2.0 + pos.y) * 0.05 * ease;
      pos.z += cos(uTime * 1.5 + pos.y) * 0.05 * ease;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (4.0 * aRandom + 2.0) * (20.0 / -mvPosition.z);
    
    vAlpha = 0.6 + 0.4 * sin(uTime * 3.0 + aRandom * 10.0);
  }
`;

const fragmentShader = `
  varying float vAlpha;
  
  void main() {
    // Circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // Emerald Green with a hint of gold sparkle
    vec3 color = vec3(0.0, 0.4, 0.15); // Deep emerald
    float sparkle = step(0.98, fract(vAlpha * 10.0)); // Occasional sparkle
    color += vec3(1.0, 0.8, 0.2) * sparkle; 

    gl_FragColor = vec4(color, vAlpha);
  }
`;

interface FoliageProps {
  state: TreeState;
}

const COUNT = 15000;

export const Foliage: React.FC<FoliageProps> = ({ state }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  // Calculate target progress based on state
  const targetProgress = state === TreeState.FORMED ? 1.0 : 0.0;
  const currentProgress = useRef(1.0); // Start formed

  const uniforms = useMemo(() => ({
    uProgress: { value: 1.0 },
    uTime: { value: 0.0 }
  }), []);

  const attributes = useMemo(() => {
    const chaosPos = new Float32Array(COUNT * 3);
    const targetPos = new Float32Array(COUNT * 3);
    const randoms = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Randoms
      randoms[i] = Math.random();

      // Chaos: Random Sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 10 + Math.random() * 10; // Large sphere
      chaosPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      chaosPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      chaosPos[i * 3 + 2] = r * Math.cos(phi);

      // Target: Cone (Christmas Tree)
      // Height 0 to 12
      const h = Math.random() * 12;
      const maxRadiusAtHeight = 4.5 * (1 - h / 12);
      const radius = Math.random() * maxRadiusAtHeight;
      const angle = Math.random() * Math.PI * 2;
      
      targetPos[i * 3] = radius * Math.cos(angle);
      targetPos[i * 3 + 1] = h - 2; // Shift down slightly
      targetPos[i * 3 + 2] = radius * Math.sin(angle);
    }

    return { chaosPos, targetPos, randoms };
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Lerp progress
      currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, targetProgress, delta * 1.5);
      
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uProgress.value = currentProgress.current;
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={attributes.targetPos} itemSize={3} />
        <bufferAttribute attach="attributes-aChaosPos" count={COUNT} array={attributes.chaosPos} itemSize={3} />
        <bufferAttribute attach="attributes-aTargetPos" count={COUNT} array={attributes.targetPos} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={COUNT} array={attributes.randoms} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
