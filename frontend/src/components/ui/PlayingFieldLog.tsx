import { RefObject, useEffect } from 'react';
import { GameState } from '../game-logic/poker';

interface PlayingFieldLogProps {
  logContainerRef: RefObject<HTMLDivElement | null>;
  gameState: GameState | null;
  stackSize: number;
  setStackSize: (size: number) => void;
  startGame: () => void;
  resetGame: () => void;
  children: React.ReactNode;
}

export function PlayingFieldLog({
  logContainerRef,
  gameState,
  stackSize,
  setStackSize,
  startGame,
  resetGame,
  children
  }: PlayingFieldLogProps) {
  // auto-scroll
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [gameState, logContainerRef]);

  return (
    <div className="min-h-[800px]">
      <div className="h-full flex flex-col">
        <h2 className="text-xl mb-4">Playing field log</h2>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-base font-medium">Stacks</span>
          <input 
            type="number"
            min="10000"
            value={stackSize}
            onChange={(e) => setStackSize(Number(e.target.value))}
            disabled={gameState !== null}
            className="bg-gray-100 px-4 py-2 w-32 text-base rounded border border-gray-200"
          />
          <button 
            onClick={() => setStackSize(Number(stackSize))}
            disabled={gameState !== null}
            className="bg-[#EEEEEE] border px-8 py-2 text-base rounded border-black hover:bg-gray-300 w-40 disabled:opacity-50"
          >
            Apply
          </button>
          <button 
            onClick={gameState ? resetGame : startGame}
            className={`${
              gameState ? 'bg-[#E06666] hover:bg-red-500' : 'bg-[#B6D7A8] hover:bg-green-500'
            } text-black boldtext px-8 py-2 text-base rounded border border-black w-40`}
          >
            {gameState ? 'Reset' : 'Start'}
          </button>
        </div>
        <div 
          ref={logContainerRef}
          className="flex-1 text-sm leading-5 mb-4 bg-white border border-gray-200 p-3 overflow-y-auto whitespace-pre rounded scrollbar-hide" 
          style={{ 
            minHeight: '600px',
            maxHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {gameState?.logs.map((log, i) => (
            <div key={i} className={log.includes('dealt:') || log.includes('ended') || log.includes('pot') ? 'font-bold' : ''}>
              {log || '\u00A0'}
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
} 