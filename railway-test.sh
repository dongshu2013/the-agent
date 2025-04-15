#!/bin/bash
# Railway环境测试脚本 - 用于调试部署问题

echo "===================== 环境信息 ====================="
echo "Python版本:"
python --version || echo "Python命令不可用"
echo ""

echo "Python路径:"
which python || echo "Python路径未找到"
echo ""

echo "Pip版本:"
pip --version || echo "Pip命令不可用"
echo ""

echo "Uvicorn版本:"
uvicorn --version || echo "Uvicorn命令不可用"
echo ""

echo "NodeJS版本:"
node --version || echo "Node命令不可用"
echo ""

echo "Yarn版本:"
yarn --version || echo "Yarn命令不可用"
echo ""

echo "当前目录:"
pwd
echo ""

echo "目录内容:"
ls -la
echo ""

echo "环境变量:"
env | grep -E 'PATH|PYTHON|NODE|PORT|API|RAIL'
echo ""

echo "===================== Python包 ====================="
echo "尝试导入关键模块:"
python -c "
try:
    import fastapi
    print('FastAPI版本:', fastapi.__version__)
except ImportError as e:
    print('FastAPI导入失败:', e)

try:
    import uvicorn
    print('Uvicorn版本:', uvicorn.__version__)
except ImportError as e:
    print('Uvicorn导入失败:', e)

try:
    import pydantic
    print('Pydantic版本:', pydantic.__version__)
except ImportError as e:
    print('Pydantic导入失败:', e)

try:
    import httpx
    print('HTTPX版本:', httpx.__version__)
except ImportError as e:
    print('HTTPX导入失败:', e)
"

echo "===================== 后端测试 ====================="
echo "检查后端目录:"
ls -la backend/
echo ""

echo "检查后端主文件:"
cat backend/main.py | head -20
echo "..."
echo ""

echo "==================== 前端测试 ======================"
echo "检查前端目录:"
ls -la web/
echo "已完成测试" 