from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from edge_agent.core.config import settings

logger = logging.getLogger("database")

# Fix the DATABASE_URL if it uses postgres:// instead of postgresql://
database_url = settings.DATABASE_URL
if database_url.startswith('postgres://'):
    logger.info("Converting postgres:// to postgresql:// in DATABASE_URL")
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

# Create SQLAlchemy engine
engine = create_engine(database_url)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

class DBSessionMiddleware(BaseHTTPMiddleware):
    """
    Middleware that attaches a database session to each request.
    The session is available as request.state.db and is automatically
    closed when the request is complete.
    """
    async def dispatch(self, request: Request, call_next):
        # Create a new database session
        db = SessionLocal()
        # Attach it to the request state
        request.state.db = db
        
        try:
            # Process the request
            response = await call_next(request)
            return response
        except Exception as e:
            # Make sure to close the session in case of error
            logger.error(f"Error in request: {str(e)}")
            raise e
        finally:
            # Always close the session when done
            db.close()

def get_db(request: Request) -> Session:
    """
    Helper function to get the database session from the request.
    """
    return request.state.db

def get_db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
