"""Test module for the poker game API endpoints."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_hand():
    """Test creating a new poker hand."""

    hand_info = {
        "hand_id": "test-hand-001",
        "stack_size": 1000,
        "players": [
            {
                "id": 1,
                "cards": "AhKh",
                "position": "D",
                "stack": 1000
            },
            {
                "id": 2,
                "cards": "QsJs",
                "position": "SB",
                "stack": 980
            },
            {
                "id": 3,
                "cards": "TdTc",
                "position": "BB",
                "stack": 960
            }
        ],
        "actions": "c:f:c",
        "community_cards": "7h8h9h",  # flop cards
        "stack_info": "Stack 1000",
        "positions": "Dealer: Player 1; Player 2 Small blind; Player 3 Big blind",
        "hole_cards": "Player 1: AhKh; Player 2: QsJs; Player 3: TdTc",
        "pot": 100
    }
    response = client.post("/api/v1/hands", json=hand_info)

    assert response.status_code == 201
    data = response.json()

    assert data["hand_id"] == hand_info["hand_id"]
    assert data["stack_size"] == hand_info["stack_size"]
    assert len(data["players"]) == 3
    assert data["pot"] == hand_info["pot"]
    
    dealer = next(p for p in data["players"] if p["position"] == "D")
    assert dealer["id"] == 1
    sb = next(p for p in data["players"] if p["position"] == "SB")
    assert sb["id"] == 2
    bb = next(p for p in data["players"] if p["position"] == "BB")
    assert bb["id"] == 3

    # payoffs
    assert "payoffs" in data
    assert len(data["payoffs"]) == 3
    assert any(payoff > 0 for payoff in data["payoffs"])

def test_list_hands():
    """Test listing poker hands."""
    response = client.get("/api/v1/hands")
    assert response.status_code == 200
    data = response.json()
    assert "hands" in data
    assert isinstance(data["hands"], list)

def test_get_specific_hand():
    """Test getting a specific hand by ID."""
    # creating hand
    hand_info = {
        "hand_id": "test-hand-002",
        "stack_size": 1000,
        "players": [
            {
                "id": 1,
                "cards": "AhKh",
                "position": "D",
                "stack": 1000
            },
            {
                "id": 2,
                "cards": "QsJs",
                "position": "SB",
                "stack": 900
            },
            {
                "id": 3,
                "cards": "Ks8h",
                "position": "SB",
                "stack": 900
            }
        ],
        "actions": "f:c",
        "community_cards": "",
        "stack_info": "Stack 1000",
        "positions": "Dealer: Player 1; Player 2 Small blind; Player 3 Big blind",
        "hole_cards": "Player 1: AhKh; Player 2: QsJs; Player 3: Ks8h",
        "pot": 100
    }
    create_response = client.post("/api/v1/hands", json=hand_info)
    assert create_response.status_code == 201

    # getting hand
    hand_id = hand_info["hand_id"]
    response = client.get(f"/api/v1/hands/{hand_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["hand_id"] == hand_id
    assert isinstance(data["actions"], list)

def test_create_hand_invalid_data():
    """Test creating a hand with invalid data."""
    # miss smth
    invalid_hand = {
        "hand_id": "test-hand-003",
        "stack_size": 1000
        # miss players and other
    }
    response = client.post("/api/v1/hands", json=invalid_hand)
    assert response.status_code == 422  # unprocessable entity

def test_get_nonexistent_hand():
    """Test getting a hand that doesn't exist."""
    response = client.get("/api/v1/hands/nonexistent-id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Hand with ID nonexistent-id not found" 