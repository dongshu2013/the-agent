from datetime import datetime

from sqlalchemy import BigInteger, Column, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from ai_companion.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    agent_id = Column(Integer, ForeignKey("agents.id"))
    user_message = Column(Text, nullable=False)
    assistant_message = Column(Text, nullable=False)
    created_at = Column(BigInteger, default=lambda: int(datetime.now().timestamp()))

    # Relationship with user and agent
    user = relationship("User", back_populates="messages")
    agent = relationship("Agent", back_populates="messages")
