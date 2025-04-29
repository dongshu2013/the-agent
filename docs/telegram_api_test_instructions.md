# Telegram API Testing Instructions

This document provides instructions for testing the Telegram API endpoints using the `test_tg_api.py` script.

## Prerequisites

Before running the tests, ensure you have:

1. The FastAPI server running locally on port 8000
2. A valid API key stored in your `.env` file as `TEST_API_KEY`
3. Existing Telegram chat data in your database
4. Python dependencies installed: `httpx`, `asyncio`, `dotenv`

## Test Script Overview

The test script (`test_tg_api.py`) tests all three Telegram API endpoints:

1. **Get Dialogs API** (`/v1/tg/get_dialogs`)
   - Tests retrieving the list of Telegram chats
   - Tests filtering by chat title

2. **Get Messages API** (`/v1/tg/get_messages`)
   - Tests retrieving messages from a specific chat
   - Tests filtering messages by text content

3. **Search Messages API** (`/v1/tg/search_messages`)
   - Tests vector similarity search using a sample message text
   - Verifies that matching messages are returned with similarity scores

## Running the Tests

To run the tests, follow these steps:

1. Start your FastAPI server:
   ```bash
   cd backend
   uvicorn edge_agent.api.app:app --reload
   ```

2. In a separate terminal, run the test script:
   ```bash
   cd backend
   python test_tg_api.py
   ```

3. The script will run all tests in sequence and display the results in the console.

## Test Flow

The tests are designed to run in sequence, with each test depending on the results of the previous test:

1. First, the script tests the Get Dialogs API and retrieves a chat ID
2. Using that chat ID, it then tests the Get Messages API and retrieves a sample message text
3. Finally, it uses the sample message text to test the Search Messages API

If any test fails, subsequent tests that depend on it will be skipped.

## Expected Output

A successful test run should produce output similar to this:

```
=== Testing Get Dialogs API ===
Fetching dialogs with default parameters...
Successfully fetched 5 dialogs out of 5 total

Fetching dialogs with filters...
Fetched 2 dialogs with title containing 'Teleg'

=== Testing Get Messages API for chat 550e8400-e29b-41d4-a716-446655440000 ===
Fetching messages with default parameters...
Successfully fetched 100 messages out of 1250 total

Fetching messages with filters...
Fetched 15 messages with text containing 'Hello'

=== Testing Search Messages API ===
Searching messages with query: 'Hello'...
Found 3 matching results

First result from chat: My Telegram Group
Message chunk contains 5 messages

Matching message:
Text: Hello everyone, I'm excited to announce our new project!...
Similarity score: 0.92

=== All tests completed ===
```

## Troubleshooting

If you encounter errors during testing:

1. **Authentication errors (401)**: Verify your API key in the `.env` file
2. **Not Found errors (404)**: Ensure you have Telegram data in your database
3. **Server errors (500)**: Check the server logs for details
4. **Vector search errors**: Ensure the pgvector extension is properly installed and embeddings are generated for messages

## Vector Search Implementation Note

The vector search test is particularly important as it verifies that:

1. The embedding generation works correctly
2. The PostgreSQL array syntax conversion is handled properly (replacing `[...]` with `{...}`)
3. The pgvector extension is correctly querying for similar messages
4. The context messages (before and after the match) are properly retrieved

If the vector search test fails while other tests pass, check the implementation of the vector conversion and search query in the `search_messages` endpoint.
