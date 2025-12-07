import React, { useRef, useEffect, useState, useCallback } from 'react';
import { analyzeHandGesture } from '../services/geminiService';
import { TreeState } from '../types';

interface GestureControllerProps {
  onStateChange: (state: TreeState) => void;
  onPositionChange: (pos: { x: number; y: number }) => void;
}

export const GestureController: React.FC<GestureControllerProps> = ({ 
  onStateChange, 
  onPositionChange 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugStatus, setDebugStatus] = useState("Initializing Camera...");
  
  // Throttle API calls to avoid rate limits and cost
  const PROCESSING_INTERVAL = 1000; 

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 320 }, // Low res is fine for gesture detection
          height: { ideal: 240 } 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setDebugStatus("Camera Active. Waiting for hand...");
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setDebugStatus("Camera Access Denied. Please allow camera.");
    }
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setIsProcessing(true);
    setDebugStatus("Analyzing...");

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Flip horizontally for mirror effect natural feel
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL('image/jpeg', 0.6); // Compress quality
        
        const result = await analyzeHandGesture(base64Image);
        
        // Logic mapping
        if (result.state === 'OPEN') {
          onStateChange(TreeState.CHAOS);
          setDebugStatus(`Detected: OPEN HAND (Chaos)`);
        } else if (result.state === 'CLOSED') {
          onStateChange(TreeState.FORMED);
          setDebugStatus(`Detected: CLOSED HAND (Form)`);
        } else {
          setDebugStatus("No clear hand detected...");
        }

        // Always update position if detected (or 0,0 if not)
        onPositionChange(result.position);
      }
    } catch (e) {
      console.error(e);
      setDebugStatus("Error analyzing frame");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, onStateChange, onPositionChange]);

  useEffect(() => {
    startVideo();
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    
    const intervalId = setInterval(captureAndAnalyze, PROCESSING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [hasPermission, captureAndAnalyze]);

  return (
    <div className="absolute bottom-4 left-4 z-50 flex flex-col items-start pointer-events-none">
      {/* Hidden processing elements */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* UI Feedback */}
      <div className="bg-black/80 border border-luxury-gold/30 p-4 rounded-lg backdrop-blur-sm max-w-xs pointer-events-auto">
        <h3 className="text-luxury-gold font-display text-sm font-bold mb-2 uppercase tracking-widest">
          Control Interface
        </h3>
        <p className="text-gray-300 text-xs font-serif italic mb-3">
          {debugStatus}
        </p>
        
        <div className="flex gap-2">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
           <span className="text-[10px] text-gray-500 uppercase tracking-wider">Live Vision Active</span>
        </div>
      </div>
    </div>
  );
};
