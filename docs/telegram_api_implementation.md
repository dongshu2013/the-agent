# Telegram API Implementation Design

This document describes the implementation design for Telegram API endpoints, including route setup, request handling, database queries, and response formatting.

## Technology Stack

- FastAPI: Web framework
- SQLAlchemy: ORM and database interaction
- pgvector: PostgreSQL vector search extension
- Pydantic: Request and response model validation

## Common Components

### 1. Authentication Middleware

All API requests will be authenticated using an API key. Implement a middleware to verify the API key in the request:

```python
async def verify_api_key(request: Request, call_next):
    """Middleware to verify API key"""
    # Get API key from headers or query parameters
    api_key = request.headers.get("X-API-Key") or request.query_params.get("api_key")
    
    if not api_key:
        return JSONResponse(
            status_code=401,
            content={"success": False, "error": {"code": "UNAUTHORIZED", "message": "API key is required"}}
        )
    
    # Verify API key
    db = get_db()
    user = db.query(User).filter(User.api_key == api_key, User.api_key_enabled == True).first()
    
    if not user:
        return JSONResponse(
            status_code=401,
            content={"success": False, "error": {"code": "UNAUTHORIZED", "message": "Invalid API key"}}
        )
    
    # Add user ID to request state
    request.state.user_id = user.id
    
    # Continue processing the request
    response = await call_next(request)
    return response
```

### 2. CORS Middleware

Add CORS middleware to allow cross-origin requests:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
)
```

### 3. Request and Response Models

Use Pydantic models to define the data structures for requests and responses:

```python
# Base response model
class BaseResponse(BaseModel):
    success: bool
    
# Error response model
class ErrorResponse(BaseResponse):
    success: bool = False
    error: Dict[str, str]
    
# Pagination information
class PaginationInfo(BaseModel):
    total_count: int
    limit: int
    offset: int
```

## API Endpoints Implementation

### 1. Get Dialogs

#### Route Definition

```python
@router.get("/v1/tg/get_dialogs", response_model=DialogsResponse)
async def get_dialogs(
    limit: int = 100,
    offset: int = 0,
    chat_title: Optional[str] = None,
    is_public: Optional[bool] = None,
    is_free: Optional[bool] = None,
    status: Optional[str] = None,
    sort_by: str = "updated_at",
    sort_order: str = "desc",
    request: Request = Depends(),
):
    """Get a list of user's Telegram dialogs"""
    user_id = request.state.user_id
    
    try:
        db = get_db()
        query = db.query(TelegramChat).filter(TelegramChat.user_id == user_id)
        
        # Apply filters
        if chat_title:
            query = query.filter(TelegramChat.chat_title.ilike(f"%{chat_title}%"))
        if is_public is not None:
            query = query.filter(TelegramChat.is_public == is_public)
        if is_free is not None:
            query = query.filter(TelegramChat.is_free == is_free)
        if status:
            query = query.filter(TelegramChat.status == status)
        
        # Get total count
        total_count = query.count()
        
        # Apply sorting
        if sort_by in ["updated_at", "created_at", "chat_title"]:
            sort_column = getattr(TelegramChat, sort_by)
            if sort_order.lower() == "asc":
                query = query.order_by(sort_column.asc())
            else:
                query = query.order_by(sort_column.desc())
        
        # Apply pagination
        query = query.offset(offset).limit(limit)
        
        # Execute query
        chats = query.all()
        
        # Get message count for each chat
        chat_ids = [chat.id for chat in chats]
        message_counts = db.query(
            TelegramMessage.chat_id, 
            func.count(TelegramMessage.id).label("count")
        ).filter(
            TelegramMessage.chat_id.in_(chat_ids)
        ).group_by(
            TelegramMessage.chat_id
        ).all()
        
        message_count_dict = {chat_id: count for chat_id, count in message_counts}
        
        # Build response
        dialogs = []
        for chat in chats:
            dialog = chat.__dict__.copy()
            dialog.pop("_sa_instance_state", None)
            dialog["message_count"] = message_count_dict.get(chat.id, 0)
            dialogs.append(dialog)
        
        return {
            "success": True,
            "data": {
                "dialogs": dialogs,
                "total_count": total_count,
                "limit": limit,
                "offset": offset
            }
        }
    except Exception as e:
        logger.error(f"Error getting dialogs: {str(e)}")
        return {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An error occurred while retrieving dialogs"
            }
        }
