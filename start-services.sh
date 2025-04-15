#!/bin/bash
# Railway部署启动脚本 - 启动前端和后端服务

# 设置工作目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 检查是否设置了必要的环境变量
if [ -z "$PORT" ]; then
  export PORT=8080
  echo "PORT环境变量未设置，使用默认值: $PORT"
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "警告: OPENAI_API_KEY环境变量未设置。后端API可能无法工作。"
fi

# 确保健康检查脚本可执行
chmod +x "$SCRIPT_DIR/health-check.sh"

# 准备前端环境变量文件
echo "准备前端环境变量..."
cat > web/.env.production << EOL
NEXT_PUBLIC_API_URL=${API_URL:-"http://localhost:8080"}
EOL

# 启动后端服务（在后台）
echo "启动后端服务..."
cd "$SCRIPT_DIR/backend"
# 设置PYTHONPATH以确保正确导入
export PYTHONPATH=$SCRIPT_DIR

# 启动后端
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8080 &
BACKEND_PID=$!

# 等待后端启动并执行健康检查
echo "等待后端服务启动..."
"$SCRIPT_DIR/health-check.sh" "http://localhost:8080" || { 
  echo "错误: 后端健康检查失败，终止部署"; 
  kill $BACKEND_PID; 
  exit 1; 
}

echo "后端服务已启动并通过健康检查，PID: $BACKEND_PID"

# 启动前端服务
echo "启动前端服务..."
cd "$SCRIPT_DIR/web"
# 使用分配的PORT环境变量启动前端
PORT=$PORT yarn start

# 如果前端退出，也关闭后端
kill $BACKEND_PID 