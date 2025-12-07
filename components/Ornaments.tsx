import React, { useLayoutEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface OrnamentProps {
  state: TreeState;
  color: string;
  count: number;
  scale: number;
  type: 'BALL' | 'GIFT';
  roughness: number;
  metalness: number;
}

export const Ornaments: React.FC<OrnamentProps> = ({ 
  state, color, count, scale, type, roughness, metalness 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Data storage
  const data = useMemo(() => {
    const chaosPos = new Float32Array(count * 3);
    const targetPos = new Float32Array(count * 3);
    const rotations = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Chaos: Wider sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 15 + Math.random() * 10;
      chaosPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      chaosPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      chaosPos[i * 3 + 2] = r * Math.cos(phi);

      // Target: Surface of Cone mostly
      const h = Math.random() * 11; // Slightly shorter than tree
      const coneRadius = 4.0 * (1 - h / 12);
      // Push slightly outside or inside based on type
      const rOffset = type === 'GIFT' ? 0.2 : -0.1; 
      const radius = coneRadius + rOffset;
      const angle = Math.random() * Math.PI * 2;
      
      targetPos[i * 3] = radius * Math.cos(angle);
      targetPos[i * 3 + 1] = h - 2;
      targetPos[i * 3 + 2] = radius * Math.sin(angle);

      rotations[i*3] = Math.random() * Math.PI;
      rotations[i*3+1] = Math.random() * Math.PI;
      rotations[i*3+2] = Math.random() * Math.PI;
    }
    return { chaosPos, targetPos, rotations };
  }, [count, type]);

  const currentProgress = useRef(1.0);

  useFrame((stateCtx, delta) => {
    if (!meshRef.current) return;

    const target = state === TreeState.FORMED ? 1.0 : 0.0;
    // Different Lerp speeds for "weight" simulation
    const speed = type === 'GIFT' ? 0.8 : 1.2; 
    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, target, delta * speed);

    const t = currentProgress.current;
    // Cubic ease
    const ease = t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;

    for (let i = 0; i < count; i++) {
      const cx = data.chaosPos[i * 3];
      const cy = data.chaosPos[i * 3 + 1];
      const cz = data.chaosPos[i * 3 + 2];

      const tx = data.targetPos[i * 3];
      const ty = data.targetPos[i * 3 + 1];
      const tz = data.targetPos[i * 3 + 2];

      dummy.position.set(
        THREE.MathUtils.lerp(cx, tx, ease),
        THREE.MathUtils.lerp(cy, ty, ease),
        THREE.MathUtils.lerp(cz, tz, ease)
      );

      // Rotate while flying
      if (t < 0.99) {
          dummy.rotation.set(
            data.rotations[i*3] + stateCtx.clock.elapsedTime,
            data.rotations[i*3+1] + stateCtx.clock.elapsedTime,
            data.rotations[i*3+2]
          );
      } else {
          // Stabilize rotation when formed
          dummy.rotation.set(data.rotations[i*3], data.rotations[i*3+1], data.rotations[i*3+2]);
      }

      dummy.scale.setScalar(scale * (0.8 + 0.4 * ease)); // Grow slightly when forming
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {type === 'BALL' ? (
        <sphereGeometry args={[1, 32, 32]} />
      ) : (
        <boxGeometry />
      )}
      <meshStandardMaterial 
        color={color} 
        roughness={roughness} 
        metalness={metalness}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
};