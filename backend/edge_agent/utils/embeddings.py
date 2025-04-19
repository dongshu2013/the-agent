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

async def generate_embedding(text: str) -> List[float]:
    """
    Generate an embedding for the given text using OpenAI's embedding API.
    """
    if not text or text.strip() == "":
        logger.warning("Empty text provided for embedding generation, returning empty vector")
        return None

    try:
        response = client.embeddings.create(
            input=text,
            model="intfloat/multilingual-e5-large",
            encoding_format="float"
        )
        embedding = response.data[0].embedding
        return embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        logger.exception("Full exception details:")
        return None

async def update_message_embedding(message: Message, db: Session) -> Message:
    """
    Update a message with its embedding.
    """
    if message.embedding:
        # Skip if embedding already exists
        return message
    
    try:
        # Extract text from message content
        text = extract_text_from_content(message.content)
        
        # Generate embedding
        embedding = await generate_embedding(text)

        # Update message with embedding
        message.embedding = embedding
        db.commit()

        return message
    except Exception as e:
        logger.error(f"Error updating message embedding: {str(e)}")
        db.rollback()
        raise

async def update_all_messages_embeddings(db: Session) -> int:
    """
    Update embeddings for all messages that don't have them yet.
    Returns the number of messages updated.
    """
    messages = db.query(Message).filter(Message.embedding.is_(None)).all()
    updated_count = 0
    
    for message in messages:
        try:
            await update_message_embedding(message, db)
            updated_count += 1
        except Exception as e:
            logger.error(f"Error updating embedding for message {message.id}: {str(e)}")
            continue
    
    return updated_count

async def find_similar_messages(query_text: str, conversation_id: Optional[str] = None, limit: int = 5, db: Session = None) -> List[Message]:
    """
    Find messages similar to the query text using vector similarity search.
    If conversation_id is provided, only search within that conversation.
    """
    # Generate embedding for the query text
    query_embedding = await generate_embedding(query_text)

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
        query += " AND conversation_id = :conversation_id"
        params["conversation_id"] = conversation_id
    
    # Add ordering and limit
    query += """
    ORDER BY distance
    LIMIT :limit
    """

    # Execute the query
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
    
    return messages
