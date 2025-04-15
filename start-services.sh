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
mkdir -p web
cat > web/.env.production << EOL
NEXT_PUBLIC_API_URL=${API_URL:-"http://localhost:8080"}
EOL

# 使用内联Python脚本作为后端API
echo "创建简单的Python后端API..."
cat > simple_backend.py << 'EOL'
#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import ssl
import urllib.request
import urllib.error
import urllib.parse
import logging
from datetime import datetime

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('simple-backend')

# 获取API密钥
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
if not OPENAI_API_KEY:
    logger.warning('OPENAI_API_KEY环境变量未设置，API调用将失败')

# 配置OpenAI API
OPENAI_API_URL = os.environ.get('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions')

class SimpleHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_headers()
    
    def do_GET(self):
        if self.path == '/health':
            self._set_headers()
            self.wfile.write(json.dumps({'status': 'healthy', 'timestamp': datetime.now().isoformat()}).encode())
        elif self.path == '/':
            self._set_headers(content_type='text/html')
            self.wfile.write(b'<html><body><h1>Simple Backend API</h1><p>API is running</p></body></html>')
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def do_POST(self):
        if self.path == '/v1/chat/completion':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode())
            
            logger.info(f'收到聊天请求: {request_data}')
            
            try:
                # 调用OpenAI API
                if OPENAI_API_KEY:
                    # 准备请求
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {OPENAI_API_KEY}'
                    }
                    
                    # 构建请求数据
                    openai_data = {
                        'model': request_data.get('model', 'gpt-3.5-turbo'),
                        'messages': request_data.get('messages', []),
                        'temperature': request_data.get('temperature', 0.7),
                        'max_tokens': request_data.get('max_tokens', 2000)
                    }
                    
                    # 发送请求
                    req = urllib.request.Request(
                        OPENAI_API_URL,
                        data=json.dumps(openai_data).encode(),
                        headers=headers,
                        method='POST'
                    )
                    
                    with urllib.request.urlopen(req) as response:
                        response_data = json.loads(response.read().decode())
                        logger.info('OpenAI API请求成功')
                        
                        # 提取回复内容
                        reply = response_data['choices'][0]['message']
                        
                        self._set_headers()
                        self.wfile.write(json.dumps(reply).encode())
                else:
                    # 如果没有API密钥，返回模拟响应
                    self._set_headers()
                    self.wfile.write(json.dumps({
                        'role': 'assistant',
                        'content': '这是一个模拟响应，因为OPENAI_API_KEY环境变量未设置。请配置API密钥以获取真实响应。'
                    }).encode())
            
            except Exception as e:
                logger.error(f'处理请求时出错: {str(e)}')
                self._set_headers(500)
                self.wfile.write(json.dumps({
                    'error': 'API请求失败',
                    'details': str(e)
                }).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

def run_server(port=8080):
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHandler)
    logger.info(f'启动后端服务器，端口: {port}')
    httpd.serve_forever()

if __name__ == '__main__':
    port = int(os.environ.get('BACKEND_PORT', 8080))
    run_server(port)
EOL

# 设置Python脚本可执行
chmod +x simple_backend.py

# 后端日志文件
BACKEND_LOG="$SCRIPT_DIR/backend.log"

# 启动简单后端服务（在后台）
echo "启动简单后端服务..."
python simple_backend.py > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

# 等待后端启动并执行健康检查
echo "等待后端服务启动..."
"$SCRIPT_DIR/health-check.sh" "http://localhost:8080" || { 
  echo "错误: 后端健康检查失败，显示日志:";
  cat "$BACKEND_LOG";
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