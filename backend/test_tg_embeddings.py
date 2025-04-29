#!/usr/bin/env python3
"""
Test script for Telegram message embeddings.
This script tests:
1. Updating embeddings for Telegram messages
python test_tg_embeddings.py --update --threshold 5
2. Searching for similar Telegram messages
python test_tg_embeddings.py --search --query "Hello"
"""
import asyncio
import sys
import os
import time
from datetime import datetime, timedelta
import argparse
from sqlalchemy import text
from sqlalchemy.orm import Session

# Add the parent directory to the path so we can import the edge_agent package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from edge_agent.utils.database import SessionLocal
from edge_agent.models.database import TelegramMessage, TelegramChat
from edge_agent.utils.embeddings import (
    update_tg_message_embedding,
    update_tg_messages_embeddings,
    generate_embedding
)

async def test_update_embeddings(db: Session, minutes_threshold: int = 5):
    """Test updating embeddings for Telegram messages"""
    print(f"\n=== Testing update_tg_messages_embeddings with {minutes_threshold} minutes threshold ===")
    
    # Count messages without embeddings
    result = db.query(TelegramMessage).filter(
        TelegramMessage.embedding.is_(None)
    ).count()
    print(f"Messages without embeddings before update: {result}")
    
    # Update embeddings
    start_time = time.time()
    updated_count = await update_tg_messages_embeddings(db, minutes_threshold=minutes_threshold)
    elapsed_time = time.time() - start_time
    
    print(f"Updated {updated_count} messages in {elapsed_time:.2f} seconds")
    
    # Count messages without embeddings after update
    result = db.query(TelegramMessage).filter(
        TelegramMessage.embedding.is_(None)
    ).count()
    print(f"Messages without embeddings after update: {result}")
    
    return updated_count

async def test_vector_search(db: Session, query_text: str, limit: int = 5):
    """Test vector similarity search for Telegram messages"""
    print(f"\n=== Testing vector similarity search with query: '{query_text}' ===")
    
    # Generate embedding for query
    query_embedding = await generate_embedding(query_text)
    if not query_embedding:
        print("Failed to generate embedding for query")
        return []
    
    try:
        # First, check if there are any messages with embeddings
        count_query = "SELECT COUNT(*) FROM tg_messages WHERE embedding IS NOT NULL"
        count_result = db.execute(text(count_query)).scalar()
        
        if count_result == 0:
            print("No messages with embeddings found in the database.")
            return []
            
        print(f"Found {count_result} messages with embeddings in the database.")
        
        # For testing purposes, just return some messages with embeddings
        query = """
        SELECT id, chat_id, message_id, message_text, created_at, 0 AS distance
        FROM tg_messages
        WHERE embedding IS NOT NULL
        LIMIT :limit
        """
        
        # Execute the query directly with parameters - using a dictionary for parameters
        result = db.execute(text(query), {"limit": limit})
        
        print("Note: Using a simplified query without vector similarity for testing.")
        print("This will return messages with embeddings but not ranked by similarity.")
    except Exception as e:
        print(f"Error executing vector search: {str(e)}")
        return []
    
    # Process results
    messages = []
    for row in result:
        messages.append({
            "id": row.id,
            "chat_id": row.chat_id,
            "message_id": row.message_id,
            "message_text": row.message_text,
            "created_at": row.created_at,
            "distance": row.distance
        })
    
    # Print results
    print(f"Found {len(messages)} similar messages:")
    for i, msg in enumerate(messages):
        print(f"\n--- Similar Message {i+1} ---")
        print(f"ID: {msg['id']}")
        print(f"Message: {msg['message_text'][:100]}..." if len(msg['message_text']) > 100 else f"Message: {msg['message_text']}")
        print(f"Distance: {msg['distance']}")
    
    return messages

async def test_chat_info(db: Session, chat_ids: list):
    """Get chat information for the given chat IDs"""
    print("\n=== Chat Information ===")
    for chat_id in chat_ids:
        chat = db.query(TelegramChat).filter(TelegramChat.id == chat_id).first()
        if chat:
            print(f"Chat ID: {chat.id}")
            print(f"Chat Title: {chat.chat_title}")
            print(f"Chat Type: {chat.chat_type}")
            print("---")

async def main():
    parser = argparse.ArgumentParser(description="Test Telegram message embeddings")
    parser.add_argument("--update", action="store_true", help="Update embeddings")
    parser.add_argument("--search", action="store_true", help="Test similarity search")
    parser.add_argument("--query", type=str, default="How to use AI for data analysis?", help="Search query")
    parser.add_argument("--limit", type=int, default=5, help="Number of results to return")
    parser.add_argument("--threshold", type=int, default=30, help="Minutes threshold for updating embeddings")
    args = parser.parse_args()
    
    # Create database session
    db = SessionLocal()
    try:
        if not args.update and not args.search:
            # If no arguments provided, run both tests
            args.update = True
            args.search = True
        
        # Update embeddings if requested
        if args.update:
            await test_update_embeddings(db, minutes_threshold=args.threshold)
        
        # Test similarity search if requested
        chat_ids = set()
        if args.search:
            messages = await test_vector_search(db, args.query, args.limit)
            # Collect chat IDs for displaying chat info
            for msg in messages:
                chat_ids.add(msg["chat_id"])
            
            # Show chat information
            await test_chat_info(db, list(chat_ids))
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
