import logging
from typing import List
from app.models import HandInfo, HandResult

logger = logging.getLogger(__name__)

def format_hand_result(hand_info: HandInfo, payoffs: List[int]) -> HandResult:
    """Format the hand result with payoffs."""
    try:
        # debug player positions
        logger.debug("Player positions:")
        for player in hand_info.players:
            logger.debug(f"Player {player.id}: position='{player.position}'")

        # formatting stack
        stack_info = f"Stack {hand_info.stack_size}"

        # formatting positions
        try:
            dealer = next(p for p in hand_info.players if p.position == "D")
            sb = next(p for p in hand_info.players if p.position == "SB")
            bb = next(p for p in hand_info.players if p.position == "BB")
            positions = (
                f"Dealer: Player {dealer.id}; "
                f"Player {sb.id} Small blind; "
                f"Player {bb.id} Big blind"
            )
        except StopIteration:
            logger.warning("Could not find positions in player objects, using positions string")
            positions = hand_info.positions

        # formatting hole cards
        hole_cards = "; ".join([f"Player {p.id}: {p.cards}" for p in hand_info.players])

        # formatting actions
        actions = (":".join(hand_info.actions)
                  if isinstance(hand_info.actions, list)
                  else hand_info.actions)

        # formatting community cards
        community_cards = (
            "".join(hand_info.community_cards)
            if isinstance(hand_info.community_cards, list)
            else hand_info.community_cards
        )

        logger.debug(
            "Formatted data:",
            {
                "stack_info": stack_info,
                "positions": positions,
                "hole_cards": hole_cards,
                "actions": actions,
                "community_cards": community_cards,
                "payoffs": payoffs
            }
        )

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