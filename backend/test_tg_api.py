"""
Test script for Telegram API endpoints.
This script tests the three Telegram API endpoints:
1. /v1/tg/get_dialogs - Get list of Telegram dialogs
2. /v1/tg/get_messages - Get messages from a specific chat
3. /v1/tg/search_messages - Search messages using vector similarity
"""
import asyncio
import httpx
import json
import os
import argparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_URL = "http://localhost:8000/v1/tg"
API_KEY = os.getenv("TEST_API_KEY")  # Replace with your API key or set in .env file

# Headers for API requests
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

async def test_get_dialogs(chat_title=None):
    """Test the get_dialogs endpoint."""
    print("\n=== Testing Get Dialogs API ===")
    async with httpx.AsyncClient() as client:
        # Test with default parameters or specified chat_title
        if chat_title:
            print(f"Fetching dialogs with title containing '{chat_title}'...")
            response = await client.get(
                f"{API_URL}/get_dialogs?chat_title={chat_title}",
                headers=headers
            )
        else:
            print("Fetching dialogs with default parameters...")
            response = await client.get(
                f"{API_URL}/get_dialogs",
                headers=headers
            )
        
        if response.status_code != 200:
            print(f"Error fetching dialogs: {response.status_code} - {response.text}")
            return None
        
        result = response.json()
        if not result.get("success"):
            print(f"API returned error: {result.get('error')}")
            return None
            
        dialogs = result["data"]["dialogs"]
        total_count = result["data"]["total_count"]
        print(f"Successfully fetched {len(dialogs)} dialogs out of {total_count} total")

        # Test with filters
        if len(dialogs) > 0:
            print("\nFetching dialogs with filters...")
            # Get the title of the first dialog to use as a filter
            sample_title = dialogs[0]["chat_title"]
            filter_title = sample_title[:5]  # Use first 5 chars for partial match
            
            response = await client.get(
                f"{API_URL}/get_dialogs?chat_title={filter_title}&limit=5",
                headers=headers
            )
            
            if response.status_code != 200:
                print(f"Error fetching filtered dialogs: {response.status_code} - {response.text}")
            else:
                filtered_result = response.json()
                filtered_dialogs = filtered_result["data"]["dialogs"]
                print(f"Fetched {len(filtered_dialogs)} dialogs with title containing '{filter_title}'")
        
        # Return the first dialog ID for use in subsequent tests
        return dialogs[0]["id"] if dialogs else None

async def test_get_messages(chat_id, message_text=None):
    """Test the get_messages endpoint."""
    if not chat_id:
        print("\n=== Skipping Get Messages API (no chat ID available) ===")
        return None
        
    print(f"\n=== Testing Get Messages API for chat {chat_id} ===")
    async with httpx.AsyncClient() as client:
        # Test with default parameters or specified message_text
        if message_text:
            print(f"Fetching messages with text containing '{message_text}'...")
            response = await client.get(
                f"{API_URL}/get_messages?chat_id={chat_id}&message_text={message_text}",
                headers=headers
            )
        else:
            print("Fetching messages with default parameters...")
            response = await client.get(
                f"{API_URL}/get_messages?chat_id={chat_id}",
                headers=headers
            )
        
        if response.status_code != 200:
            print(f"Error fetching messages: {response.status_code} - {response.text}")
            return None
        
        result = response.json()
        if not result.get("success"):
            print(f"API returned error: {result.get('error')}")
            return None
            
        messages = result["data"]["messages"]
        total_count = result["data"]["total_count"]
        print(f"Successfully fetched {len(messages)} messages out of {total_count} total")
        
        # Test with filters
        if len(messages) > 0:
            print("\nFetching messages with filters...")
            # Get a sample message to use for filtering
            sample_message = messages[0]
            
            # Test with message text filter if available
            if sample_message.get("message_text"):
                filter_text = sample_message["message_text"][:5]  # Use first 5 chars for partial match
                response = await client.get(
                    f"{API_URL}/get_messages?chat_id={chat_id}&message_text={filter_text}&limit=5",
                    headers=headers
                )
                
                if response.status_code != 200:
                    print(f"Error fetching filtered messages: {response.status_code} - {response.text}")
                else:
                    filtered_result = response.json()
                    filtered_messages = filtered_result["data"]["messages"]
                    print(f"Fetched {len(filtered_messages)} messages with text containing '{filter_text}'")
        
        # Return a sample message text for use in search test
        return messages[0]["message_text"] if messages else None

async def test_search_messages(sample_text):
    """Test the search_messages endpoint."""
    if not sample_text:
        print("\n=== Skipping Search Messages API (no sample text available) ===")
        return
        
    print(f"\n=== Testing Search Messages API ===")
    # Use the provided sample_text directly as the search query
    # If sample_text is a longer message, we can still extract the first word
    if ' ' in sample_text and len(sample_text) > 20:
        search_query = sample_text.split()[0]
    else:
        search_query = sample_text
    
    async with httpx.AsyncClient() as client:
        print(f"Searching messages with query: '{search_query}'...")
        response = await client.get(
            f"{API_URL}/search_messages?query={search_query}&top_k=5",
            headers=headers
        )
        
        if response.status_code != 200:
            print(f"Error searching messages: {response.status_code} - {response.text}")
            return
        
        result = response.json()
        if not result.get("success"):
            print(f"API returned error: {result.get('error')}")
            return
            
        search_results = result["data"]["results"]
        print(f"Found {len(search_results)} matching results")
        
        # Display details of the first result if available
        if len(search_results) > 0:
            first_result = search_results[0]
            chat_info = first_result["chat"]
            message_chunk = first_result["message_chunk"]
            
            print(f"\nFirst result from chat: {chat_info['chat_title']}")
            print(f"Message chunk contains {len(message_chunk)} messages")
            
            # Find and display the matching message
            for msg in message_chunk:
                if msg.get("is_match"):
                    print(f"\nMatching message:")
                    print(f"Text: {msg['message_text'][:100]}")
                    print(f"Similarity score: {msg['similarity']}")
                    break

async def run_tests(chat_title=None, message_text=None, search_query=None):
    """Run all tests in sequence."""
    # Test 1: Get Dialogs
    chat_id = await test_get_dialogs(chat_title)
    
    # Test 2: Get Messages (using chat_id from Test 1)
    sample_text = await test_get_messages(chat_id, message_text)
    
    # Test 3: Search Messages (using specified query or sample_text from Test 2)
    await test_search_messages(search_query or sample_text)
    
    print("\n=== All tests completed ===")

if __name__ == "__main__":
    # 设置命令行参数
    parser = argparse.ArgumentParser(description='Test Telegram API endpoints with specific parameters')
    parser.add_argument('--chat_title', help='Filter dialogs by chat title')
    parser.add_argument('--message_text', help='Filter messages by text content')
    parser.add_argument('--query', help='Search query for vector similarity search')
    # python test_tg_api.py --chat_title="filter chat title"
    # python test_tg_api.py --message_text="filter message text"
    # python test_tg_api.py --query="search query"
    # python test_tg_api.py --chat_title="Test" --message_text="msg" --query="crypto"
    
    args = parser.parse_args()
    
    # 运行测试
    asyncio.run(run_tests(
        chat_title=args.chat_title,
        message_text=args.message_text,
        search_query=args.query
    ))
