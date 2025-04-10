from typing import List
from ..repositories.hand_repository import HandRepository
from app.models import HandInfo, HandResult
from app.game.hand_evaluator import evaluate_hand
from app.game.game_validator import validate_hand_info, GameValidationError

class HandService:
    """Service for managing poker hands."""
    
    def __init__(self, hand_repository: HandRepository):
        self._repository = hand_repository
    
    def create_hand(self, hand_info: HandInfo) -> HandInfo:
        """Create a new hand and save it."""
        # checking hand info
        try:
            validate_hand_info(hand_info)
        except GameValidationError as e:
            raise ValueError(str(e))
            
        # saving hand
        return self._repository.save(hand_info)
    
    def get_hand(self, hand_id: str) -> HandInfo:
        """Get a hand by its ID."""
        hand = self._repository.find_one_by_id(hand_id)
        if not hand:
            raise ValueError(f"Hand not found: {hand_id}")
        return hand
    
    def get_all_hands(self) -> List[HandInfo]:
        """Get all hands."""
        return self._repository.find_all()
    
    def evaluate_and_save_result(self, hand_id: str) -> HandResult:
        """Evaluate a hand and save its result."""
        # getting hand
        hand = self.get_hand(hand_id)
        
        # validating before evalu
        try:
            validate_hand_info(hand)
        except GameValidationError as e:
            raise ValueError(f"Invalid hand state: {str(e)}")
        
        # evaluation
        result = evaluate_hand(hand)
        
        # saving and returning
        return self._repository.save_result(hand_id, result) 