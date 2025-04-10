import { GameState } from './poker';

export function handleFold(state: GameState): GameState {
  const newState = { ...state };
  const currentPlayer = newState.players[newState.currentPosition];
  currentPlayer.hasFolded = true;
  return newState;
}

export function handleCheck(state: GameState): GameState {
  return { ...state };
}

export function handleCall(state: GameState): GameState {
  // Deep clone the state to avoid mutations
  const newState = {
    ...state,
    players: state.players.map(p => ({ ...p }))
  };
  
  // Get the original bet before any changes
  const originalBet = state.players[state.currentPosition].currentBet;
  
  // Work with the new player object
  const currentPlayer = newState.players[newState.currentPosition];
  
  // Calculate how much more they need to put in to call
  const amountNeededToCall = newState.currentBet - originalBet;
  
  // How much they can actually put in (limited by their stack)
  const actualCallAmount = Math.min(amountNeededToCall, currentPlayer.stack);
  
  // Update their stack
  currentPlayer.stack -= actualCallAmount;
  
  // Their total bet is their previous bet plus what they just put in
  currentPlayer.currentBet = originalBet + actualCallAmount;
  
  // Add their new money to the pot
  newState.pot += actualCallAmount;
  
  return newState;
}

export function handleBet(state: GameState, amount: number): GameState {
  const newState = { ...state };
  const currentPlayer = newState.players[newState.currentPosition];
  const betAmount = Math.min(amount, currentPlayer.stack);
  currentPlayer.stack -= betAmount;
  currentPlayer.currentBet = betAmount;
  newState.currentBet = betAmount;
  newState.pot += betAmount;
  return newState;
}

export function handleRaise(state: GameState, amount: number): GameState {
  const newState = { ...state };
  const currentPlayer = newState.players[newState.currentPosition];
  const raiseTotal = Math.min(amount, currentPlayer.stack + currentPlayer.currentBet);
  const raiseAmount = raiseTotal - currentPlayer.currentBet;
  currentPlayer.stack -= raiseAmount;
  currentPlayer.currentBet = raiseTotal;
  newState.currentBet = raiseTotal;
  newState.pot += raiseAmount;
  return newState;
}

export function findNextPosition(state: GameState): number {
  let nextPosition = (state.currentPosition + 1) % state.players.length;
  const startPosition = nextPosition;  // Remember where we started
  
  // Keep looking until we find a non-folded player or we've checked all positions
  while (state.players[nextPosition].hasFolded) {
    nextPosition = (nextPosition + 1) % state.players.length;
    // If we've checked all positions and found none, return the original next position
    if (nextPosition === startPosition) {
      return startPosition;
    }
  }
  
  return nextPosition;
}

export function isRoundComplete(state: GameState, nextPosition: number, action: string): boolean {
  const activePlayers = state.players.filter(p => !p.hasFolded);
  const allBetsEqual = activePlayers.every(p => p.currentBet === state.currentBet || p.stack === 0);
  return allBetsEqual && (nextPosition === state.roundStartPosition || action === 'fold');
}

export function calculateWinnings(state: GameState): string {
  return state.players.map((p, i) => {
    const netChange = p.stack - state.initialStackSize;
    return `Player ${i + 1}: ${netChange > 0 ? '+' : ''}${netChange}`;
  }).join('; ');
}

export function resetBetsForNewRound(state: GameState): void {
  state.players.forEach(p => p.currentBet = 0);
  state.currentBet = 0;
} 