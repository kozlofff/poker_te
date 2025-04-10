import '@testing-library/jest-dom';
import { expect } from '@jest/globals';
import { 
  handleFold, 
  handleCall, 
  handleBet,
  findNextPosition,
  isRoundComplete,
  calculateWinnings
} from '../../components/game-logic/actions';
import { initializeGame } from '../../components/game-logic/poker';
import type { GameState } from '../../components/game-logic/poker';

describe('Poker Actions', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = initializeGame();
  });

  describe('handleFold', () => {
    it('should mark current player as folded', () => {
      const newState = handleFold(gameState);
      expect(newState.players[newState.currentPosition].hasFolded).toBe(true);
    });
  });

  describe('handleCall', () => {
    it('should update player stack and pot correctly on call', () => {
      const currentPlayer = gameState.players[gameState.currentPosition];
      const initialStack = currentPlayer.stack;
      const callAmount = gameState.currentBet - currentPlayer.currentBet;
      const initialPot = gameState.pot;

      const newState = handleCall(gameState);

      expect(newState.players[newState.currentPosition].stack).toBe(initialStack - callAmount);
      expect(newState.pot).toBe(initialPot + callAmount);
    });

    it('should handle all-in calls correctly', () => {
      const currentPlayer = gameState.players[gameState.currentPosition];
      currentPlayer.stack = 30;
      gameState.currentBet = 100;

      const newState = handleCall(gameState);

      expect(newState.players[newState.currentPosition].stack).toBe(0);
      expect(newState.players[newState.currentPosition].currentBet).toBe(currentPlayer.currentBet + 30);
    });
  });

  describe('findNextPosition', () => {
    it('should find next active player', () => {
      gameState = initializeGame(6);
      gameState.currentPosition = 0;
      gameState.players[1].hasFolded = true;
      
      const nextPos = findNextPosition(gameState);
      expect(nextPos).toBe(2);
    });

    it('should wrap around to beginning if needed', () => {
      gameState.currentPosition = gameState.players.length - 1;
      const nextPos = findNextPosition(gameState);
      expect(nextPos).toBe(0);
    });
  });

  describe('isRoundComplete', () => {
    it('should identify when round is complete', () => {
      gameState.players.forEach(p => {
        p.currentBet = gameState.currentBet;
      });
      
      const complete = isRoundComplete(
        gameState,
        gameState.roundStartPosition,
        'call'
      );
      
      expect(complete).toBe(true);
    });

    it('should identify when round is not complete', () => {
      gameState.players[gameState.currentPosition].currentBet = 0;
      
      const complete = isRoundComplete(
        gameState,
        (gameState.currentPosition + 1) % gameState.players.length,
        'call'
      );
      
      expect(complete).toBe(false);
    });
  });

  describe('calculateWinnings', () => {
    it('should calculate winnings correctly', () => {
      gameState.players.forEach((p, i) => {
        p.stack = gameState.initialStackSize + (i * 100);
      });

      const winnings = calculateWinnings(gameState);
      expect(winnings).toContain('Player 1: 0');
      expect(winnings).toContain('Player 2: +100');
    });
  });
}); 