#!/usr/bin/env python3
"""
Backend服务启动入口点
使用方法: python run.py
"""

import sys
import os
import uvicorn

# 确保backend包可以被导入
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

if __name__ == "__main__":
    # 启动FastAPI应用，使用8080端口避免冲突
    uvicorn.run("backend.main:app", reload=True, host="0.0.0.0", port=8080) 