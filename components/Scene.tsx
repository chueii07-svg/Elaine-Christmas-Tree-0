import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeState, SceneProps } from '../types';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';

export const Scene: React.FC<SceneProps> = ({ treeState, handPosition }) => {
  const cameraGroup = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (cameraGroup.current) {
      // Smoothly interpolate camera position based on hand input
      // Invert X because moving hand right feels like dragging scene left (or camera right)
      const targetX = -handPosition.x * 5; 
      const targetY = handPosition.y * 2;
      
      cameraGroup.current.position.x = THREE.MathUtils.lerp(cameraGroup.current.position.x, targetX, delta * 2);
      cameraGroup.current.position.y = THREE.MathUtils.lerp(cameraGroup.current.position.y, targetY, delta * 2);
      
      // Gentle idle rotation
      cameraGroup.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <>
      <group ref={cameraGroup}>
        <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />
      </group>

      <Environment preset="lobby" background={false} />
      <color attach="background" args={['#050505']} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Main Lighting - Dramatic */}
      <ambientLight intensity={0.2} color="#001100" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color="#fffdd0" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#D4AF37" />

      {/* The Tree Components */}
      <group position={[0, -2, 0]}>
        <Foliage state={treeState} />
        
        {/* Golden Ornaments - High Gloss */}
        <Ornaments 
          state={treeState} 
          color="#FFD700" 
          count={200} 
          scale={0.25} 
          type="BALL" 
          roughness={0.1} 
          metalness={1.0} 
        />
        
        {/* Red Accents - Metallic */}
        <Ornaments 
          state={treeState} 
          color="#8b0000" 
          count={150} 
          scale={0.2} 
          type="BALL" 
          roughness={0.2} 
          metalness={0.8} 
        />

        {/* Gift Boxes */}
        <Ornaments 
          state={treeState} 
          color="#C0C0C0" 
          count={50} 
          scale={0.4} 
          type="GIFT" 
          roughness={0.3} 
          metalness={0.9} 
        />
      </group>

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
    </>
  );
};