```

### 2. Get Messages

#### Route Definition

```python
@router.get("/v1/tg/get_messages", response_model=MessagesResponse)
async def get_messages(
    chat_id: str,
    limit: int = 100,
    offset: int = 0,
    message_text: Optional[str] = None,
    sender_id: Optional[str] = None,
    sender_username: Optional[str] = None,
    is_pinned: Optional[bool] = None,
    start_timestamp: Optional[int] = None,
    end_timestamp: Optional[int] = None,
    sort_by: str = "message_timestamp",
    sort_order: str = "desc",
    request: Request = Depends(),
):
    """Get messages from a specified chat"""
    user_id = request.state.user_id
    
    try:
        db = get_db()
        
        # First verify that the user has permission to access this chat
        chat = db.query(TelegramChat).filter(
            TelegramChat.id == chat_id,
            TelegramChat.user_id == user_id
        ).first()
        
        if not chat:
            return {
                "success": False,
                "error": {
                    "code": "CHAT_NOT_FOUND",
                    "message": "Chat not found or access denied"
                }
            }
        
        # Query messages
        query = db.query(TelegramMessage).filter(TelegramMessage.chat_id == chat_id)
        
        # Apply filters
        if message_text:
            query = query.filter(TelegramMessage.message_text.ilike(f"%{message_text}%"))
        if sender_id:
            query = query.filter(TelegramMessage.sender_id == sender_id)
        if sender_username:
            query = query.filter(TelegramMessage.sender_username.ilike(f"%{sender_username}%"))
        if is_pinned is not None:
            query = query.filter(TelegramMessage.is_pinned == is_pinned)
        if start_timestamp:
            query = query.filter(TelegramMessage.message_timestamp >= start_timestamp)
        if end_timestamp:
            query = query.filter(TelegramMessage.message_timestamp <= end_timestamp)
        
        # Get total count
        total_count = query.count()
        
        # Apply sorting
        if sort_by in ["message_timestamp", "created_at"]:
            sort_column = getattr(TelegramMessage, sort_by)
            if sort_order.lower() == "asc":
                query = query.order_by(sort_column.asc())
            else:
                query = query.order_by(sort_column.desc())
        
        # Apply pagination
        query = query.offset(offset).limit(limit)
        
        # Execute query
        messages = query.all()
        
        # Build response
        messages_list = []
        for message in messages:
            msg_dict = message.__dict__.copy()
            msg_dict.pop("_sa_instance_state", None)
            # Remove embedding vector as it's too large and not needed in API response
            msg_dict.pop("embedding", None)
            messages_list.append(msg_dict)
        
        chat_info = chat.__dict__.copy()
        chat_info.pop("_sa_instance_state", None)
        
        return {
            "success": True,
            "data": {
                "chat": chat_info,
                "messages": messages_list,
                "total_count": total_count,
                "limit": limit,
                "offset": offset
            }
        }
    except Exception as e:
        logger.error(f"Error getting messages: {str(e)}")
        return {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An error occurred while retrieving messages"
            }
        }
