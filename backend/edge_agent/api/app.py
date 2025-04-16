from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from edge_agent.api.routes import router
from edge_agent.core.config import settings
from edge_agent.utils.database import get_db, init_db

logger = logging.getLogger("app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    
    # Initialize database
    init_db()
    logger.info("Database initialized")
    
    # Connect to database
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
    allow_origins=["*"],  # 开发环境允许所有源
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # 预检请求缓存24小时
)

# Include routers
app.include_router(router)

# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    return JSONResponse(content={"status": "ok", "version": settings.VERSION})
