from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from edge_agent.core.config import settings
from edge_agent.models.database import Base

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables if they don't exist"""
    Base.metadata.create_all(bind=engine)
