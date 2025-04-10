"""Data models for the poker game application."""

from dataclasses import dataclass, field
from typing import List


@dataclass
class PlayerInfo:
    """Player information in a poker hand."""
    id: int
    cards: str
    position: str
    stack: int


@dataclass
class HandInfo:
    """Information about a poker hand."""
    hand_id: str
    stack_size: int
    players: List[PlayerInfo]
    actions: str
    community_cards: str
    stack_info: str
    positions: str
    hole_cards: str
    pot: int


@dataclass
class HandResult:
    """Result of a poker hand after evaluation."""
    hand_id: str
    stack_size: int
    players: List[PlayerInfo]
    actions: str
    community_cards: str
    stack_info: str
    positions: str
    hole_cards: str
    pot: int
    payoffs: List[int] = field(default_factory=list)


@dataclass
class HandHistoryEntry:
    """Entry in the hand history log."""
    hand_id: str
    stack_info: str
    positions: str
    hands: str
    actions: List[str]