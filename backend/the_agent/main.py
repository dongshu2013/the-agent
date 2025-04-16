from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import uvicorn
import os

from .routes.chat import router as chat_router
from .config import settings

# 配置日志
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("backend")

# 创建FastAPI应用
app = FastAPI(
    title="AI Agent API",
    description="AI Agent provides a backend API for chat and tool calling",
    version="0.1.0",
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # read allowed domains from config
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routes
app.include_router(chat_router, prefix="/v1/chat")

# error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "server internal error", "detail": str(exc)},
    )

# health check
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# root path
@app.get("/")
async def root():
    return {
        "name": "AI Agent API",
        "version": "0.1.0",
        "docs_url": "/docs",
    }

# entry point to run the server directly
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.DEBUG
    ) 