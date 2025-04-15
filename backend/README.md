# AI Agent Backend

这是AI Agent的后端服务，提供聊天和工具调用功能。

## 项目结构

```
/backend
  ├── main.py                 # FastAPI 启动文件
  ├── routes/chat.py          # /chat/completion API 路由
  ├── services/llm_client.py  # 封装对 OpenAI、DeepSeek 的调用
  ├── schemas.py              # Pydantic 请求/响应定义
  └── config.py               # api_key / base_url 管理
```

## 环境要求

- Python 3.8+
- 在 `requirements.txt` 中列出的所有依赖

## 环境变量

在根目录创建 `.env` 文件，设置以下环境变量：

```
# OpenAI配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选，默认值

# DeepSeek配置（可选）
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1  # 可选，默认值

# 默认模型
DEFAULT_MODEL=gpt-4  # 可选，默认值
```

## 快速开始

1. 安装依赖

```bash
pip install -r requirements.txt
```

2. 运行服务

```bash
uvicorn backend.main:app --reload --port 8000
```

## API 文档

启动服务后，访问 `http://localhost:8000/docs` 可查看自动生成的API文档。

### 主要API端点

#### 聊天补全 (Chat Completion)

```
POST /v1/chat/completion
```

请求示例：

```json
{
  "messages": [
    {"role": "system", "content": "你是一个有用的助手"},
    {"role": "user", "content": "你好，请介绍一下自己"}
  ],
  "temperature": 0.7,
  "model": "gpt-4"
}
```

响应示例：

```json
{
  "role": "assistant",
  "content": "你好！我是一个AI助手，设计用来提供帮助、回答问题和支持各种任务..."
}
```

## 测试

可以使用curl命令测试API：

```bash
curl -X POST http://localhost:8000/v1/chat/completion \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "你是一个有用的助手"},
      {"role": "user", "content": "你好，请介绍一下自己"}
    ],
    "temperature": 0.7
  }'
``` 