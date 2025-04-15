#!/usr/bin/env python3
"""
简单的API测试脚本，用于测试聊天补全功能
使用方法: python test_api.py "你的问题"
"""

import sys
import json
import requests
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 默认API地址 - 使用8080端口
API_URL = "http://localhost:8080/v1/chat/completion"

def test_chat_api(prompt):
    """测试聊天API"""
    payload = {
        "messages": [
            {"role": "system", "content": "你是一个有用的AI助手，请提供简洁明了的回答。"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    
    try:
        print(f"发送请求到 {API_URL}...")
        print(f"问题: {prompt}")
        print("等待回复...\n")
        
        response = requests.post(API_URL, json=payload, timeout=60)
        
        # 检查响应
        if response.status_code == 200:
            result = response.json()
            print(f"回复 ({response.elapsed.total_seconds():.2f}s):")
            print("-" * 50)
            print(result["content"])
            print("-" * 50)
            return True
        else:
            print(f"错误: HTTP状态码 {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"请求失败: {str(e)}")
        return False

if __name__ == "__main__":
    # 获取命令行参数
    if len(sys.argv) < 2:
        print("用法: python test_api.py \"你的问题\"")
        sys.exit(1)
    
    prompt = sys.argv[1]
    test_chat_api(prompt) 