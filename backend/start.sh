#!/bin/bash
# 启动后端服务

# 检查Python环境
if ! command -v python3 &> /dev/null
then
    echo "需要安装Python 3"
    exit 1
fi

# 项目根目录（确保在正确的上下文中运行）
PROJECT_ROOT=$(dirname "$(cd "$(dirname "$0")" && pwd)")
cd "$PROJECT_ROOT"

# 检查是否已安装依赖
if [ ! -d "backend/venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv backend/venv
    source backend/venv/bin/activate
    pip install -r backend/requirements.txt
else
    source backend/venv/bin/activate
fi

# 检查.env文件
if [ ! -f "backend/.env" ]; then
    echo "警告: 未找到.env文件，将使用.env.example创建"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "已创建.env文件，请编辑该文件设置您的API密钥"
    else
        echo "错误: 未找到.env.example文件，请手动创建.env文件"
        exit 1
    fi
fi

# 启动服务 - 使用模块方式启动而不是直接运行文件
echo "启动AI Agent后端服务..."
cd "$PROJECT_ROOT"
# 确保当前目录在sys.path中，以便正确导入
PYTHONPATH="$PROJECT_ROOT" uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 