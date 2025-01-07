from time import time

from sqlalchemy import BigInteger, Column, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from ai_companion.database import Base


class UserPersona(Base):
    __tablename__ = "user_personas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    version = Column(Integer, nullable=False)
    persona = Column(Text, nullable=False)
    last_processed_message_id = Column(Integer, nullable=False)
    messages_processed = Column(Integer, nullable=False)
    created_at = Column(BigInteger, default=lambda: int(time()))

    # Relationship with user
    user = relationship("User", back_populates="personas")
