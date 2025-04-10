"""Tests for poker game validation logic."""

import pytest
from app.models import HandInfo, PlayerInfo
from app.game.game_validator import validate_hand_info, GameValidationError

def test_valid_hand():
    """Test a completely valid poker hand."""
    hand_info = HandInfo(
        hand_id="test_hand_1",
        stack_size=1000,
        players=[
            PlayerInfo(id=1, position="BTN", cards="AhKh", stack=950),
            PlayerInfo(id=2, position="SB", cards="2d2c", stack=975),
            PlayerInfo(id=3, position="BB", cards="JsQd", stack=950)
        ],
        actions="1:raise,50 2:call 3:call 1:check 2:check 3:check",
        community_cards="7h 8h 9h",
        pot=150,
        stack_info="",
        positions="",
        hole_cards=""
    )
    
    # This should not raise any exceptions
    validate_hand_info(hand_info)

def test_invalid_player_count():
    """Test validation with too few players."""
    hand_info = HandInfo(
        hand_id="test_hand_2",
        stack_size=1000,
        players=[
            PlayerInfo(id=1, position="BTN", cards="AhKh", stack=950),
        ],
        actions="1:check",
        community_cards="",
        pot=0,
        stack_info="",
        positions="",
        hole_cards=""
    )
    
    with pytest.raises(GameValidationError, match="Number of players must be between 2 and 6"):
        validate_hand_info(hand_info)

def test_invalid_position():
    """Test validation with invalid position."""
    hand_info = HandInfo(
        hand_id="test_hand_3",
        stack_size=1000,
        players=[
            PlayerInfo(id=1, position="INVALID", cards="AhKh", stack=950),
            PlayerInfo(id=2, position="BB", cards="2d2c", stack=975),
        ],
        actions="1:check 2:check",
        community_cards="",
        pot=0,
        stack_info="",
        positions="",
        hole_cards=""
    )
    
    with pytest.raises(GameValidationError, match="Invalid position 'INVALID'"):
        validate_hand_info(hand_info)

def test_duplicate_cards():
    """Test validation with duplicate cards."""
    hand_info = HandInfo(
        hand_id="test_hand_4",
        stack_size=1000,
        players=[
            PlayerInfo(id=1, position="BTN", cards="AhKh", stack=950),
            PlayerInfo(id=2, position="BB", cards="AhQc", stack=975),  # Duplicate Ah
        ],
        actions="1:check 2:check",
        community_cards="",
        pot=0,
        stack_info="",
        positions="",
        hole_cards=""
    )
    
    with pytest.raises(GameValidationError, match="Duplicate card: Ah"):
        validate_hand_info(hand_info)

def test_invalid_betting_sequence():
    """Test validation with invalid betting sequence."""
    hand_info = HandInfo(
        hand_id="test_hand_5",
        stack_size=1000,
        players=[
            PlayerInfo(id=1, position="BTN", cards="AhKh", stack=950),
            PlayerInfo(id=2, position="SB", cards="2d2c", stack=975),
            PlayerInfo(id=3, position="BB", cards="JsQd", stack=950)
        ],
        actions="1:raise,50 2:fold 3:fold 1:check",  # Invalid: checking after everyone folded
        community_cards="",
        pot=150,
        stack_info="",
        positions="",
        hole_cards=""
    )
    
    with pytest.raises(GameValidationError, match="Action from last remaining player: 1"):
        validate_hand_info(hand_info)

def test_invalid_community_cards():
    """Test validation with wrong number of community cards."""
    hand_info = HandInfo(
        hand_id="test_hand_6",
        stack_size=1000,
        players=[
            PlayerInfo(id=1, position="BTN", cards="AhKh", stack=950),
            PlayerInfo(id=2, position="SB", cards="2d2c", stack=975),
            PlayerInfo(id=3, position="BB", cards="JsQd", stack=950)
        ],
        actions="1:call 2:call 3:check",
        community_cards="7h 8h",  # Invalid: Flop should have 3 cards
        pot=150,
        stack_info="",
        positions="",
        hole_cards=""
    )
    
    with pytest.raises(GameValidationError, match="Invalid number of community cards"):
        validate_hand_info(hand_info)

def test_invalid_raise_amount():
    """Test validation with invalid raise amount."""
    hand_info = HandInfo(
        hand_id="test_hand_7",
        stack_size=1000,
        players=[
            PlayerInfo(id=1, position="BTN", cards="AhKh", stack=950),
            PlayerInfo(id=2, position="SB", cards="2d2c", stack=975),
            PlayerInfo(id=3, position="BB", cards="JsQd", stack=950)
        ],
        actions="1:raise,100 2:raise,50",  # Invalid: Second raise is smaller than first
        community_cards="",
        pot=150,
        stack_info="",
        positions="",
        hole_cards=""
    )
    
    with pytest.raises(GameValidationError, match="Invalid raise amount"):
        validate_hand_info(hand_info)

def test_missing_required_positions():
    """Test validation with missing required positions."""
    hand_info = HandInfo(
        hand_id="test_hand_8",
        stack_size=1000,
        players=[
            PlayerInfo(id=1, position="UTG", cards="AhKh", stack=950),
            PlayerInfo(id=2, position="MP", cards="2d2c", stack=975),
        ],
        actions="1:check 2:check",
        community_cards="",
        pot=0,
        stack_info="",
        positions="",
        hole_cards=""
    )
    
    with pytest.raises(GameValidationError, match="Missing required positions"):
        validate_hand_info(hand_info) 