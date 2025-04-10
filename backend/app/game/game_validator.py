"""Module for validating poker game rules and actions."""

import logging
from typing import List, Dict, Set
from app.models import HandInfo, PlayerInfo

# logs for debug
logger = logging.getLogger(__name__)

# consts
MIN_PLAYERS = 2
MAX_PLAYERS = 6
VALID_ACTIONS = {'fold', 'check', 'call', 'raise'}
VALID_POSITIONS = {'BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'}
VALID_CARDS = {
    '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'
}
VALID_SUITS = {'h', 'd', 'c', 's'}

class GameValidationError(Exception):
    """Custom exception for game validation errors."""
    pass

def validate_hand_info(hand_info: HandInfo) -> None:
    """Validate complete hand information."""
    try:
        # basic validation
        if not hand_info.hand_id:
            raise GameValidationError("Hand ID is required")
        
        if not hand_info.players:
            raise GameValidationError("Players list cannot be empty")
            
        if not (MIN_PLAYERS <= len(hand_info.players) <= MAX_PLAYERS):
            raise GameValidationError(f"Number of players must be between {MIN_PLAYERS} and {MAX_PLAYERS}")
            
        if hand_info.stack_size <= 0:
            raise GameValidationError("Stack size must be positive")
            
        # validation of players
        validate_players(hand_info.players)
        
        # validation of positions
        validate_positions(hand_info.players)
        
        # validation of cards
        validate_cards(hand_info)
        
        # validation of actions first
        validate_actions(hand_info)
        
        # then validation of betting rounds
        validate_betting_rounds(hand_info)
        
    except GameValidationError as e:
        logger.error(f"Validation error in hand {hand_info.hand_id}: {str(e)}")
        raise

def validate_players(players: List[PlayerInfo]) -> None:
    """Validate player information."""
    player_ids = set()
    
    for player in players:
        if player.id in player_ids:
            raise GameValidationError(f"Duplicate player ID: {player.id}")
        player_ids.add(player.id)
        
        if player.stack < 0:
            raise GameValidationError(f"Player {player.id} has negative stack")

def validate_positions(players: List[PlayerInfo]) -> None:
    """Validate player positions."""
    positions = set()
    
    for player in players:
        if not player.position:
            raise GameValidationError(f"Player {player.id} has no position")
            
        if player.position not in VALID_POSITIONS:
            raise GameValidationError(f"Invalid position '{player.position}' for player {player.id}")
            
        if player.position in positions:
            raise GameValidationError(f"Duplicate position: {player.position}")
            
        positions.add(player.position)
        
    # validate required positions based on player count
    if len(players) >= 2:
        required_positions = {'BTN', 'BB'}
        if not required_positions.issubset(positions):
            raise GameValidationError(f"Missing required positions: {required_positions - positions}")

def validate_cards(hand_info: HandInfo) -> None:
    """Validate player cards and community cards."""
    used_cards = set()
    
    # validate hole cards
    for player in hand_info.players:
        if not player.cards or len(player.cards) != 4:  # two cards, each with rank and suit
            raise GameValidationError(f"Player {player.id} has invalid number of cards")
            
        card1, card2 = player.cards[:2], player.cards[2:]
        for card in [card1, card2]:
            if len(card) != 2:
                raise GameValidationError(f"Invalid card format: {card}")
                
            rank, suit = card[0], card[1].lower()
            if rank not in VALID_CARDS:
                raise GameValidationError(f"Invalid card rank: {rank}")
            if suit not in VALID_SUITS:
                raise GameValidationError(f"Invalid card suit: {suit}")
                
            card_key = f"{rank}{suit}"
            if card_key in used_cards:
                raise GameValidationError(f"Duplicate card: {card_key}")
            used_cards.add(card_key)
    
    # validate community cards
    if hand_info.community_cards:
        cards = hand_info.community_cards.split()
        if len(cards) not in [0, 3, 4, 5]:  # empty, flop, turn, or river
            raise GameValidationError("Invalid number of community cards")
            
        for card in cards:
            if len(card) != 2:
                raise GameValidationError(f"Invalid community card format: {card}")
                
            rank, suit = card[0], card[1].lower()
            if rank not in VALID_CARDS:
                raise GameValidationError(f"Invalid community card rank: {rank}")
            if suit not in VALID_SUITS:
                raise GameValidationError(f"Invalid community card suit: {suit}")
                
            card_key = f"{rank}{suit}"
            if card_key in used_cards:
                raise GameValidationError(f"Duplicate community card: {card_key}")
            used_cards.add(card_key)

