from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, BigInteger, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from sqlalchemy.dialects.postgresql import ARRAY, FLOAT
from pgvector.sqlalchemy import Vector

from edge_agent.utils.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=True)
    api_key = Column(String, unique=True, nullable=False, default=generate_uuid)
    api_key_enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    credits = relationship("Credit", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    status = Column(String, default="active", nullable=False)  # "active" or "deleted"

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conversation(id={self.id}, user_id={self.user_id})>"


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False)  # "system", "user", "assistant", or "tooling"
    content = Column(JSON, nullable=False)  # Array of text_message or image_message objects
    embedding = Column(Vector(1024), nullable=True)  # Vector embedding for similarity search
    created_at = Column(DateTime, default=func.now(), nullable=False)
    tool_calls = Column(JSON, nullable=True, default={})
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    tool_call_id = Column(String, nullable=True)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message(id={self.id}, role={self.role})>"


class TelegramChat(Base):
    __tablename__ = "tg_chats"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False)
    chat_id = Column(String, nullable=False)
    chat_type = Column(String, nullable=False)
    chat_title = Column(String, nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)
    is_free = Column(Boolean, default=False, nullable=False)
    subscription_fee = Column(Numeric, default=0, nullable=False)
    last_synced_at = Column(DateTime, default=func.now(), nullable=False)
    status = Column(String, default="watching", nullable=False)  # watching, quiet
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    messages = relationship("TelegramMessage", back_populates="chat", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<TelegramChat(id={self.id}, chat_id={self.chat_id}, chat_title={self.chat_title})>"


class TelegramMessage(Base):
    __tablename__ = "tg_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    chat_id = Column(String, ForeignKey("tg_chats.id"), nullable=False)
    message_id = Column(String, nullable=False)
    message_text = Column(String, nullable=False)
    message_timestamp = Column(BigInteger, nullable=False)
    sender_id = Column(String, nullable=True)
    reply_to_msg_id = Column(String, nullable=True)
    is_pinned = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    sender_username = Column(String, nullable=True)
    sender_firstname = Column(String, nullable=True)
    sender_lastname = Column(String, nullable=True)
    embedding = Column(Vector(1024), nullable=True)  # Vector embedding for similarity search

    # Relationships
    chat = relationship("TelegramChat", back_populates="messages")

    def __repr__(self):
        return f"<TelegramMessage(id={self.id}, message_id={self.message_id})>"


class TelegramUser(Base):
    __tablename__ = "tg_users"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False)
    user_type = Column(String, nullable=False)
    username = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<TelegramUser(id={self.id}, user_id={self.user_id}, username={self.username})>"


class Credit(Base):
    __tablename__ = "credits"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    order_id = Column(String, nullable=True)
    conversation_id = Column(String, nullable=True)
    model = Column(String, nullable=True)
    amount = Column(Numeric(10, 6), nullable=True)
    trans_credits = Column(Numeric(10, 6), default=0, nullable=False)  # Transaction credits
    user_credits = Column(Numeric(10, 6), default=0, nullable=False)  # User credits after transaction
    trans_type = Column(String, default="new_user", nullable=False)  # TransactionType enum value
    created_at = Column(DateTime, default=func.now(), nullable=False)
    expired_at = Column(DateTime, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="credits")
    
    def __repr__(self):
        return f"<Credit(id={self.id}, user_id={self.user_id}, trans_credits={self.trans_credits}, trans_type={self.trans_type})>"
