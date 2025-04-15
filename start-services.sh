#!/bin/bash
set -e

# 环境变量配置
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# 检查部署类型
if [ "$RAILWAY_SERVICE_NAME" = "the-agent-web" ]; then
  echo "Starting frontend service..."
  cd web && npm start
elif [ "$RAILWAY_SERVICE_NAME" = "the-agent-backend" ]; then
  echo "Starting backend service..."
  cd backend && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
else
  echo "Unknown service, starting both with default configuration..."
  # 启动后端
  cd backend && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} &
  BACKEND_PID=$!
  
  cd ..
  # 启动前端
  cd web && npm start &
  FRONTEND_PID=$!
  
  # 捕获 SIGTERM 信号，优雅关闭进程
  trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGTERM SIGINT
  
  # 等待所有子进程结束
  wait
fi 