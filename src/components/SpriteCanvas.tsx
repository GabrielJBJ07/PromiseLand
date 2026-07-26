import React, { useEffect, useRef, useState } from 'react';
import { CharacterPreset } from '../types';
import { drawPixelSprite } from '../utils/spriteGenerator';

interface SpriteCanvasProps {
  preset: CharacterPreset;
  size?: number; // Size in px (default 64)
  animated?: boolean;
  direction?: 'down' | 'left' | 'right' | 'up';
  hasAura?: boolean;
  className?: string;
}

export const SpriteCanvas: React.FC<SpriteCanvasProps> = ({
  preset,
  size = 64,
  animated = false,
  direction = 'down',
  hasAura = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, 250);
    return () => clearInterval(interval);
  }, [animated]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPixelSprite(
      ctx,
      preset,
      (canvas.width - size) / 2,
      (canvas.height - size) / 2,
      size,
      (direction || 'down') as 'down' | 'left' | 'right' | 'up',
      animated ? frame : 0,
      hasAura
    );
  }, [preset, size, direction, animated, frame, hasAura]);

  const canvasWidth = size * 1.25;
  const canvasHeight = size * 1.25;

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className={`inline-block image-pixelated ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
