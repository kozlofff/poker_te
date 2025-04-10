import { useState, useCallback } from 'react';
import { GameState } from './poker';
import { startGame as startGameLogic, resetGame as resetGameLogic, handleAction } from './game-functions';

export type EvaluationResults = {
  [key: string]: {
    winnings: string;
    payoffs: number[];
  };
};

export const useGameState = () => {
  const [stackSize, setStackSize] = useState<number>(10000);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [completedHands, setCompletedHands] = useState<GameState[]>([]);
  const [currentBetAmount, setCurrentBetAmount] = useState<number>(40);
  const [currentRaiseAmount, setCurrentRaiseAmount] = useState<number>(40);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResults>({});

  const startGame = useCallback(() => {
    startGameLogic(stackSize, setGameState, setCurrentBetAmount, setCurrentRaiseAmount);
  }, [stackSize]);

  const resetGame = useCallback(() => {
    resetGameLogic(setGameState);
  }, []);

  const handleGameAction = async (action: string, amount?: number) => {
    if (!gameState) return;
    await handleAction(gameState, action, amount, setGameState, setCompletedHands);
  };

  return {
    stackSize,
    setStackSize,
    gameState,
    setGameState,
    completedHands,
    setCompletedHands,
    currentBetAmount,
    setCurrentBetAmount,
    currentRaiseAmount,
    setCurrentRaiseAmount,
    evaluationResults,
    setEvaluationResults,
    startGame,
    resetGame,
    handleGameAction
  };
}; 