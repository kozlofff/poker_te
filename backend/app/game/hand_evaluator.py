"""Module for evaluating poker hands."""

import logging
from app.models import HandInfo, HandResult
from app.game.hand_formatter import format_hand_result
from app.game.payoff_calculator import (
    calculate_player_contributions,
    process_actions,
    calculate_payoffs
)

# logs for debug
logger = logging.getLogger(__name__)

def evaluate_hand(hand_info: HandInfo) -> HandResult:
    """Evaluate a poker hand and calculate payoffs."""
    try:
        logger.info(f"Evaluating hand {hand_info.hand_id}")
        
        # calculate blinds and player count
        small_blind = 20
        big_blind = 40
        player_count = len(hand_info.players)
        logger.info(f"Game setup - Players: {player_count}, Small blind: {small_blind}, Big blind: {big_blind}")
        
        # track player contributions
        player_contributions = calculate_player_contributions(hand_info)
        logger.debug(f"Player contributions: {player_contributions}")

        # calculate total pot
        pot = sum(player_contributions.values())
        logger.info(f"Total pot size: {pot}")

        # process actions and find winner
        active_players = process_actions(hand_info.actions, player_count)
        logger.debug(f"Active players after processing actions: {active_players}")

        # calculate payoffs based on active players
        payoffs = calculate_payoffs(active_players, player_count, pot, player_contributions, hand_info)
        
        # format the result
        result = format_hand_result(hand_info, payoffs)
        
        return result

    except Exception as e:
        logger.error(f"Error evaluating hand {hand_info.hand_id}: {str(e)}", exc_info=True)
        raise 