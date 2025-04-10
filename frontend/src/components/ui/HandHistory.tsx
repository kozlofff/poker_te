import { useEffect, useState } from 'react';
import { GameState } from '../game-logic/poker';
import { loadHands } from '../game-logic/api';

interface HandHistoryProps {
  completedHands: GameState[];
  setCompletedHands: (hands: GameState[]) => void;
}

export function HandHistory({ completedHands, setCompletedHands }: HandHistoryProps) {
  useEffect(() => {
    const fetchHands = async () => {
      const hands = await loadHands();
      setCompletedHands(hands);
    };
    fetchHands();
  }, [setCompletedHands]);

  return (
    <div className="bg-gray-50 p-4 rounded min-h-[800px] flex flex-col">
      <h2 className="text-xl mb-4">Hand history</h2>
      <div className="flex-1 space-y-3 overflow-y-auto">
        {completedHands.slice(-5).reverse().map((hand) => {
          // Split actions into chunks of 80 characters
          const actions = hand.actions || '';
          const formattedActions = actions.length > 80 
            ? actions.match(/.{1,80}/g)?.join('\n') || actions
            : actions;

          return (
            <div key={hand.handId} className="bg-blue-100 p-3 text-xs space-y-0.5 rounded">
              <div>Hand #{hand.handId}</div>
              <div>Stack {hand.initialStackSize}; Dealer: Player {hand.dealerPosition + 1}; Player {hand.smallBlindPosition + 1} Small blind; Player {hand.bigBlindPosition + 1} Big blind</div>
              <div>Hands: {hand.players.map(p => `Player ${p.id}: ${p.holeCards.join('')}`).join('; ')}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>Actions: {formattedActions}</div>
              <div>Winnings: {hand.winnings || 'Pending...'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 