def validate_actions(hand_info: HandInfo) -> None:
    """Validate player actions."""
    if not hand_info.actions:
        raise GameValidationError("Actions list cannot be empty")
        
    actions = hand_info.actions.split()
    current_round = []
    active_players = {player.id for player in hand_info.players}  # use actual player IDs
    folded_players = set()  # track folded players separately
    last_raise = 0
    
    for action in actions:
        parts = action.split(':')
        if len(parts) != 2:
            raise GameValidationError(f"Invalid action format: {action}")
            
        player_id, act = int(parts[0]), parts[1]
        
        # check if player has folded first
        if player_id in folded_players:
            raise GameValidationError(f"Action from folded player: {player_id}")
            
        # validate player ID
        if player_id not in active_players:
            raise GameValidationError(f"Action from invalid player: {player_id}")
            
        # validate action type
        action_type = act.split(',')[0] if ',' in act else act
        if action_type not in VALID_ACTIONS:
            raise GameValidationError(f"Invalid action type: {action_type}")
            
        # handle fold
        if action_type == 'fold':
            folded_players.add(player_id)
            active_players.remove(player_id)
            
        # check if this is the last active player
        if len(active_players) == 1:
            # if theres only one player leftthey cant act anymore
            if player_id == next(iter(active_players)) and len(current_round) > 0:
                raise GameValidationError(f"Action from last remaining player: {player_id}")
            
        # handle raise
        if action_type == 'raise':
            try:
                raise_amount = int(act.split(',')[1])
                if raise_amount <= last_raise:
                    raise GameValidationError(f"Invalid raise amount: {raise_amount}")
                last_raise = raise_amount
            except (IndexError, ValueError):
                raise GameValidationError(f"Invalid raise format: {act}")
        
        current_round.append(action)
        
        # check if round is complete
        if len(current_round) >= len(active_players):
            round_players = {int(a.split(':')[0]) for a in current_round}
            if round_players == active_players:
                current_round = []
                last_raise = 0  # reset raise amount for new round

def validate_betting_rounds(hand_info: HandInfo) -> None:
    """Validate betting rounds structure."""
    if not hand_info.actions:
        return
        
    actions = hand_info.actions.split()
    rounds = []
    current_round = []
    active_players = {player.id for player in hand_info.players}  # use actual player IDs
    folded_players = set()  # track folded players separately
    
    for action in actions:
        player_id = int(action.split(':')[0])
        act = action.split(':')[1]
        
        # check if player has folded
        if player_id in folded_players:
            raise GameValidationError(f"Action from folded player: {player_id}")
        
        current_round.append(action)
        
        # handle fold
        if act == 'fold':
            folded_players.add(player_id)
            active_players.remove(player_id)
            
        # check if round is complete
        if len(current_round) >= len(active_players):
            # check if all active players have acted
            round_players = {int(a.split(':')[0]) for a in current_round}
            if round_players == active_players:
                rounds.append(current_round)
                current_round = []
    
    # validate number of rounds
    if len(rounds) > 4:
        raise GameValidationError("Too many betting rounds")
        
    # validate community cards match betting rounds
    if hand_info.community_cards:
        comm_cards = hand_info.community_cards.split()
        expected_cards = {
            1: 3,  # Flop
            2: 4,  # Turn
            3: 5   # River
        }
        if len(rounds) > 1 and len(comm_cards) != expected_cards.get(len(rounds) - 1, 0):
            raise GameValidationError("Community cards don't match betting rounds") 