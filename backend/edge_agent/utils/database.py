from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import logging

from edge_agent.core.config import settings

logger = logging.getLogger("database")

# Create SQLAlchemy engine
engine = create_engine(settings.DATABASE_URL)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

class Database:
    """
    Database class to maintain a global database connection.
    """
    _instance = None
    _session = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance._session = None
        return cls._instance
    
    def init(self):
        """
        Initialize the database connection.
        This should be called in the lifespan before the app starts.
        """
        if self._session is None:
            logger.info("Initializing database connection")
            self._session = SessionLocal()
        return self._session
    
    def close(self):
        """
        Close the database connection.
        This should be called in the lifespan after the app stops.
        """
        if self._session is not None:
            logger.info("Closing database connection")
            self._session.close()
            self._session = None

    def get_new_session(self) -> Session:
        """
        Get a new database session.
        """
        return SessionLocal()
    
    @property
    def session(self) -> Session:
        """
        Get the database session.
        """
        if self._session is None:
            self.init()
        return self._session

# Create a global instance of the Database class
db = Database()
