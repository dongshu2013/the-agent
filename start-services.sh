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
import traceback

# 尝试导入PostgreSQL模块
try:
    import psycopg2
    import psycopg2.extras
    HAS_POSTGRES = True
except ImportError:
    HAS_POSTGRES = False
    print("警告: psycopg2模块未安装，PostgreSQL功能将不可用")

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

# 获取数据库URL
DATABASE_URL = os.environ.get('DATABASE_URL', '')
if not DATABASE_URL:
    logger.warning('DATABASE_URL环境变量未设置，数据库功能将不可用')
else:
    logger.info('已检测到DATABASE_URL环境变量')

# 配置OpenAI API
OPENAI_API_URL = os.environ.get('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions')

# 数据库连接函数
def get_db_connection():
    """创建数据库连接"""
    if not DATABASE_URL or not HAS_POSTGRES:
        return None
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        return conn
    except Exception as e:
        logger.error(f"数据库连接失败: {str(e)}")
        return None

# 初始化数据库
def init_database():
    """初始化数据库表结构"""
    if not DATABASE_URL or not HAS_POSTGRES:
        logger.warning("数据库未配置，跳过初始化")
        return False
    
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cur:
            # 创建消息历史表
            cur.execute("""
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id SERIAL PRIMARY KEY,
                    session_id VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # 创建用户会话表
            cur.execute("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    session_id VARCHAR(255) PRIMARY KEY,
                    user_id VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            logger.info("数据库初始化成功")
            return True
    except Exception as e:
        logger.error(f"数据库初始化失败: {str(e)}")
        traceback.print_exc()
        return False
    finally:
        conn.close()

# 保存消息到数据库
def save_message(session_id, role, content):
    """将消息保存到数据库"""
    if not DATABASE_URL or not HAS_POSTGRES:
        return False
    
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO chat_messages (session_id, role, content) VALUES (%s, %s, %s) RETURNING id",
                (session_id, role, content)
            )
            message_id = cur.fetchone()[0]
            logger.info(f"消息已保存到数据库，ID: {message_id}")
            return message_id
    except Exception as e:
        logger.error(f"保存消息失败: {str(e)}")
        return False
    finally:
        conn.close()

# 获取会话历史消息
def get_session_messages(session_id, limit=50):
    """从数据库获取会话历史消息"""
    if not DATABASE_URL or not HAS_POSTGRES:
        return []
    
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(
                "SELECT role, content FROM chat_messages WHERE session_id = %s ORDER BY created_at ASC LIMIT %s",
                (session_id, limit)
            )
            messages = [dict(row) for row in cur.fetchall()]
            return messages
    except Exception as e:
        logger.error(f"获取会话消息失败: {str(e)}")
        return []
    finally:
        conn.close()

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
            # 检查数据库连接作为健康检查的一部分
            db_status = "connected" if get_db_connection() else "disconnected"
            self.wfile.write(json.dumps({
                'status': 'healthy', 
                'timestamp': datetime.now().isoformat(),
                'database': db_status
            }).encode())
        elif self.path == '/':
            self._set_headers(content_type='text/html')
            self.wfile.write(b'<html><body><h1>Simple Backend API</h1><p>API is running</p></body></html>')
        elif self.path.startswith('/api/sessions/'):
            # 提取会话ID
            session_id = self.path.split('/')[-1]
            messages = get_session_messages(session_id)
            self._set_headers()
            self.wfile.write(json.dumps({
                'session_id': session_id,
                'messages': messages
            }).encode())
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
                # 获取或创建会话ID
                session_id = request_data.get('session_id', 'default')
                
                # 将用户消息保存到数据库
                if 'messages' in request_data and request_data['messages']:
                    user_message = next((msg for msg in reversed(request_data['messages']) 
                                        if msg.get('role') == 'user'), None)
                    if user_message:
                        save_message(session_id, 'user', user_message.get('content', ''))
                
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
                        
                        # 将助手回复保存到数据库
                        save_message(session_id, 'assistant', reply.get('content', ''))
                        
                        self._set_headers()
                        self.wfile.write(json.dumps(reply).encode())
                else:
                    # 如果没有API密钥，返回模拟响应
                    dummy_response = {
                        'role': 'assistant',
                        'content': '这是一个模拟响应，因为OPENAI_API_KEY环境变量未设置。请配置API密钥以获取真实响应。'
                    }
                    
                    # 将模拟回复保存到数据库
                    save_message(session_id, 'assistant', dummy_response['content'])
                    
                    self._set_headers()
                    self.wfile.write(json.dumps(dummy_response).encode())
            
            except Exception as e:
                logger.error(f'处理请求时出错: {str(e)}')
                traceback.print_exc()
                self._set_headers(500)
                self.wfile.write(json.dumps({
                    'error': 'API请求失败',
                    'details': str(e)
                }).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

def run_server(port=8080):
    """启动HTTP服务器"""
    
    # 初始化数据库
    init_database()
    
    # 启动服务器
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

# 安装PostgreSQL Python客户端
echo "安装PostgreSQL Python客户端..."
pip install psycopg2-binary --quiet || echo "警告: 无法安装psycopg2-binary，数据库功能可能不可用"

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
NODE_ENV=production PORT=$PORT yarn start -p $PORT

# 如果前端退出，也关闭后端
kill $BACKEND_PID 