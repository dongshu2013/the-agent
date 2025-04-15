from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

# 将相对导入改为绝对导入
from backend.routes.chat import router as chat_router
from backend.config import settings

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title="AI Agent Backend",
    description="AI Agent的后端API服务，处理聊天和工具调用",
    version="0.1.0",
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(chat_router, prefix="/v1/chat", tags=["chat"])

# 健康检查
@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}

# 应用信息
@app.get("/", tags=["info"])
async def get_info():
    return {
        "app": "AI Agent Backend",
        "version": "0.1.0",
        "endpoints": {
            "chat": "/v1/chat/completion",
        }
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True) 