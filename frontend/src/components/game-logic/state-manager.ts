import { GameState, getNextStage } from './poker';
import { handleFold, handleCheck, handleCall, handleBet, handleRaise, findNextPosition, isRoundComplete, calculateWinnings, resetBetsForNewRound } from './actions';

export function handleGameAction(state: GameState, action: string, amount?: number): GameState {
  const newState = { ...state };
  const currentPlayer = newState.players[newState.currentPosition];

  // skip if player has already folded
  if (currentPlayer.hasFolded) {
    return newState;
  }

  // intialize actions if it doesnt exist
  if (!newState.actions) {
    newState.actions = '';
  }

  // handle the action and get action code
  let actionCode = '';
  let updatedState = newState;
  
  switch (action) {
    case 'fold':
      updatedState = handleFold(newState);
      actionCode = 'f';
      break;
    case 'check':
      updatedState = handleCheck(newState);
      actionCode = 'x';
      break;
    case 'call':
      updatedState = handleCall(newState);
      actionCode = 'c';
      break;
    case 'bet':
      if (amount) {
        updatedState = handleBet(newState, amount);
        actionCode = `b${amount}`;
      }
      break;
    case 'raise':
      if (amount) {
        updatedState = handleRaise(newState, amount);
        actionCode = `r${amount}`;
      }
      break;
  }

  // update actions string
  updatedState.actions = updatedState.actions ? `${updatedState.actions}:${actionCode}` : actionCode;

  // add action to logs
  let actionLog = `Player ${currentPlayer.id} `;
  actionLog += action === 'fold' ? 'folds' :
               action === 'check' ? 'checks' :
               action === 'call' ? (currentPlayer.stack === 0 ? 'calls all-in' : 'calls') :
               action === 'bet' ? (currentPlayer.stack === 0 ? 'bets all-in' : `bets ${amount} chips`) :
               (currentPlayer.stack === 0 ? 'raises all-in' : `raises on ${amount} chips`);
  updatedState.logs.push(actionLog);

  // find next position
  const nextPosition = findNextPosition(updatedState);
  const activePlayers = updatedState.players.filter(p => !p.hasFolded);
  
  // check if all players except one have folded
  if (activePlayers.length === 1) {
    const winner = activePlayers[0];
    winner.stack += updatedState.pot;
    updatedState.winnings = calculateWinnings(updatedState);
    return updatedState;
  }

  // check if round is complete
  if (isRoundComplete(updatedState, nextPosition, action)) {
    if (updatedState.stage === 'RIVER') {
      updatedState.stage = 'SHOWDOWN';
      updatedState.winnings = calculateWinnings(updatedState);
      return updatedState;
    }

    // deal next round if not at showdown
    const nextStage = getNextStage(updatedState.stage);
    updatedState.stage = nextStage;
    
    switch (nextStage) {
      case 'FLOP':
        const flop = [updatedState.deck.pop()!, updatedState.deck.pop()!, updatedState.deck.pop()!];
        updatedState.communityCards = flop;
        updatedState.logs.push(`Flop cards dealt: ${flop.join('')}`);
        break;
      case 'TURN':
        const turn = updatedState.deck.pop()!;
        updatedState.communityCards.push(turn);
        updatedState.logs.push(`Turn card dealt: ${turn}`);
        break;
      case 'RIVER':
        const river = updatedState.deck.pop()!;
        updatedState.communityCards.push(river);
        updatedState.logs.push(`River card dealt: ${river}`);
        break;
      case 'SHOWDOWN':
        updatedState.winnings = calculateWinnings(updatedState);
        return updatedState;
    }

    // reset bets for next round
    resetBetsForNewRound(updatedState);
    let newStartPosition = updatedState.smallBlindPosition;
    
    // skip folded players for the next round start position
    while (updatedState.players[newStartPosition].hasFolded) {
      newStartPosition = (newStartPosition + 1) % updatedState.players.length;
    }
    updatedState.roundStartPosition = newStartPosition;
    updatedState.currentPosition = newStartPosition;
    return updatedState;
  }

  updatedState.currentPosition = nextPosition;
  return updatedState;
} 