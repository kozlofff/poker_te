import logging

def setup_logging():
    """Configure logging for the application."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('poker_api.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__) 