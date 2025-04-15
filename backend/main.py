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
    description="AI Agent提供聊天和工具调用功能的后端API",
    version="0.1.0",
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # 从配置中读取允许的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含路由
app.include_router(chat_router, prefix="/v1/chat")

# 错误处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"未处理的异常: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "服务器内部错误", "detail": str(exc)},
    )

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# 根路径
@app.get("/")
async def root():
    return {
        "name": "AI Agent API",
        "version": "0.1.0",
        "docs_url": "/docs",
    }

# 直接运行服务器的入口点
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.DEBUG
    ) 