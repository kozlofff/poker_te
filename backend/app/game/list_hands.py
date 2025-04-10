"""Module for retrieving hand history from the database."""

import logging
from typing import Dict, List, Optional
from fastapi import HTTPException, status

from app.models import HandHistoryEntry

# logs for debug
logger = logging.getLogger(__name__)

def get_recent_hands(connection, limit: int = 5) -> Dict[str, List[Dict]]:
    """Get recent hands from the database."""
    try:
        logger.info(f"Fetching last {limit} hands")
        if not connection:
            logger.error("Database connection not available")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT hand_id, stack, positions, hand1, hand2, hand3, hand4, hand5, hand6, actions, winnings 
            FROM hands 
            ORDER BY id DESC 
            LIMIT %s;
        """, (limit,))
        
        hands = []
        for row in cursor.fetchall():
            hands.append({
                "hand_id": row[0],
                "stack_size": row[1],
                "positions": row[2],
                "hands": [row[i] for i in range(3, 9) if row[i]],
                "actions": row[9],
                "winnings": row[10]
            })
        
        logger.info(f"Retrieved {len(hands)} hands")
        logger.debug(f"Hand IDs retrieved: {[h['hand_id'] for h in hands]}")
        return {"hands": hands}
    except Exception as e:
        logger.error(f"Error fetching hands: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

def get_hand_by_id(connection, hand_id: str) -> HandHistoryEntry:
    """Get a specific hand by ID."""
    try:
        logger.info(f"Fetching hand with ID: {hand_id}")
        if not connection:
            logger.error("Database connection not available")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT hand_id, stack, positions, hand1, hand2, hand3, hand4, hand5, hand6, actions, winnings 
            FROM hands 
            WHERE hand_id = %s;
        """, (hand_id,))
        
        row = cursor.fetchone()
        if not row:
            logger.warning(f"Hand with ID {hand_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hand with ID {hand_id} not found"
            )
            
        result = HandHistoryEntry(
            hand_id=row[0],
            stack_info=f"Stack {row[1]}",
            positions=row[2],
            hands=";".join([row[i] for i in range(3, 9) if row[i]]),
            actions=row[9].split(":") if row[9] else []
        )
        logger.info(f"Successfully retrieved hand {hand_id}")
        logger.debug(f"Hand details: {result}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching hand {hand_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 