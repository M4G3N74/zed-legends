import React, { useRef, useEffect, useState } from 'react';
import { usePlayer } from '../context/SimplePlayerContext';

interface SimplePlayerContextType {
  isPlaying: boolean;
  currentSong: any; // You might want to define a more specific type for currentSong
  currentTime: number;
  duration: number;
}

export default function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const { isPlaying, currentSong, currentTime, duration } = usePlayer() as SimplePlayerContextType;
  
  // Interactive states
  const [visualizerStyle, setVisualizerStyle] = useState<'bars' | 'wave' | 'circle'>('bars'); // bars, wave, circle
  const [colorScheme, setColorScheme] = useState<'purple' | 'rainbow' | 'fire'>('purple'); // purple, rainbow, fire
  const [sensitivity, setSensitivity] = useState<number>(1.0);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  // Color schemes
  const getColors = (): string[] => {
    switch (colorScheme) {
      case 'rainbow':
        return ['#ff0080', '#ff8000', '#ffff00', '#80ff00', '#00ff80', '#0080ff', '#8000ff'];
      case 'fire':
        return ['#ff4500', '#ff6347', '#ffa500', '#ffff00', '#ff1493'];
      default:
        return ['#cba6f7', '#f5c2e7', '#89dceb', '#a6e3a1'];
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize canvas to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    // Interactive visualizer based on selected style
    const drawAudioVisualizer = () => {
      switch (visualizerStyle) {
        case 'wave':
          drawWaveVisualizer();
          break;
        case 'circle':
          drawCircleVisualizer();
          break;
        default:
          drawBarsVisualizer();
      }
    };

    // Interactive bars visualizer
    const drawBarsVisualizer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const colors = getColors();
      const barCount = 32;
      const barWidth = canvas.width / barCount - 2;
      const time = Date.now() / 1000;
      const progress = duration > 0 ? currentTime / duration : 0;
      
      for (let i = 0; i < barCount; i++) {
        const baseHeight = (
          Math.sin(i * 0.3 + time * 2) * (canvas.height * 0.15 * sensitivity) +
          Math.sin(i * 0.1 + time * 1.2) * (canvas.height * 0.1 * sensitivity) +
          Math.sin(i * 0.05 + time * 0.8) * (canvas.height * 0.05 * sensitivity) +
          (canvas.height * 0.1)
        );
        
        // Mouse interaction effect
        const mouseDistance = Math.abs((i / barCount) - mousePos.x);
        const mouseEffect = Math.max(0, 1 - mouseDistance * 3) * mousePos.y * canvas.height * 0.3;
        const height = baseHeight + mouseEffect;
        
        // Progress-based coloring
        const colorIndex = Math.floor((i / barCount + progress) * colors.length) % colors.length;
        ctx.fillStyle = colors[colorIndex];
        
        ctx.fillRect(i * (barWidth + 2), canvas.height - height, barWidth, height);
      }
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(drawAudioVisualizer);
      }
    };

    // Wave visualizer
    const drawWaveVisualizer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const colors = getColors();
      const time = Date.now() / 1000;
      const progress = duration > 0 ? currentTime / duration : 0;
      
      ctx.lineWidth = 3;
      
      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        ctx.strokeStyle = colors[wave % colors.length];
        
        for (let x = 0; x < canvas.width; x += 2) {
          const normalizedX = x / canvas.width;
          const y = canvas.height / 2 + 
            Math.sin(normalizedX * 10 + time * (2 + wave) + progress * 5) * 
            (canvas.height * 0.2 * sensitivity) * (1 + wave * 0.3) +
            (mousePos.x - 0.5) * Math.sin(normalizedX * 5) * mousePos.y * 50;
          
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.stroke();
      }
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(drawAudioVisualizer);
      }
    };

    // Circle visualizer
    const drawCircleVisualizer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const colors = getColors();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const time = Date.now() / 1000;
      const progress = duration > 0 ? currentTime / duration : 0;
      
      const circleCount = 20;
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.1;
      
      for (let i = 0; i < circleCount; i++) {
        const angle = (i / circleCount) * Math.PI * 2 + time + progress * 2;
        const radius = baseRadius + 
          Math.sin(time * 2 + i * 0.5) * baseRadius * 0.5 * sensitivity +
          mousePos.y * 30;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const size = 5 + Math.sin(time * 3 + i) * 3 * sensitivity;
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(drawAudioVisualizer);
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
      drawAudioVisualizer();
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
  }, [isPlaying, currentSong, visualizerStyle, colorScheme, sensitivity, mousePos, currentTime, duration]);

  return (
    <div 
      className="visualizer-container w-full h-40 mb-4 relative group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <canvas ref={canvasRef} className="w-full h-full rounded-lg"></canvas>
      
      {/* Interactive Controls */}
      {showControls && (
        <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm rounded-lg p-3 space-y-2 border border-overlay/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Style:</span>
            <select 
              value={visualizerStyle} 
              onChange={(e) => setVisualizerStyle(e.target.value as 'bars' | 'wave' | 'circle')}
              className="text-xs bg-background border border-overlay rounded px-2 py-1"
            >
              <option value="bars">Bars</option>
              <option value="wave">Wave</option>
              <option value="circle">Circle</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Color:</span>
            <select 
              value={colorScheme} 
              onChange={(e) => setColorScheme(e.target.value as 'purple' | 'rainbow' | 'fire')}
              className="text-xs bg-background border border-overlay rounded px-2 py-1"
            >
              <option value="purple">Purple</option>
              <option value="rainbow">Rainbow</option>
              <option value="fire">Fire</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Intensity:</span>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-16 h-1 bg-overlay rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
      
      {/* Interaction Hint */}
      <div className="absolute bottom-2 left-2 text-xs text-muted/70 opacity-0 group-hover:opacity-100 transition-opacity">
        Move mouse to interact • Hover for controls
      </div>
    </div>
  );
}
