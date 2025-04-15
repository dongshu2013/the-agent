#!/usr/bin/env python3
"""
测试FastAPI聊天后端的简单客户端
用法: python test_client.py "你的问题"
"""
import argparse
import json
import httpx
import asyncio
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

API_URL = os.getenv("API_URL", "http://localhost:8000/v1/chat/completion")
MODEL = os.getenv("MODEL", "gpt-3.5-turbo")

async def chat_request(message: str):
    """发送聊天请求并获取响应"""
    payload = {
        "messages": [
            {"role": "system", "content": "你是一个有用的AI助手。"},
            {"role": "user", "content": message}
        ],
        "model": MODEL,
        "temperature": 0.7
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            print(f"发送请求到 {API_URL}...")
            response = await client.post(
                API_URL,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print("\n=== 响应 ===")
                print(json.dumps(data, indent=2, ensure_ascii=False))
                print(f"\n回复: {data['message']['content']}")
                return data
            else:
                print(f"错误: HTTP {response.status_code}")
                print(response.text)
                return None
        except Exception as e:
            print(f"请求失败: {str(e)}")
            return None

def parse_args():
    parser = argparse.ArgumentParser(description='与聊天API进行测试')
    parser.add_argument('message', type=str, help='发送给API的消息')
    parser.add_argument('--url', type=str, help='API端点URL', default=API_URL)
    parser.add_argument('--model', type=str, help='要使用的模型', default=MODEL)
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    API_URL = args.url
    MODEL = args.model
    
    print(f"使用模型: {MODEL}")
    asyncio.run(chat_request(args.message)) 