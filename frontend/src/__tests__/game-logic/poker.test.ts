import { initializeGame, isValidAction, getNextStage } from '../../components/game-logic/poker';
import type { GameState, Player } from '../../components/game-logic/poker';
import { expect } from '@jest/globals';

describe('Poker Game Logic', () => {
  describe('initializeGame', () => {
    it('should initialize game with correct number of players and stack sizes', () => {
      const numPlayers = 6;
      const startingStack = 10000;
      const game = initializeGame(numPlayers, startingStack);

      expect(game.players).toHaveLength(numPlayers);
      game.players.forEach(player => {
        expect(player.stack).toBe(startingStack - (player.currentBet || 0));
      });
    });

    it('should set up blinds correctly', () => {
      const game = initializeGame();
      const sbPlayer = game.players[game.smallBlindPosition];
      const bbPlayer = game.players[game.bigBlindPosition];

      expect(sbPlayer.currentBet).toBe(20);
      expect(bbPlayer.currentBet).toBe(40);
      expect(game.pot).toBe(60);
    });

    it('should deal two cards to each player', () => {
      const game = initializeGame();
      game.players.forEach(player => {
        expect(player.holeCards).toHaveLength(2);
        player.holeCards.forEach(card => {
          expect(typeof card).toBe('string');
          expect(card).toMatch(/^[2-9TJQKA][hdcs]$/);
        });
      });
    });
  });

  describe('isValidAction', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = initializeGame();
    });

    it('should allow fold at any time', () => {
      expect(isValidAction(gameState, 'fold')).toBe(true);
    });

    it('should allow check only when no bet to call', () => {
      const player = gameState.players[gameState.currentPosition];
    });
  });
}); 