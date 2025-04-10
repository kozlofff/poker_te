"""Module for evaluating poker hand rankings."""

import logging
from typing import List, Tuple, Dict

# logs for debug
logger = logging.getLogger(__name__)

# values of card rakns
RANK_VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

def evaluate_player_hand(rank_values_list: List[int]) -> Tuple[int, List[int]]:
    """Evaluate a player's hand and return (hand_rank, hand_value)."""
    # counting occurenes of ranks
    rank_counts = {}
    for rank in rank_values_list:
        rank_counts[rank] = rank_counts.get(rank, 0) + 1
    
    # finding best hand
    hand_rank = 0
    hand_value = []
    
    # checking for three of a kind
    trips = [rank for rank, count in rank_counts.items() if count == 3]
    if trips:
        hand_rank = 3
        hand_value = [max(trips)]
        # adding kickers
        kickers = sorted([r for r in rank_values_list if r != hand_value[0]], reverse=True)
        hand_value.extend(kickers[:2])
    
    # checking for pairs
    pairs = [rank for rank, count in rank_counts.items() if count == 2]
    if pairs and hand_rank < 2:
        hand_rank = 1 if len(pairs) == 1 else 2
        hand_value = sorted(pairs, reverse=True)
        # adding kickers
        kickers = sorted([r for r in rank_values_list if r not in pairs], reverse=True)
        hand_value.extend(kickers[:5-len(pairs)*2])
    
    # if no pairs or trips, use high card
    if not hand_value:
        hand_value = sorted(rank_values_list, reverse=True)[:5]
    
    return hand_rank, hand_value

def parse_community_cards(community_cards: List[str]) -> List[str]:
    """Parse community cards into individual cards."""
    parsed_cards = []
    comm_cards_str = "".join(community_cards)
    for i in range(0, len(comm_cards_str), 2):
        parsed_cards.append(comm_cards_str[i:i+2])
    return parsed_cards

def get_hand_ranks(hole_cards: List[str], community_cards: List[str]) -> List[int]:
    """Get numeric values for all ranks in a hand."""
    all_ranks = [card[0] for card in hole_cards]
    all_ranks.extend([card[0] for card in community_cards])
    return [RANK_VALUES[rank] for rank in all_ranks]

def compare_hands(hand1: Tuple[int, List[int]], hand2: Tuple[int, List[int]]) -> int:
    """Compare two hands and return 1 if hand1 wins, -1 if hand2 wins, 0 if tie."""
    rank1, value1 = hand1
    rank2, value2 = hand2
    
    if rank1 > rank2:
        return 1
    elif rank1 < rank2:
        return -1
    
    # compare kickers
    for v1, v2 in zip(value1, value2):
        if v1 > v2:
            return 1
        elif v1 < v2:
            return -1
    
    return 0  # tie 