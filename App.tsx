import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Scene } from './components/Scene';
import { GestureController } from './components/GestureController';
import { TreeState } from './types';

function App() {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.FORMED);
  const [handPosition, setHandPosition] = useState({ x: 0, y: 0 });

  return (
    <div className="relative w-full h-screen bg-luxury-black">
      {/* 3D Scene */}
      <Canvas dpr={[1, 2]} gl={{ antialias: false, toneMappingExposure: 1.2 }}>
        <Scene treeState={treeState} handPosition={handPosition} />
      </Canvas>
      <Loader />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none z-10">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="font-display text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-luxury-gold to-yellow-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-widest">
            GRAND LUXURY
          </h1>
          <h2 className="font-serif text-2xl md:text-3xl text-luxury-gold mt-2 italic opacity-90">
            Interactive Christmas Tree
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent mt-4 opacity-50" />
        </div>
      </div>

      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex flex-col gap-4 z-10 pointer-events-auto">
        <button 
          onClick={() => setTreeState(TreeState.FORMED)}
          className={`w-12 h-12 rounded-full border-2 border-luxury-gold flex items-center justify-center transition-all duration-500 ${treeState === TreeState.FORMED ? 'bg-luxury-gold text-black shadow-[0_0_20px_#FFD700]' : 'bg-black/50 text-luxury-gold'}`}
          title="Form Tree"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
        <button 
          onClick={() => setTreeState(TreeState.CHAOS)}
          className={`w-12 h-12 rounded-full border-2 border-luxury-gold flex items-center justify-center transition-all duration-500 ${treeState === TreeState.CHAOS ? 'bg-luxury-gold text-black shadow-[0_0_20px_#FFD700]' : 'bg-black/50 text-luxury-gold'}`}
          title="Unleash Chaos"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-8 w-full text-center pointer-events-none">
        <p className="text-luxury-gold/60 font-serif text-sm tracking-widest uppercase">
          Open Hand to Unleash • Close Hand to Form
        </p>
      </div>

      {/* Vision Controller */}
      <GestureController 
        onStateChange={setTreeState} 
        onPositionChange={setHandPosition}
      />
    </div>
  );
}

export default App;
