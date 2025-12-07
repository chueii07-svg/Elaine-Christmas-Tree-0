export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED',
}

export interface HandAnalysisResult {
  state: 'OPEN' | 'CLOSED' | 'UNKNOWN';
  position: {
    x: number; // -1 (left) to 1 (right)
    y: number; // -1 (bottom) to 1 (top)
  };
}

export interface SceneProps {
  treeState: TreeState;
  handPosition: { x: number; y: number };
}

// Augment JSX IntrinsicElements to fix React Three Fiber element errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      color: any;
      group: any;
      points: any;
      instancedMesh: any;
      bufferGeometry: any;
      sphereGeometry: any;
      boxGeometry: any;
      bufferAttribute: any;
      shaderMaterial: any;
      meshStandardMaterial: any;
    }
  }
}