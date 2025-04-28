# Telegram API Design Document

This document outlines the API endpoints for accessing Telegram data stored in the database. These endpoints allow users to retrieve dialogs, messages, and perform vector-based similarity searches on messages.

## Authentication

All endpoints require an `api_key` parameter for authentication. This key is associated with a user in the `users` table.

## Endpoints

### 1. Get Dialogs

Retrieves a list of user dialogs (Telegram chats).

**Endpoint:** `/v1/tg/get_dialogs`

#### Request Parameters

| Parameter | Type    | Required | Default | Description                                                 |
|-----------|---------|----------|---------|-------------------------------------------------------------|
| limit     | integer | No       | 100     | Maximum number of dialogs to return                         |
| offset    | integer | No       | 0       | Number of dialogs to skip                                   |
| chat_title| string  | No       | -       | Filter dialogs by chat title (partial match)                |
| is_public | boolean | No       | -       | Filter dialogs by public status                             |
| is_free   | boolean | No       | -       | Filter dialogs by free status                               |
| status    | string  | No       | -       | Filter dialogs by status (e.g., "watching", "quiet")        |
| sort_by   | string  | No       | "updated_at" | Field to sort by (options: "updated_at", "created_at", "chat_title") |
| sort_order| string  | No       | "desc"  | Sort order (options: "asc", "desc")                         |

#### Response

```json
{
  "success": true,
  "data": {
    "dialogs": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "chat_id": "123456789",
        "chat_type": "supergroup",
        "chat_title": "My Telegram Group",
        "is_public": true,
        "is_free": true,
        "subscription_fee": "0",
        "last_synced_at": "2025-04-27T15:30:45.123Z",
        "status": "watching",
        "created_at": "2025-03-15T10:20:30.456Z",
        "updated_at": "2025-04-27T15:30:45.123Z",
        "message_count": 1250
      }
    ],
    "total_count": 5,
    "limit": 100,
    "offset": 0
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key"
  }
}
```

### 2. Get Messages

Retrieves messages from a specified Telegram chat.

**Endpoint:** `/v1/tg/get_messages`

#### Request Parameters

| Parameter        | Type    | Required | Default | Description                                                 |
|------------------|---------|----------|---------|-------------------------------------------------------------|
| chat_id          | string  | Yes      | -       | ID of the chat to retrieve messages from                    |
| limit            | integer | No       | 100     | Maximum number of messages to return                        |
| offset           | integer | No       | 0       | Number of messages to skip                                  |
| message_text     | string  | No       | -       | Filter messages by text content (partial match)             |
| sender_id        | string  | No       | -       | Filter messages by sender ID                                |
| sender_username  | string  | No       | -       | Filter messages by sender username                          |
| is_pinned        | boolean | No       | -       | Filter messages by pinned status                            |
| start_timestamp  | integer | No       | -       | Filter messages with timestamp >= start_timestamp           |
| end_timestamp    | integer | No       | -       | Filter messages with timestamp <= end_timestamp             |
| sort_by          | string  | No       | "message_timestamp" | Field to sort by (options: "message_timestamp", "created_at") |
| sort_order       | string  | No       | "desc"  | Sort order (options: "asc", "desc")                         |

#### Response

```json
{
  "success": true,
  "data": {
    "chat": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "chat_id": "123456789",
      "chat_title": "My Telegram Group",
      "chat_type": "supergroup",
      "is_public": true,
      "is_free": true
    },
    "messages": [
      {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "message_id": "12345",
        "message_text": "Hello, this is a test message!",
        "message_timestamp": 1714323045,
        "sender_id": "98765",
        "sender_username": "user123",
        "sender_firstname": "John",
        "sender_lastname": "Doe",
        "reply_to_msg_id": null,
        "is_pinned": false,
        "created_at": "2025-04-27T15:30:45.123Z",
        "updated_at": "2025-04-27T15:30:45.123Z"
      }
    ],
    "total_count": 1250,
    "limit": 100,
    "offset": 0
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "CHAT_NOT_FOUND",
    "message": "Chat not found or access denied"
  }
}
```

