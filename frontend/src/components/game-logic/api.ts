import { GameState } from './poker';

type GameStage = 'NOT_STARTED' | 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';

interface HandInfo {
  hand_id: string;
  stack_size: number;
  players: {
    id: number;
    cards: string;
    position: string;
    stack: number;
  }[];
  actions: string;
  community_cards: string;
  stack_info: string;
  positions: string;
  hole_cards: string;
  pot: number;
}

interface HandResponse {
  hands: {
    hand_id: string;
    stack_size: number;
    positions: string;
    hands: string[];
    actions: string;
    winnings: string;
  }[];
}

export async function loadHands(): Promise<GameState[]> {
  try {
    console.group('Loading Hand History');
    const response = await fetch('http://localhost:8000/api/v1/hands');
    if (!response.ok) {
      throw new Error('Failed to fetch hands');
    }
    const data: HandResponse = await response.json();
    
    const loadedHands = data.hands.map((hand) => {
      const positionMatches = {
        dealer: hand.positions.match(/Dealer: Player (\d+)/),
        smallBlind: hand.positions.match(/Player (\d+) Small blind/),
        bigBlind: hand.positions.match(/Player (\d+) Big blind/)
      };

      const dealerPos = positionMatches.dealer ? parseInt(positionMatches.dealer[1]) - 1 : 0;
      const sbPos = positionMatches.smallBlind ? parseInt(positionMatches.smallBlind[1]) - 1 : 1;
      const bbPos = positionMatches.bigBlind ? parseInt(positionMatches.bigBlind[1]) - 1 : 2;
      
      console.debug('Parsed positions:', {
        dealer: dealerPos,
        smallBlind: sbPos,
        bigBlind: bbPos,
        originalString: hand.positions
      });
      
      const players = hand.hands.map((cards: string, index: number) => ({
        id: index + 1,
        stack: hand.stack_size,
        holeCards: cards ? [cards.slice(0, 2), cards.slice(2, 4)] : [],
        hasFolded: false,
        hasActedThisRound: false,
        currentBet: 0,
        position: index === dealerPos ? 'D' : index === sbPos ? 'SB' : index === bbPos ? 'BB' : ''
      }));
      
      const logs = [
        `Hand #${hand.hand_id}`,
        `Stack ${hand.stack_size}`,
        hand.positions,
        `Hands: ${hand.hands.map((h: string, i: number) => `Player ${i + 1}: ${h}`).join('; ')}`,
        `Actions: ${hand.actions}`,
        `Winnings: ${hand.winnings || 'Pending...'}`
      ];
      
      return {
        handId: hand.hand_id,
        initialStackSize: hand.stack_size,
        players: players,
        dealerPosition: dealerPos,
        smallBlindPosition: sbPos,
        bigBlindPosition: bbPos,
        logs: logs,
        stage: 'SHOWDOWN' as GameStage,
        pot: 0,
        currentBet: 0,
        currentPosition: 0,
        roundStartPosition: 0,
        communityCards: [],
        deck: [],
        actions: hand.actions,
        winnings: hand.winnings || 'Pending...',
        evaluationResult: {
          winnings: hand.winnings || 'Pending...',
          payoffs: []
        }
      };
    });
    
    console.groupEnd();
    return loadedHands.reverse();
  } catch (error) {
    console.error('Error loading hands:', error);
    console.groupEnd();
    return [];
  }
}

export async function sendHandInfoToBackend(gameState: GameState): Promise<GameState> {
  try {
    console.group('Sending Hand Info to Backend');
    
    const stackInfo = `Stack ${gameState.initialStackSize}`;
    
    const positions = `Dealer: Player ${gameState.dealerPosition + 1}; Player ${gameState.smallBlindPosition + 1} Small blind; Player ${gameState.bigBlindPosition + 1} Big blind`;
    console.debug('Formatted positions:', positions);
    
    const holeCards = gameState.players.map(p => `Player ${p.id}: ${p.holeCards.join('')}`).join('; ');
    console.debug('Formatted hole cards:', holeCards);

    const actions = gameState.logs
      .filter(log => !log.includes('dealt:') && !log.includes('Hand #') && !log.includes('Final pot'))
      .map(log => {
        if (log.includes('folds')) return 'f';
        if (log.includes('checks')) return 'x';
        if (log.includes('calls')) return 'c';
        if (log.includes('bets')) {
          const amount = log.match(/bets (\d+) chips/)?.[1];
          return `b${amount}`;
        }
        if (log.includes('raises on')) {
          const amount = log.match(/raises on (\d+) chips/)?.[1];
          return `r${amount}`;
        }
        return '';
      })
      .filter(Boolean)
      .join(':');
    console.debug('Formatted actions:', actions);

    const handInfo: HandInfo = {
      hand_id: gameState.handId,
      stack_size: gameState.initialStackSize,
      players: gameState.players.map(player => {
        let position = '';
        if (player.id - 1 === gameState.dealerPosition) position = 'D';
        else if (player.id - 1 === gameState.smallBlindPosition) position = 'SB';
        else if (player.id - 1 === gameState.bigBlindPosition) position = 'BB';
        
        console.debug(`Setting position for Player ${player.id}:`, {
          playerId: player.id,
          playerIndex: player.id - 1,
          dealerPos: gameState.dealerPosition,
          sbPos: gameState.smallBlindPosition,
          bbPos: gameState.bigBlindPosition,
          position: position
        });

        return {
          id: player.id,
          cards: player.holeCards.join(''),
          position: position,
          stack: player.stack
        };
      }),
      actions: actions,
      community_cards: gameState.communityCards.join(''),
      stack_info: stackInfo,
      positions: positions,
      hole_cards: holeCards,
      pot: gameState.pot
    };

    console.debug('Request details:', {
      url: 'http://localhost:8000/api/v1/hands',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(handInfo, null, 2)
    });

    const response = await fetch('http://localhost:8000/api/v1/hands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(handInfo)
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorText,
        requestBody: handInfo
      };
      console.error('Backend response error:', errorDetails);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error details:', errorJson);
      } catch (parseError) {
        console.error('Error text is not JSON:', errorText);
      }
      
      throw new Error(`Backend error: ${errorText}`);
    }

    const result = await response.json();
    
    const newState = { ...gameState };

    newState.logs.push(`Hand #${newState.handId} ended`);
    newState.logs.push(`Final pot was ${newState.pot}`);
    
    result.payoffs.forEach((payoff: number, i: number) => {
      newState.players[i].stack = gameState.initialStackSize + payoff;
    });

    newState.winnings = result.payoffs.map((payoff: number, i: number) => {
      return `Player ${i + 1}: ${payoff > 0 ? '+' : ''}${payoff}`;
    }).join('; ');

    newState.evaluationResult = {
      winnings: newState.winnings,
      payoffs: result.payoffs
    };
    console.groupEnd();
    return newState;
  } catch (error: any) {
    console.error('Error sending hand info:', error);
    console.groupEnd();
    throw new Error(`Failed to connect to backend: ${error.message}`);
  }
} 