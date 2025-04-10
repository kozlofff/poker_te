import { GameState } from '../game-logic/poker';
import { isValidAction } from '../game-logic/poker';

interface ActionButtonsProps {
  gameState: GameState | null;
  currentBetAmount: number;
  currentRaiseAmount: number;
  setCurrentBetAmount: (amount: number) => void;
  setCurrentRaiseAmount: (amount: number) => void;
  handleAction: (action: string, amount?: number) => void;
  isGameEnded: (state: GameState) => boolean;
}

export function ActionButtons({
  gameState,
  currentBetAmount,
  currentRaiseAmount,
  setCurrentBetAmount,
  setCurrentRaiseAmount,
  handleAction,
  isGameEnded
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button 
        onClick={() => handleAction('fold')}
        disabled={!gameState || isGameEnded(gameState)}
        className="bg-[#6D9EEB] px-4 py-1.5 text-sm rounded border border-black hover:bg-blue-300 disabled:opacity-50"
      >
        Fold
      </button>
      <button 
        onClick={() => handleAction('check')}
        disabled={!gameState || !isValidAction(gameState, 'check') || isGameEnded(gameState)}
        className="bg-[#B6D7A8] px-4 py-1.5 text-sm rounded border border-black hover:bg-green-300 disabled:opacity-50"
      >
        Check
      </button>
      <button 
        onClick={() => handleAction('call')}
        disabled={!gameState || !isValidAction(gameState, 'call') || isGameEnded(gameState)}
        className="bg-[#B6D7A8] px-4 py-1.5 text-sm rounded border border-black hover:bg-green-400 disabled:opacity-50"
      >
        Call
      </button>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setCurrentBetAmount(Math.max(40, currentBetAmount - 20))}
          disabled={!gameState || !isValidAction(gameState, 'bet') || isGameEnded(gameState)}
          className="bg-[#F6B26B] px-2 py-1.5 text-sm rounded border border-black hover:bg-orange-400 disabled:opacity-50"
        >
          -
        </button>
        <button 
          onClick={() => handleAction('bet', currentBetAmount)}
          disabled={!gameState || !isValidAction(gameState, 'bet') || isGameEnded(gameState)}
          className="bg-[#F6B26B] px-4 py-1.5 text-sm rounded border border-black hover:bg-orange-400 disabled:opacity-50"
        >
          Bet {currentBetAmount}
        </button>
        <button 
          onClick={() => setCurrentBetAmount(currentBetAmount + 20)}
          disabled={!gameState || !isValidAction(gameState, 'bet') || isGameEnded(gameState)}
          className="bg-[#F6B26B] px-2 py-1.5 text-sm rounded border border-black hover:bg-orange-400 disabled:opacity-50"
        >
          +
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setCurrentRaiseAmount(Math.max(40, currentRaiseAmount - 40))}
          disabled={!gameState || !isValidAction(gameState, 'raise') || isGameEnded(gameState)}
          className="bg-[#F6B26B] px-2 py-1.5 text-sm rounded border border-black hover:bg-orange-400 disabled:opacity-50"
        >
          -
        </button>
        <button 
          onClick={() => handleAction('raise', currentRaiseAmount)}
          disabled={!gameState || !isValidAction(gameState, 'raise') || isGameEnded(gameState)}
          className="bg-[#F6B26B] px-4 py-1.5 text-sm rounded border border-black hover:bg-orange-400 disabled:opacity-50"
        >
          Raise {currentRaiseAmount}
        </button>
        <button 
          onClick={() => setCurrentRaiseAmount(currentRaiseAmount + 40)}
          disabled={!gameState || !isValidAction(gameState, 'raise') || isGameEnded(gameState)}
          className="bg-[#F6B26B] px-2 py-1.5 text-sm rounded border border-black hover:bg-orange-400 disabled:opacity-50"
        >
          +
        </button>
      </div>
      <button 
        onClick={() => handleAction('raise', gameState?.players[gameState.currentPosition].stack)}
        disabled={!gameState || !isValidAction(gameState, 'raise') || isGameEnded(gameState)}
        className="bg-[#E06666] px-4 py-1.5 text-sm rounded border border-black hover:bg-red-500 disabled:opacity-50"
      >
        ALLIN
      </button>
    </div>
  );
} 