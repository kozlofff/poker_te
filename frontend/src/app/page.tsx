'use client'

import { useRef } from 'react';
import { isGameEnded } from '../components/game-logic/game-functions';
import { useGameState } from '../components/game-logic/game-state';
import { ActionButtons } from '../components/ui/ActionButtons';
import { HandHistory } from '../components/ui/HandHistory';
import { PlayingFieldLog } from '../components/ui/PlayingFieldLog';
import { Divider } from '../components/ui/Divider';

export default function Home() {
  const {
    stackSize,
    setStackSize,
    gameState,
    completedHands,
    setCompletedHands,
    currentBetAmount,
    currentRaiseAmount,
    setCurrentBetAmount,
    setCurrentRaiseAmount,
    startGame,
    resetGame,
    handleGameAction
  } = useGameState();
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  return (
    <main className="container mx-auto p-6 min-h-screen max-w-[1400px]">
      <div className="flex justify-between items-stretch">
        <div className="w-[60%]">
          <PlayingFieldLog
            logContainerRef={logContainerRef}
            gameState={gameState}
            stackSize={stackSize}
            setStackSize={setStackSize}
            startGame={startGame}
            resetGame={resetGame}
          >
            <ActionButtons
              gameState={gameState}
              currentBetAmount={currentBetAmount}
              currentRaiseAmount={currentRaiseAmount}
              setCurrentBetAmount={setCurrentBetAmount}
              setCurrentRaiseAmount={setCurrentRaiseAmount}
              handleAction={handleGameAction}
              isGameEnded={isGameEnded}
            />
          </PlayingFieldLog>
        </div>

        <Divider />
        
        <div className="w-[38%]">
          <HandHistory 
            completedHands={completedHands} 
            setCompletedHands={setCompletedHands}
          />
        </div>
      </div>
    </main>
  );
}