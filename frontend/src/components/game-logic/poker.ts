// card suits and ranks
const SUITS = ['h', 'd', 'c', 's'] as const;
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const;

type Suit = typeof SUITS[number];
type Rank = typeof RANKS[number];
export type Card = `${Rank}${Suit}`;

export interface Player {
  id: number;
  stack: number;
  currentBet: number;
  hasFolded: boolean;
  holeCards: string[];
  position: string;
  hasActedThisRound: boolean;
}

type GameStage = 'NOT_STARTED' | 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';

type GameState = {
  players: Player[];
  deck: Card[];
  communityCards: Card[];
  currentPosition: number;
  dealerPosition: number;
  smallBlindPosition: number;
  bigBlindPosition: number;
  stage: GameStage;
  pot: number;
  currentBet: number;
  roundStartPosition: number;
  logs: string[];
  handId: string;
  initialStackSize: number
  winnings?: string;
  actions?: string;
  evaluationResult?: {
    winnings?: string;
    payoffs?: number[];
  };
  payoffs?: number[];
};

export type { GameState };

export function generateHandId(): string {
  const segments = [12, 4, 4, 4, 12];
  return segments
    .map(length => {
      return Array.from({ length }, () => {
        const chars = '0123456789abcdef';
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
    })
    .join('-');
}

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(`${rank}${suit}` as Card);
    }
  }
  return shuffle(deck);
}

export function initializeGame(numPlayers: number = 6, startingStack: number = 10000): GameState {
  const deck = createDeck();
  const players: Player[] = Array.from({ length: numPlayers }, (_, i) => ({
    id: i + 1,
    stack: startingStack,
    currentBet: 0,
    hasFolded: false,
    holeCards: [],
    position: '',
    hasActedThisRound: false,
  }));

  const dealerPos = Math.floor(Math.random() * numPlayers);
  const sbPos = (dealerPos + 1) % numPlayers;
  const bbPos = (dealerPos + 2) % numPlayers;
  const startPos = (bbPos + 1) % numPlayers;

  players.forEach(player => {
    player.holeCards = [deck.pop()!, deck.pop()!] as string[];
  });

  players[sbPos].stack -= 20;
  players[sbPos].currentBet = 20;
  players[bbPos].stack -= 40;
  players[bbPos].currentBet = 40;

  return {
    players,
    deck,
    dealerPosition: dealerPos,
    smallBlindPosition: sbPos,
    bigBlindPosition: bbPos,
    currentPosition: startPos,
    roundStartPosition: startPos,
    pot: 60, // SB + BB
    stage: 'PREFLOP',
    communityCards: [],
    currentBet: 40,
    handId: generateHandId(),
    logs: [
      ...players.map(p => `Player ${p.id} is dealt ${p.holeCards[0]}${p.holeCards[1]}`),
      '---',
      `Player ${dealerPos + 1} is the dealer`,
      `Player ${sbPos + 1} posts small blind - 20 chips`,
      `Player ${bbPos + 1} posts big blind - 40 chips`,
      '---'
    ],
    initialStackSize: startingStack
  };
}

export function isValidAction(state: GameState, action: 'fold' | 'check' | 'call' | 'bet' | 'raise'): boolean {
  const player = state.players[state.currentPosition];
  const currentBet = state.currentBet;
  const playerBet = player.currentBet;

  switch (action) {
    case 'fold':
      return true;
    case 'check':
      return currentBet === playerBet;
    case 'call':
      return currentBet > playerBet && player.stack >= (currentBet - playerBet);
    case 'bet':
      return currentBet === playerBet && player.stack >= 40;
    case 'raise':
      return currentBet > 0 && player.stack >= (currentBet - playerBet + 40);
    default:
      return false;
  }
}

export function getNextStage(stage: GameStage): GameStage {
  const stages: GameStage[] = ['PREFLOP', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN'];
  const currentIndex = stages.indexOf(stage);
  return stages[currentIndex + 1];
} 