/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Game } from './components/Game/Game';
import { Play, Trophy, Info } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-[#000] text-white overflow-hidden font-sans select-none">
      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center min-h-screen p-4"
          >
            <div className="text-center mb-12">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-yellow-400 drop-shadow-[0_5px_0_rgba(0,0,0,1)]">
                QUEST FOR PIXELS
              </h1>
              <p className="text-xl text-gray-400 font-mono italic">BY CRISTIAN GIMENEZ</p>
            </div>

            <div className="space-y-4 w-full max-w-xs">
              <button
                onClick={() => setGameState('playing')}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 px-8 rounded-xl border-b-8 border-yellow-600 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-2 text-2xl group"
              >
                <Play className="fill-current group-hover:scale-110 transition-transform" />
                START GAME
              </button>
              
              <button className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 px-8 rounded-xl border-b-8 border-blue-700 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-2 text-xl">
                <Trophy size={20} />
                HIGHSCORES
              </button>
            </div>

            <div className="mt-24 grid grid-cols-3 gap-8 opacity-50">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-500 rounded border-b-4 border-green-700 mb-2" />
                <span className="text-[10px] uppercase tracking-widest font-bold">PIPES</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-red-500 rounded-full border-b-4 border-red-700 mb-2" />
                <span className="text-[10px] uppercase tracking-widest font-bold">POWERUPS</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-yellow-400 rotate-45 border-b-4 border-yellow-600 mb-2" />
                <span className="text-[10px] uppercase tracking-widest font-bold">COLLECTIBLES</span>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-screen"
          >
            <Game 
              onGameOver={(finalScore) => {
                setScore(finalScore);
                setGameState('gameover');
              }}
            />
          </motion.div>
        )}

        {gameState === 'gameover' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-screen p-4 bg-black/80 backdrop-blur-sm"
          >
            <h2 className="text-6xl font-black text-red-500 mb-4 tracking-tighter">GAME OVER</h2>
            <div className="bg-white/10 p-8 rounded-2xl mb-8 text-center min-w-[300px]">
              <p className="text-gray-400 uppercase tracking-widest mb-2 font-bold">Final Score</p>
              <p className="text-6xl font-black text-yellow-400">{score}</p>
            </div>
            
            <div className="space-y-4 w-full max-w-xs">
              <button
                onClick={() => setGameState('playing')}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 px-8 rounded-xl border-b-8 border-yellow-600 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-2 text-xl"
              >
                TRY AGAIN
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 text-xl"
              >
                MAIN MENU
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

