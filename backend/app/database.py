"""Database connection and configuration module."""

import psycopg2
from psycopg2.extensions import connection
from typing import Optional, Any


def get_db_connection() -> Optional[connection]:
    """
    Create and return a database connection.

    Returns:
        Optional[connection]: Database connection object if successful,
                            None otherwise.
    """
    try:
        conn = psycopg2.connect(
            user="postgres",
            password="postgres",
            host="db",
            port="5432",
            database="poker"
        )
        print("Successfully connected to PostgreSQL database")
        return conn
    except Exception as error:
        print(f"Error while connecting to PostgreSQL: {error}")
        return None


def init_db(conn: connection) -> None:
    """
    Initialize database tables if they don't exist.

    Args:
        conn (connection): Database connection object.
    """
    try:
        cursor = conn.cursor()
        create_table_query = """
            CREATE TABLE IF NOT EXISTS hands (
                id SERIAL PRIMARY KEY,
                hand_id VARCHAR(255),
                stack INTEGER,
                positions VARCHAR(60),
                hand1 VARCHAR(5),
                hand2 VARCHAR(5),
                hand3 VARCHAR(5),
                hand4 VARCHAR(5),
                hand5 VARCHAR(5),
                hand6 VARCHAR(5),
                actions VARCHAR(400),
                winnings VARCHAR(100)
            )
        """
        cursor.execute(create_table_query)
        conn.commit()
        print("Table 'hands' is ready to use")
    except Exception as error:
        print(f"Error initializing database: {error}")
    finally:
        cursor.close()


def save_evaluated_hand(connection: connection, hand_result: Any) -> bool:
    """
    Save an evaluated poker hand to the database.

    Args:
        connection (connection): Database connection object.
        hand_result (Any): Hand result object containing game data.

    Returns:
        bool: True if save was successful, False otherwise.
    """
    try:
        cursor = connection.cursor()

        # extracting hands
        hands = [""] * 6
        for i, player in enumerate(hand_result.players):
            if i < 6:  # ensure not exceed the number of hand columns
                hands[i] = player.cards

        # formatting payoffs
        formatted_winnings = "; ".join([
            f"Player {i + 1}: {'+' + str(payoff) if payoff > 0 else str(payoff)}"
            for i, payoff in enumerate(hand_result.payoffs)
        ])

        # inserting to db query
        insert_query = """
            INSERT INTO hands (
                hand_id, stack, positions, hand1, hand2, hand3,
                hand4, hand5, hand6, actions, winnings
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        # executing query
        cursor.execute(insert_query, (
            hand_result.hand_id,
            hand_result.stack_size,
            hand_result.positions,
            hands[0], hands[1], hands[2],
            hands[3], hands[4], hands[5],
            hand_result.actions,
            formatted_winnings
        ))

        connection.commit()
        return True
    except Exception as error:
        print(f"Error while saving hand to database: {error}")
        return False
    finally:
        cursor.close() 