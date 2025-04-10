"""Main FastAPI application module for the poker game."""

import logging
from typing import List

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.models import HandHistoryEntry, HandInfo, HandResult
from app.game.hand_evaluator import evaluate_hand
from app.game.list_hands import get_recent_hands, get_hand_by_id
from app.database import get_db_connection, init_db, save_evaluated_hand


# setting loggin in console
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('poker_api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# initialize db
connection = get_db_connection()

# was it successfull or not
if not connection:
    logger.warning(
        "Failed to establish database connection. Some features may be limited."
    )

# initing tables if needed
if connection:
    try:
        init_db(connection)
    except Exception as e:
        logger.warning(f"Failed to initialize database tables: {e}")

API_VERSION = "v1"
app = FastAPI()

# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

@app.post("/api/v1/hands", status_code=status.HTTP_201_CREATED)
async def create_hand(hand_info: HandInfo) -> HandResult:
    """Create a new poker hand and evaluate it"""
    try:
        logger.info(f"Received new hand request - Hand ID: {hand_info.hand_id}")
        
        result = evaluate_hand(hand_info)
        
        # saving hand
        if connection:
            try:
                save_evaluated_hand(connection, result)
                logger.info(f"Hand {hand_info.hand_id} saved to database")
            except Exception as e:
                logger.warning(f"Failed to save hand to database: {e}")
                pass

        return result

    except Exception as e:
        logger.error(f"Error processing hand {hand_info.hand_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/api/v1/hands")
async def list_hands(limit: int = 5):
    """List recent poker hands"""
    return get_recent_hands(connection, limit)

@app.get("/api/v1/hands/{hand_id}", response_model=HandHistoryEntry)
async def get_hand(hand_id: str) -> HandHistoryEntry:
    """Get a specific poker hand by ID"""
    return get_hand_by_id(connection, hand_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 