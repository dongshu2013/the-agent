from datetime import datetime

from sqlalchemy import BigInteger, Boolean, Column, Integer, Text
from sqlalchemy.orm import relationship

from ai_companion.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False, unique=True)
    description = Column(Text, nullable=False)
    system_prompt = Column(Text, nullable=False)
    enable_persona = Column(Boolean, default=False)
    created_at = Column(BigInteger, default=lambda: int(datetime.now().timestamp()))

    # Use string reference for relationships to avoid circular imports
    messages = relationship("Message", back_populates="agent", lazy="dynamic")
    user_personas = relationship("UserPersona", back_populates="agent", lazy="dynamic")
