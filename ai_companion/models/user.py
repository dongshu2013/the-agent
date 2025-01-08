from datetime import datetime

from sqlalchemy import BigInteger, Column, Integer, String
from sqlalchemy.orm import relationship

from ai_companion.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    tg_user_id = Column(String, unique=True, index=True)
    username = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    balance = Column(Integer, default=0)
    created_at = Column(BigInteger, default=lambda: int(datetime.now().timestamp()))
    last_active = Column(BigInteger, default=lambda: int(datetime.now().timestamp()))

    messages = relationship("Message", back_populates="user")
    user_personas = relationship("UserPersona", back_populates="user")
