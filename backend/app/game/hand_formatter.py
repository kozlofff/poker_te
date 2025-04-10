"""Module for formatting poker hand results."""

import logging
from typing import List

from app.models import HandInfo, HandResult

# logs for debug
logger = logging.getLogger(__name__)

def format_hand_result(hand_info: HandInfo, payoffs: List[int]) -> HandResult:
    """Format the hand result with payoffs."""
    try:
        # log player positions for debug
        logger.debug("Player positions:")
        for player in hand_info.players:
            logger.debug(f"Player {player.id}: position='{player.position}'")

        # format stack info
        stack_info = f"Stack {hand_info.stack_size}"

        # format positions
        positions = format_positions(hand_info)

        # format hole cards
        hole_cards = format_hole_cards(hand_info)

        # format actions
        actions = format_actions(hand_info)

        # format community cards
        community_cards = format_community_cards(hand_info)

        # We'll remove the winner calculation since it's not part of HandResult
        return HandResult(
            hand_id=hand_info.hand_id,
            stack_size=hand_info.stack_size,
            players=hand_info.players,
            actions=actions,
            community_cards=community_cards,
            stack_info=stack_info,
            positions=positions,
            hole_cards=hole_cards,
            pot=hand_info.pot,
            payoffs=payoffs
        )
    except Exception as e:
        logger.error(f"Error in format_hand_result: {str(e)}", exc_info=True)
        raise

def format_positions(hand_info: HandInfo) -> str:
    """Format player positions."""
    try:
        dealer = next(p for p in hand_info.players if p.position == "D")
        sb = next(p for p in hand_info.players if p.position == "SB")
        bb = next(p for p in hand_info.players if p.position == "BB")
        return (
            f"Dealer: Player {dealer.id}; "
            f"Player {sb.id} Small blind; "
            f"Player {bb.id} Big blind"
        )
    except StopIteration:
        logger.warning("Could not find positions in player objects, using positions string")
        return hand_info.positions

def format_hole_cards(hand_info: HandInfo) -> str:
    """Format hole cards for each player."""
    return "; ".join([f"Player {p.id}: {p.cards}" for p in hand_info.players])

def format_actions(hand_info: HandInfo) -> str:
    """Format action sequence."""
    return (":".join(hand_info.actions)
            if isinstance(hand_info.actions, list)
            else hand_info.actions)

def format_community_cards(hand_info: HandInfo) -> str:
    """Format community cards."""
    return ("".join(hand_info.community_cards)
            if isinstance(hand_info.community_cards, list)
            else hand_info.community_cards) 