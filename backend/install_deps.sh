#!/bin/bash

# 激活虚拟环境（如果存在）
if [ -d "venv" ]; then
    echo "激活虚拟环境..."
    source venv/bin/activate
fi

# 安装依赖
echo "安装依赖..."
pip install -r requirements.txt

echo "完成！依赖已安装。" 