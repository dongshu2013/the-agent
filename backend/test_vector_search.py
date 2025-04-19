"""
Test script for vector similarity search functionality.
This script tests the similarity search endpoint.
"""
import asyncio
import httpx
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_URL = "http://localhost:8000/v1"
API_KEY = os.getenv("TEST_API_KEY")  # Replace with your API key or set in .env file

# Headers for API requests
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

async def test_vector_search():
    """Test the vector similarity search functionality."""
    async with httpx.AsyncClient() as client:
        # Step 1: Get a list of conversations
        print("Fetching conversations...")
        response = await client.get(
            f"{API_URL}/conversation/list",
            headers=headers
        )
        
        if response.status_code != 200:
            print(f"Error fetching conversations: {response.text}")
            return
        
        conversations = response.json()
        if not conversations:
            print("No conversations found. Please create a conversation first.")
            return
        
        # Use the first conversation for testing
        conversation_id = conversations[0]["id"]
        print(f"Using conversation: {conversation_id}")
        
        # Step 2: Test similarity search with a query
        search_query = "How is NLP used in modern AI systems?"
        print(f"Testing similarity search with query: {search_query}")
        
        response = await client.post(
            f"{API_URL}/message/search",
            headers=headers,
            json={
                "message": search_query,
                "conversation_id": conversation_id,
                "k": 3
            }
        )
        
        if response.status_code != 200:
            print(f"Error in similarity search: {response.text}")
            return
        
        similar_messages = response.json()
        print(f"Found {len(similar_messages)} similar messages:")
        
        for i, msg in enumerate(similar_messages):
            print(f"\n--- Similar Message {i+1} ---")
            print(f"Role: {msg['role']}")
            print(f"Distance: {msg.get('distance', 'N/A')}")
            
            # Format content based on type
            content = msg['content']
            if isinstance(content, list):
                for item in content:
                    if isinstance(item, dict) and item.get('type') == 'text':
                        print(f"Content: {item.get('text', '')[:100]}...")
            else:
                print(f"Content: {str(content)[:100]}...")

if __name__ == "__main__":
    asyncio.run(test_vector_search())
