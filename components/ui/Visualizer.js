import { useRef, useEffect } from 'react';
import { usePlayer } from '../context/SimplePlayerContext';

export default function Visualizer() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const { isPlaying, currentSong, audioRef } = usePlayer();

  // Initialize audio context and analyser
  useEffect(() => {
    if (!audioRef.current || sourceRef.current) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    } catch (error) {
      console.warn('Audio analysis not available (CORS or API issue):', error);
      // Clear references so we fall back to simulated visualizer
      analyserRef.current = null;
      dataArrayRef.current = null;
      sourceRef.current = null;
    }
  }, [audioRef, currentSong]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Resize canvas to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    // Draw real-time audio visualizer
    const drawAudioVisualizer = () => {
      if (!analyserRef.current || !dataArrayRef.current) {
        // Fallback to simulated visualizer
        drawSimulatedVisualizer();
        return;
      }

      try {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#cba6f7');
        gradient.addColorStop(0.5, '#f5c2e7');
        gradient.addColorStop(1, '#89dceb');
        
        const barCount = dataArrayRef.current.length;
        const barWidth = canvas.width / barCount - 1;
        
        for (let i = 0; i < barCount; i++) {
          const barHeight = (dataArrayRef.current[i] / 255) * canvas.height * 0.8;
          
          ctx.fillStyle = gradient;
          ctx.fillRect(i * (barWidth + 1), canvas.height - barHeight, barWidth, barHeight);
        }
      } catch (error) {
        // Fall back to simulated if real analysis fails
        drawSimulatedVisualizer();
        return;
      }
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(drawAudioVisualizer);
      }
    };

    // Draw simulated visualizer when real audio analysis isn't available
    const drawSimulatedVisualizer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#cba6f7');
      gradient.addColorStop(0.5, '#f5c2e7');
      gradient.addColorStop(1, '#89dceb');
      
      const barCount = 32;
      const barWidth = canvas.width / barCount - 2;
      const time = Date.now() / 1000;
      
      for (let i = 0; i < barCount; i++) {
        const height = (
          Math.sin(i * 0.3 + time * 2) * (canvas.height * 0.15) +
          Math.sin(i * 0.1 + time * 1.2) * (canvas.height * 0.1) +
          Math.sin(i * 0.05 + time * 0.8) * (canvas.height * 0.05) +
          (canvas.height * 0.1)
        );
        
        ctx.fillStyle = gradient;
        ctx.fillRect(i * (barWidth + 2), canvas.height - height, barWidth, height);
      }
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(drawSimulatedVisualizer);
      }
    };

    // Draw static visualizer
    const drawStaticVisualizer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#cba6f7');
      gradient.addColorStop(0.5, '#f5c2e7');
      gradient.addColorStop(1, '#89dceb');
      
      ctx.fillStyle = gradient;
      
      const barCount = 32;
      const barWidth = canvas.width / barCount - 2;
      
      for (let i = 0; i < barCount; i++) {
        const height = Math.sin(i * 0.2) * (canvas.height * 0.2) + (canvas.height * 0.1);
        ctx.fillRect(i * (barWidth + 2), canvas.height - height, barWidth, height);
      }
    };

    // Initialize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Start/stop visualizer based on playback
    if (isPlaying) {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          drawAudioVisualizer();
        });
      } else {
        drawAudioVisualizer();
      }
    } else {
      drawStaticVisualizer();
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, currentSong]);

  return (
    <div className="visualizer-container w-full h-40 mb-4">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}
