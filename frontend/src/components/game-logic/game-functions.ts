import { GameState, getNextStage, initializeGame } from './poker';
import { sendHandInfoToBackend } from './api';

export const isGameEnded = (state: GameState): boolean => {
  const activePlayers = state.players.filter(p => !p.hasFolded);
  return activePlayers.length === 1 || state.stage === 'SHOWDOWN' || state.logs.some(log => log.includes(`Hand #${state.handId} ended`));
};

export const startGame = (
  stackSize: number,
  setGameState: (state: GameState) => void,
  setCurrentBetAmount: (amount: number) => void,
  setCurrentRaiseAmount: (amount: number) => void
): void => {
  const newGame = initializeGame(6, stackSize);
  setGameState(newGame);
  setCurrentBetAmount(40);
  setCurrentRaiseAmount(40);
};

export const resetGame = (
  setGameState: (state: GameState | null) => void
): void => {
  setGameState(null);
};

export const handleAction = async (
  gameState: GameState,
  action: string,
  amount: number | undefined,
  setGameState: (state: GameState) => void,
  setCompletedHands: (hands: (prev: GameState[]) => GameState[]) => void
): Promise<void> => {
  if (!gameState) return;

  const newState = { ...gameState };
  const currentPlayer = newState.players[newState.currentPosition];

  if (currentPlayer.hasFolded) {
    return;
  }

  const actionAmount = amount || newState.currentBet;

  if (!newState.actions) {
    newState.actions = '';
  }

  let actionCode = '';
  switch (action) {
    case 'fold':
      currentPlayer.hasFolded = true;
      actionCode = 'f';
      break;
    case 'check':
      actionCode = 'x';
      break;
    case 'call':
      const callAmount = Math.min(newState.currentBet - currentPlayer.currentBet, currentPlayer.stack);
      currentPlayer.stack -= callAmount;
      currentPlayer.currentBet += callAmount;
      newState.pot += callAmount;
      actionCode = 'c';
      break;
    case 'bet':
      const betAmount = Math.min(actionAmount, currentPlayer.stack);
      currentPlayer.stack -= betAmount;
      currentPlayer.currentBet = betAmount;
      newState.currentBet = betAmount;
      newState.pot += betAmount;
      actionCode = `b${betAmount}`;
      break;
    case 'raise':
      const raiseTotal = Math.min(actionAmount, currentPlayer.stack + currentPlayer.currentBet);
      const raiseAmount = raiseTotal - currentPlayer.currentBet;
      currentPlayer.stack -= raiseAmount;
      currentPlayer.currentBet = raiseTotal;
      newState.currentBet = raiseTotal;
      newState.pot += raiseAmount;
      actionCode = `r${raiseTotal}`;
      break;
  }

  newState.actions = newState.actions ? `${newState.actions}:${actionCode}` : actionCode;

  let actionLog = `Player ${currentPlayer.id} `;
  actionLog += action === 'fold' ? 'folds' :
               action === 'check' ? 'checks' :
               action === 'call' ? (currentPlayer.stack === 0 ? 'calls all-in' : 'calls') :
               action === 'bet' ? (currentPlayer.stack === 0 ? 'bets all-in' : `bets ${actionAmount} chips`) :
               (currentPlayer.stack === 0 ? 'raises all-in' : `raises on ${actionAmount} chips`);
  newState.logs.push(actionLog);

  let nextPosition = (newState.currentPosition + 1) % newState.players.length;
  let activePlayers = newState.players.filter(p => !p.hasFolded);
  
  while (newState.players[nextPosition].hasFolded) {
    nextPosition = (nextPosition + 1) % newState.players.length;
  }

  const allBetsEqual = activePlayers.every(p => p.currentBet === newState.currentBet || p.stack === 0);
  const roundComplete = allBetsEqual && (nextPosition === newState.roundStartPosition || action === 'fold');
  
  if (activePlayers.length === 1) {
    const winner = activePlayers[0];
    winner.stack += newState.pot;
    
    const winnings = newState.players.map((p, i) => {
      const netChange = p.stack - newState.initialStackSize;
      return `Player ${i + 1}: ${netChange > 0 ? '+' : ''}${netChange}`;
    }).join('; ');
    newState.winnings = winnings;
    
    setGameState(newState);

    try {
      const updatedState = await sendHandInfoToBackend(newState);
      setGameState(updatedState);
      setCompletedHands(prev => [...prev, updatedState]);
    } catch (error) {
      console.error('Failed to evaluate hand:', error);
    }
    return;
  }

  if (roundComplete) {
    if (newState.stage === 'RIVER' && allBetsEqual) {
      newState.stage = 'SHOWDOWN';
      
      const winnings = newState.players.map((p, i) => {
        const netChange = p.stack - newState.initialStackSize;
        return `Player ${i + 1}: ${netChange > 0 ? '+' : ''}${netChange}`;
      }).join('; ');
      newState.winnings = winnings;
      
      setGameState(newState);

      try {
        const updatedState = await sendHandInfoToBackend(newState);
        setGameState(updatedState);
        setCompletedHands(prev => [...prev, updatedState]);
      } catch (error) {
        console.error('Failed to evaluate hand:', error);
      }
      return;
    }

    if (newState.stage !== 'RIVER') {
      const nextStage = getNextStage(newState.stage);
      newState.stage = nextStage;
      
      switch (nextStage) {
        case 'FLOP':
          const flop = [newState.deck.pop()!, newState.deck.pop()!, newState.deck.pop()!];
          newState.communityCards = flop;
          newState.logs.push(`Flop cards dealt: ${flop.join('')}`);
          break;
        case 'TURN':
          const turn = newState.deck.pop()!;
          newState.communityCards.push(turn);
          newState.logs.push(`Turn card dealt: ${turn}`);
          break;
        case 'RIVER':
          const river = newState.deck.pop()!;
          newState.communityCards.push(river);
          newState.logs.push(`River card dealt: ${river}`);
          break;
        case 'SHOWDOWN':
          setCompletedHands(prev => [...prev, newState]);
          setGameState(newState);

          try {
            const updatedState = await sendHandInfoToBackend(newState);
            setGameState(updatedState);
          } catch (error) {
            console.error('Failed to evaluate hand:', error);
          }
          return;
      }
      newState.players.forEach(p => p.currentBet = 0);
      newState.currentBet = 0;
      nextPosition = newState.smallBlindPosition;
      
      while (newState.players[nextPosition].hasFolded) {
        nextPosition = (nextPosition + 1) % newState.players.length;
      }
      newState.roundStartPosition = nextPosition;
    }
  }

  newState.currentPosition = nextPosition;
  setGameState(newState);
}; 