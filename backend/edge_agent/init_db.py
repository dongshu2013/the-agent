import logging
from edge_agent.utils.database import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info("Creating initial data")
    init_db()
    logger.info("Initial data created")

if __name__ == "__main__":
    main() 