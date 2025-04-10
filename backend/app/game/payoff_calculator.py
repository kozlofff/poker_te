"""Module for calculating poker hand payoffs."""

import logging
from typing import List, Set, Dict

from app.models import HandInfo
from app.game.hand_ranker import evaluate_player_hand, parse_community_cards, get_hand_ranks

# adding logs for debug
logger = logging.getLogger(__name__)

def calculate_player_contributions(hand_info: HandInfo) -> Dict[int, int]:
    """Calculate how much each player contributed to the pot."""
    return {
        i: hand_info.stack_size - player.stack
        for i, player in enumerate(hand_info.players)
    }

def process_actions(actions: List[str], player_count: int) -> Set[int]:
    """Process actions and return set of active players."""
    active_players = set(range(player_count))
    current_pos = 0 
    
    for action in actions:
        if action == 'f':
            player_to_remove = current_pos % player_count
            if player_to_remove in active_players:  # checking player is still active
                active_players.remove(player_to_remove)
                logger.debug(f"Player {player_to_remove} folded")
        current_pos += 1
    
    return active_players

def calculate_payoffs(
    active_players: Set[int],
    player_count: int,
    pot: int,
    player_contributions: Dict[int, int],
    hand_info: HandInfo
) -> List[int]:
    """Calculate payoffs for all players."""
    payoffs = [0] * player_count

    # if everyone folded
    if len(active_players) == 1:
        winner_idx = list(active_players)[0]
        logger.info(f"Single winner (by fold) - Player {winner_idx}")
        for i in range(player_count):
            if i == winner_idx:
                payoffs[i] = pot - player_contributions[i]
            else:
                payoffs[i] = -player_contributions[i]
    else:
        # few players on showdown
        winners = evaluate_showdown(active_players, hand_info)
        
        # splitting pot
        split_amount = pot // len(winners)
        remainder = pot % len(winners)

        # Calculate payoffs
        for i in range(player_count):
            if i in winners:
                payoffs[i] = split_amount - player_contributions[i]
                if remainder > 0:
                    payoffs[i] += 1
                    remainder -= 1
            else:
                payoffs[i] = -player_contributions[i]

    logger.debug(f"Final payoffs: {payoffs}")
    return payoffs

def evaluate_showdown(active_players: Set[int], hand_info: HandInfo) -> List[int]:
    """Evaluate hands at showdown and return list of winners."""
    community_cards = parse_community_cards(hand_info.community_cards)
    
    best_hand_rank = -1
    best_kickers = []
    winners = []
    
    for player_idx in active_players:
        player = hand_info.players[player_idx]
        hole_cards = [player.cards[0:2], player.cards[2:4]]
        
        # getting all card ranks and evaluate hand
        rank_values_list = get_hand_ranks(hole_cards, community_cards)
        hand_rank, hand_value = evaluate_player_hand(rank_values_list)
        
        # comparing with current best hand
        if hand_rank > best_hand_rank:
            best_hand_rank = hand_rank
            best_kickers = hand_value
            winners = [player_idx]
        elif hand_rank == best_hand_rank:
            # comparing kickers
            for i in range(len(hand_value)):
                if hand_value[i] > best_kickers[i]:
                    best_kickers = hand_value
                    winners = [player_idx]
                    break
                elif hand_value[i] < best_kickers[i]:
                    break
                elif i == len(hand_value) - 1:  # kickers are equal
                    winners.append(player_idx)
    
    return winners 