```

### 3. Search Messages

#### Route Definition

```python
@router.get("/v1/tg/search_messages", response_model=SearchMessagesResponse)
async def search_messages(
    query: str,
    chat_id: Optional[str] = None,
    top_k: int = 10,
    message_range: int = 2,
    threshold: float = 0.7,
    is_public: Optional[bool] = None,
    is_free: Optional[bool] = None,
    request: Request = Depends(),
):
    """Search messages based on vector similarity"""
    user_id = request.state.user_id
    
    try:
        # Generate embedding for the query
        embedding = await generate_embedding(query)
        
        if not embedding:
            return {
                "success": False,
                "error": {
                    "code": "EMBEDDING_GENERATION_FAILED",
                    "message": "Failed to generate embedding for query"
                }
            }
        
        # Convert Python list to PostgreSQL array syntax
        embedding_str = str(embedding).replace('[', '{').replace(']', '}')
        
        db = get_db()
        
        # Build base query
        sql_query = """
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
                m.embedding <=> :embedding::vector AS distance
            FROM 
                tg_messages m
            JOIN
                tg_chats c ON m.chat_id = c.id
            WHERE
                m.embedding IS NOT NULL
                AND c.user_id = :user_id
        """
        
        params = {
            "embedding": embedding_str,
            "user_id": user_id
        }
        
        # Add optional filters
        if chat_id:
            sql_query += " AND c.id = :chat_id"
            params["chat_id"] = chat_id
        
        if is_public is not None:
            sql_query += " AND c.is_public = :is_public"
            params["is_public"] = is_public
        
        if is_free is not None:
            sql_query += " AND c.is_free = :is_free"
            params["is_free"] = is_free
        
        # Add sorting and limit
        sql_query += """
            ORDER BY 
                distance
            LIMIT :top_k
        """
        params["top_k"] = top_k
        
        # Execute query
        result = db.execute(text(sql_query), params).fetchall()
        
        # Filter results below threshold
        filtered_results = [r for r in result if r.distance <= threshold]
        
        # Get context for matching messages
        results_with_context = []
        for match in filtered_results:
            # Get chat info for the matching message
            chat = db.query(TelegramChat).filter(TelegramChat.id == match.chat_id).first()
            
            if not chat:
                continue
            
            # Get messages before and after the matching message
            context_messages = db.query(TelegramMessage).filter(
                TelegramMessage.chat_id == match.chat_id,
                TelegramMessage.message_timestamp >= match.message_timestamp - (message_range * 60),  # Assume ~1 minute between messages
                TelegramMessage.message_timestamp <= match.message_timestamp + (message_range * 60)
            ).order_by(TelegramMessage.message_timestamp.asc()).all()
            
            # Build message chunk
            message_chunk = []
            for msg in context_messages:
                msg_dict = msg.__dict__.copy()
                msg_dict.pop("_sa_instance_state", None)
                msg_dict.pop("embedding", None)
                
                # Mark if this is the matching message
                is_match = msg.id == match.id
                msg_dict["is_match"] = is_match
                msg_dict["similarity"] = 1 - match.distance if is_match else None
                
                message_chunk.append(msg_dict)
            
            # Build chat info
            chat_info = chat.__dict__.copy()
            chat_info.pop("_sa_instance_state", None)
            
            results_with_context.append({
                "chat": chat_info,
                "message_chunk": message_chunk
            })
        
        return {
            "success": True,
            "data": {
                "results": results_with_context,
                "query_embedding_available": True
            }
        }
    except Exception as e:
        logger.error(f"Error searching messages: {str(e)}")
        return {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": f"An error occurred while searching messages: {str(e)}"
            }
        }
```

## Data Models

To support the above API implementations, the following SQLAlchemy models need to be defined:

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True, nullable=True)
    api_key = Column(String, unique=True)
    api_key_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TelegramChat(Base):
    __tablename__ = "tg_chats"
    
    id = Column(String, primary_key=True)
    user_id = Column(String)
    chat_id = Column(String)
    chat_type = Column(String)
    chat_title = Column(String)
    is_public = Column(Boolean, default=False)
    is_free = Column(Boolean, default=False)
    subscription_fee = Column(Numeric, default=0)
    last_synced_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="watching")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('user_id', 'chat_id', name='uq_user_chat'),
    )

class TelegramMessage(Base):
    __tablename__ = "tg_messages"
    
    id = Column(String, primary_key=True)
    chat_id = Column(String, ForeignKey("tg_chats.id"))
    message_id = Column(String)
    message_text = Column(String)
    message_timestamp = Column(BigInteger)
    sender_id = Column(String, nullable=True)
    reply_to_msg_id = Column(String, nullable=True)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sender_username = Column(String, nullable=True)
    sender_firstname = Column(String, nullable=True)
    sender_lastname = Column(String, nullable=True)
    embedding = Column(Vector(1024), nullable=True)
    
    chat = relationship("TelegramChat", back_populates="messages")
    
    __table_args__ = (
        UniqueConstraint('chat_id', 'message_id', name='uq_chat_message'),
    )
```

## Route Registration

Add the above routes to the FastAPI application:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
)

# Add authentication middleware
@app.middleware("http")
async def verify_api_key(request: Request, call_next):
    # Middleware implementation...

# Register routes
from .routes import router
app.include_router(router)
```

## Deployment Considerations

1. Ensure PostgreSQL database has the pgvector extension installed
2. Ensure the tg_messages table has an embedding column of type vector(1024)
3. Create appropriate indexes to improve query performance
4. Implement periodic tasks to update message embeddings
5. Consider adding caching mechanisms to improve performance for frequent queries
6. Implement rate limiting to prevent API abuse
