import { useRef, useEffect } from 'react';
import { usePlayer } from '../context/SimplePlayerContext';

export default function Visualizer() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const { isPlaying, currentSong } = usePlayer();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let gradientColors = [
      { pos: 0, color: '#cba6f7' }, // Mauve
      { pos: 0.5, color: '#f5c2e7' }, // Pink
      { pos: 1, color: '#89dceb' }  // Sky
    ];

    // Resize canvas to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    // Draw animated visualizer
    const drawAnimatedVisualizer = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradientColors.forEach(color => {
        gradient.addColorStop(color.pos, color.color);
      });

      // Draw animated bars
      const barCount = 32;
      const barWidth = canvas.width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        // Create an animated pattern with varying heights
        const time = Date.now() / 1000;
        const height = (
          Math.sin(i * 0.2 + time) * (canvas.height * 0.2) +
          Math.sin(i * 0.1 + time * 1.5) * (canvas.height * 0.1) +
          (canvas.height * 0.1)
        );

        ctx.fillStyle = gradient;
        ctx.fillRect(i * (barWidth + 2), canvas.height - height, barWidth, height);

        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = gradientColors[0].color;
      }

      // Request next frame
      animationRef.current = requestAnimationFrame(drawAnimatedVisualizer);
    };

    // Draw static visualizer
    const drawStaticVisualizer = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#cba6f7');
      gradient.addColorStop(0.5, '#f5c2e7');
      gradient.addColorStop(1, '#89dceb');

      ctx.fillStyle = gradient;

      // Draw static bars
      const barCount = 32;
      const barWidth = canvas.width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        // Create a static pattern with varying heights
        const height = Math.sin(i * 0.2) * (canvas.height * 0.2) + (canvas.height * 0.1);
        ctx.fillRect(i * (barWidth + 2), canvas.height - height, barWidth, height);
      }
    };

    // Start visualizer
    const startVisualizer = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      drawAnimatedVisualizer();
    };

    // Stop visualizer
    const stopVisualizer = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      drawStaticVisualizer();
    };

    // Initialize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Start/stop visualizer based on playback
    if (isPlaying) {
      startVisualizer();
    } else {
      drawStaticVisualizer();
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      stopVisualizer();
    };
  }, [isPlaying, currentSong]);

  return (
    <div className="visualizer-container w-full h-40 mb-4">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}