### 3. Search Messages

Performs a vector similarity search to find messages similar to a query.

**Endpoint:** `/v1/tg/search_messages`

#### Request Parameters

| Parameter      | Type    | Required | Default | Description                                                 |
|----------------|---------|----------|---------|-------------------------------------------------------------|
| query          | string  | Yes      | -       | The search query text                                       |
| chat_id        | string  | No       | -       | Limit search to a specific chat (optional)                  |
| top_k          | integer | No       | 10      | Number of most similar messages to retrieve                 |
| message_range  | integer | No       | 2       | Number of messages to include before and after each match   |
| threshold      | float   | No       | 0.7     | Similarity threshold (0-1, higher is more similar)          |
| is_public      | boolean | No       | -       | Filter by public chats only                                 |
| is_free        | boolean | No       | -       | Filter by free chats only                                   |

#### Response

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "chat": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "chat_id": "123456789",
          "chat_title": "My Telegram Group",
          "chat_type": "supergroup",
          "is_public": true,
          "is_free": true
        },
        "message_chunk": [
          {
            "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
            "message_id": "12344",
            "message_text": "Let's discuss the new feature.",
            "message_timestamp": 1714323040,
            "sender_id": "98765",
            "sender_username": "user123",
            "sender_firstname": "John",
            "sender_lastname": "Doe",
            "is_match": false,
            "similarity": null
          },
          {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "message_id": "12345",
            "message_text": "I think we should implement vector search for our messages.",
            "message_timestamp": 1714323045,
            "sender_id": "98765",
            "sender_username": "user123",
            "sender_firstname": "John",
            "sender_lastname": "Doe",
            "is_match": true,
            "similarity": 0.92
          },
          {
            "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            "message_id": "12346",
            "message_text": "That's a great idea!",
            "message_timestamp": 1714323050,
            "sender_id": "54321",
            "sender_username": "user456",
            "sender_firstname": "Jane",
            "sender_lastname": "Smith",
            "is_match": false,
            "similarity": null
          }
        ]
      }
    ],
    "query_embedding_available": true
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "EMBEDDING_GENERATION_FAILED",
    "message": "Failed to generate embedding for query"
  }
}
```

## Implementation Notes

### Vector Search Implementation

For the `/v1/tg/search_messages` endpoint, the implementation should:

1. Generate an embedding vector for the query text using the same model used for message embeddings
2. Convert the Python embedding list to PostgreSQL array syntax (replace `[...]` with `{...}`)
3. Use the pgvector extension to find similar messages:

```sql
SELECT 
  m.id, 
  m.message_id, 
  m.message_text,
  m.message_timestamp,
  m.sender_id,
  m.sender_username,
  m.sender_firstname,
  m.sender_lastname,
  c.id as chat_id,
  c.chat_title,
  c.chat_type,
  c.is_public,
  c.is_free,
  embedding <=> '{query_embedding}'::vector AS distance
FROM 
  tg_messages m
JOIN
  tg_chats c ON m.chat_id = c.id
WHERE
  m.embedding IS NOT NULL
  [AND c.id = :chat_id]
  [AND c.is_public = :is_public]
  [AND c.is_free = :is_free]
ORDER BY 
  distance
LIMIT :top_k;
```

4. For each matching message, retrieve the surrounding context (messages before and after)
5. Return the results with the matching message marked and its similarity score included

### CORS Headers

All API responses should include the following CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

Additionally, implement an OPTIONS handler for preflight requests.

### Error Handling

All endpoints should return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request (invalid parameters)
- 401: Unauthorized (invalid API key)
- 404: Not Found (chat or resource not found)
- 500: Internal Server Error

Error responses should follow the format shown in the examples above.

### Rate Limiting

Consider implementing rate limiting to prevent abuse:
- Limit requests per API key
- Add appropriate headers to indicate rate limit status
- Return 429 Too Many Requests when limits are exceeded
