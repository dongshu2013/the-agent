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

if [ -z "$DATABASE_URL" ]; then
  echo "警告: DATABASE_URL环境变量未设置。数据库连接将不可用。"
fi

# 确保健康检查脚本可执行
chmod +x "$SCRIPT_DIR/health-check.sh"

# 准备前端环境变量文件
echo "准备前端环境变量..."
mkdir -p web
cat > web/.env.production << EOL
NEXT_PUBLIC_API_URL=${API_URL:-"http://localhost:8080"}
DATABASE_URL=${DATABASE_URL}
FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
EOL

# 启动FastAPI后端
echo "启动后端API服务..."
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 3001 &
BACKEND_PID=$!
cd ..

# 设置前端服务的端口
export FRONTEND_PORT=${PORT}

# 启动Nginx代理服务器
echo "配置Nginx代理..."
cat > nginx.conf << EOL
worker_processes 1;
events { worker_connections 1024; }
http {
    sendfile on;
    
    server {
        listen ${PORT};
        
        # 前端路由
        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
        }
        
        # 后端API路由
        location /v1/ {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
        }
        
        # 健康检查端点
        location /health {
            proxy_pass http://localhost:3001/health;
        }
    }
}
EOL

# 启动前端服务
echo "启动前端服务..."
cd web
npm run start &
FRONTEND_PID=$!
cd ..

# 使用Docker启动Nginx
echo "启动Nginx代理服务器..."
docker run --name nginx-proxy -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro -p ${PORT}:${PORT} -d nginx

# 等待所有进程
echo "服务已启动. 按Ctrl+C停止..."
wait $BACKEND_PID $FRONTEND_PID 