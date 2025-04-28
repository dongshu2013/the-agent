from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import asyncio
from sqlalchemy.orm import Session

from edge_agent.core.config import settings
from edge_agent.utils.database import DBSessionMiddleware, get_db, SessionLocal
from edge_agent.api.routes import router
from edge_agent.api.tg_routes import router as tg_router
from edge_agent.utils.embeddings import update_all_messages_embeddings, update_tg_messages_embeddings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

# Global variable to store the task
embedding_update_task = None

async def periodic_embedding_update():
    """
    Periodically update embeddings for messages that don't have them yet.
    This runs every 30 minutes.
    """
    while True:
        try:
            logger.info("Starting scheduled embedding update task")
            # Create a new session for this task
            db = SessionLocal()
            try:
                # Update embeddings for regular messages created at least 5 minutes ago
                updated_count = await update_all_messages_embeddings(db, minutes_threshold=5)
                logger.info(f"Scheduled task updated embeddings for {updated_count} regular messages")
                
                # Update embeddings for Telegram messages created at least 5 minutes ago
                tg_updated_count = await update_tg_messages_embeddings(db, minutes_threshold=5)
                logger.info(f"Scheduled task updated embeddings for {tg_updated_count} Telegram messages")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error in scheduled embedding update task: {str(e)}")
        
        # Wait for 30 minutes before running again
        await asyncio.sleep(3 * 60)  # 30 minutes in seconds

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for the FastAPI app.
    This is called when the app starts and stops.
    """
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    
    # Start the periodic embedding update task
    global embedding_update_task
    embedding_update_task = asyncio.create_task(periodic_embedding_update())
    logger.info("Started periodic embedding update task")

    yield

    # Cancel the periodic task when shutting down
    if embedding_update_task:
        logger.info("Cancelling periodic embedding update task")
        embedding_update_task.cancel()
        try:
            await embedding_update_task
        except asyncio.CancelledError:
            logger.info("Periodic embedding update task cancelled")
    
    logger.info(f"Shutting down {settings.PROJECT_NAME}")

app = FastAPI(
    title=settings.PROJECT_NAME, 
    version=settings.VERSION, 
    description=settings.PROJECT_DESCRIPTION,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400, # 24 hours
)

# Add database session middleware
app.add_middleware(DBSessionMiddleware)

# Include routers
app.include_router(router)
app.include_router(tg_router)

# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint.
    """
    return JSONResponse(content={"status": "ok", "version": settings.VERSION})
