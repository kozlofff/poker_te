from abc import ABC, abstractmethod
from typing import List, Optional
from app.models import HandInfo, HandResult

class HandRepository(ABC):
    """Repository interface for managing poker hands."""
    
    @abstractmethod
    def save(self, hand: HandInfo) -> HandInfo:
        """Save a hand and return the saved entity."""
        pass
    
    @abstractmethod
    def find_one_by_id(self, hand_id: str) -> Optional[HandInfo]:
        """Find a hand by its ID."""
        pass
    
    @abstractmethod
    def find_all(self) -> List[HandInfo]:
        """Find all hands."""
        pass
    
    @abstractmethod
    def save_result(self, hand_id: str, result: HandResult) -> HandResult:
        """Save the result of a hand."""
        pass

class InMemoryHandRepository(HandRepository):
    """In-memory implementation of HandRepository."""
    
    def __init__(self):
        self._hands: dict[str, HandInfo] = {}
        self._results: dict[str, HandResult] = {}
    
    def save(self, hand: HandInfo) -> HandInfo:
        self._hands[hand.hand_id] = hand
        return hand
    
    def find_one_by_id(self, hand_id: str) -> Optional[HandInfo]:
        return self._hands.get(hand_id)
    
    def find_all(self) -> List[HandInfo]:
        return list(self._hands.values())
    
    def save_result(self, hand_id: str, result: HandResult) -> HandResult:
        self._results[hand_id] = result
        return result 