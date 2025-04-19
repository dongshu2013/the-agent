"""
Utility functions for generating and working with embeddings.
"""
import json
import logging
from typing import List, Optional, Union, Dict, Any

import openai
from openai import OpenAI
from sqlalchemy.orm import Session

from edge_agent.core.config import settings
from edge_agent.models.database import Message

logger = logging.getLogger("embeddings")

# Initialize OpenAI client
client = OpenAI(
    api_key=settings.EMBEDDING_API_KEY,
    base_url=settings.EMBEDDING_API_URL
)
EMBEDDING_MODEL = "intfloat/multilingual-e5-large" # 1024 dimensions

def extract_text_from_content(content: Union[str, List[Dict[str, Any]]]) -> str:
    """
    Extract plain text from message content, which can be either a string or a list of content objects.
    """
    if isinstance(content, str):
        return content
    
    # If content is a JSON string, parse it
    if isinstance(content, str):
        try:
            content = json.loads(content)
        except json.JSONDecodeError:
            return content
    
    # If content is a list of content objects
    text_parts = []
    for item in content:
        if isinstance(item, dict):
            if item.get("type") == "text":
                text_parts.append(item.get("text", ""))
            elif item.get("type") == "image_url":
                # Skip image content for embeddings
                continue
        elif isinstance(item, str):
            text_parts.append(item)
    
    return " ".join(text_parts)

async def generate_embedding(text: str) -> Optional[List[float]]:
    """
    Generate an embedding for the given text using OpenAI's embedding API.
    """
    if not text or text.strip() == "":
        logger.warning("Empty text provided for embedding generation, returning None")
        return None
        
    try:
        response = client.embeddings.create(
            input=text,
            model=EMBEDDING_MODEL,
            encoding_format="float"
        )
        embedding = response.data[0].embedding
        return embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        # Return None instead of a zero vector
        return None

def get_db_session(db: Optional[Session] = None) -> tuple[Session, bool]:
    """
    Get a database session, creating a new one if needed.
    Returns a tuple of (session, created) where created is a boolean
    indicating whether a new session was created.
    """
    if db is not None:
        return db, False
        
    from edge_agent.utils.database import SessionLocal
    return SessionLocal(), True

async def update_message_embedding(message_id: str, db: Session = None) -> Optional[Message]:
    """
    Update a message with its embedding.
    Takes a message ID and optionally a database session.
    If no session is provided, a new one will be created.
    """
    db, session_created = get_db_session(db)
    
    try:
        # Get the message from the database
        message_in_db = db.query(Message).filter(Message.id == message_id).first()
        
        if not message_in_db:
            logger.error(f"Message {message_id} not found in database")
            return None
            
        if message_in_db.embedding is not None:
            # Skip if embedding already exists
            return message_in_db
        
        # Extract text from message content
        text = extract_text_from_content(message_in_db.content)
        
        logger.info(f"Generating embedding for message {message_in_db.id}")
        # Generate embedding
        embedding = await generate_embedding(text)

        # Only update if we got a valid embedding
        if embedding is not None:
            # Update message with embedding
            message_in_db.embedding = embedding
            db.commit()
            logger.info(f"Updated embedding for message {message_in_db.id}")
        else:
            logger.warning(f"No embedding generated for message {message_in_db.id}")

        return message_in_db
    except Exception as e:
        logger.error(f"Error updating message embedding: {str(e)}")
        try:
            db.rollback()
        except:
            pass
        return None
    finally:
        # Close the session if we created it
        if session_created:
            db.close()

async def update_all_messages_embeddings(db: Session = None, minutes_threshold: int = 30) -> int:
    """
    Update embeddings for all messages that don't have them yet and were created
    at least minutes_threshold minutes ago.
    
    Args:
        db: Optional database session
        minutes_threshold: Only process messages created at least this many minutes ago
        
    Returns:
        Number of messages updated
    """
    db, session_created = get_db_session(db)
    
    try:
        # Calculate the cutoff time (current time - threshold)
        from datetime import datetime, timedelta
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes_threshold)
        
        # Get messages without embeddings that were created before the cutoff time
        messages = db.query(Message).filter(
            Message.embedding.is_(None),
            Message.created_at < cutoff_time
        ).all()
        
        logger.info(f"Found {len(messages)} messages without embeddings created before {cutoff_time}")
        updated_count = 0
        
        for message in messages:
            try:
                await update_message_embedding(message.id, db)
                updated_count += 1
            except Exception as e:
                logger.error(f"Error updating embedding for message {message.id}: {str(e)}")
                continue
        
        logger.info(f"Updated embeddings for {updated_count} messages")
        return updated_count
    finally:
        # Close the session if we created it
        if session_created:
            db.close()

async def find_similar_messages(query_text: str, conversation_id: Optional[str] = None, limit: int = 5, db: Session = None) -> List[Message]:
    """
    Find messages similar to the query text using vector similarity search.
    If conversation_id is provided, only search within that conversation.
    """
    db, session_created = get_db_session(db)

    try:
        if not query_text or query_text.strip() == "":
            logger.warning("Empty query text provided for similarity search")
            return []
            
        # Generate embedding for the query text
        query_embedding = await generate_embedding(query_text)
        
        if query_embedding is None:
            logger.error("Failed to generate embedding for search query")
            return []
            
        # Build the query
        query = """
        SELECT id, conversation_id, role, content, created_at, 
               embedding <=> :query_embedding AS distance
        FROM messages
        WHERE embedding IS NOT NULL
        """
        
        params = {
            "query_embedding": query_embedding,
            "limit": limit
        }
        
        # Add conversation filter if provided
        if conversation_id:
            logger.info(f"Filtering search to conversation: {conversation_id}")
            query += " AND conversation_id = :conversation_id"
            params["conversation_id"] = conversation_id
        
        # Add ordering and limit
        query += """
        ORDER BY distance
        LIMIT :limit
        """
        
        # Execute the query
        logger.info(f"Executing vector similarity search with limit: {limit}")
        result = db.execute(query, params)
        
        # Convert the result to Message objects
        messages = []
        for row in result:
            # Create a Message object from the row
            message = Message(
                id=row.id,
                conversation_id=row.conversation_id,
                role=row.role,
                content=row.content,
                created_at=row.created_at
            )
            messages.append(message)
        
        logger.info(f"Found {len(messages)} similar messages")
        return messages
    except Exception as e:
        logger.error(f"Error in vector similarity search: {str(e)}")
        return []
    finally:
        # Close the session if we created it
        if session_created:
            db.close()
