from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from sqlalchemy.orm import Session

from edge_agent.core.config import settings
from edge_agent.utils.database import DBSessionMiddleware, db
from edge_agent.api.routes import router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for the FastAPI app.
    This is called when the app starts and stops.
    """
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")

    yield

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

# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint.
    """
    return JSONResponse(content={"status": "ok", "version": settings.VERSION})
