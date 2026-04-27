import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './Engine';
import { GameRenderer } from './Renderer';

interface GameProps {
  onGameOver: (score: number) => void;
}

export const Game: React.FC<GameProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const keysJustPressedRef = useRef<Set<string>>(new Set());
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Set canvas dimensions
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    engineRef.current = new GameEngine(canvasRef.current.width, canvasRef.current.height);
    rendererRef.current = new GameRenderer(canvasRef.current);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!keysRef.current.has(e.key)) {
        keysJustPressedRef.current.add(e.key);
      }
      keysRef.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (engineRef.current && rendererRef.current) {
        engineRef.current.update(keysRef.current, keysJustPressedRef.current);
        rendererRef.current.render(engineRef.current.state);

        // Clear just pressed keys after update
        keysJustPressedRef.current.clear();

        if (engineRef.current.state.isGameOver) {
          onGameOver(engineRef.current.state.player.score);
          return;
        }
      }
      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, [onGameOver]);

  return (
    <div className="w-full h-full relative cursor-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Controls Help Overlay (Mobile/Desktop) */}
      <div className="absolute bottom-8 left-8 text-white/30 font-mono text-xs pointer-events-none uppercase tracking-widest hidden md:block">
        WASD or ARROWS to Move • SPACE to Jump
      </div>
    </div>
  );
};
