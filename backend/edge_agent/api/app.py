from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from edge_agent.api.routes import router
from edge_agent.core.config import settings
from edge_agent.database import get_db

logger = logging.getLogger("app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    db: Session = next(get_db())
    
    # Yield control to the application
    yield
    
    # Cleanup
    logger.info(f"Shutting down {settings.PROJECT_NAME}")
    db.close()


app = FastAPI(
    title=settings.PROJECT_NAME, 
    version=settings.VERSION, 
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)

# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    return JSONResponse(content={"status": "ok", "version": settings.VERSION})
