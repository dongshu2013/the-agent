# AI Agent 后端 API

这是AI Agent的FastAPI后端服务，负责处理聊天请求和工具调用。

## 功能

- 支持与OpenAI和DeepSeek等LLM模型的对接
- 提供标准的Chat Completion API
- 支持函数调用（Function Calling）
- 健康检查端点

## 快速开始

### 环境变量设置

创建`.env`文件:

```
OPENROUTER_API_KEY=your_openai_api_key
DATABASE_URL=your_database_url  # 可选
DEBUG=False
```

### 更新依赖

```bash
uv lock
```

### 安装依赖

```bash
uv sync
```


### 运行服务

```bash
# prod mode
uv run uvicorn edge_agent.main:start_server

# dev mode
uv run uvicorn edge_agent.main:start_dev --reload --port 8000
```

## API参考

### 聊天完成 `/v1/chat/completion`

**请求示例:**

```json
{
  "messages": [
    {"role": "system", "content": "你是一个有用的AI助手。"},
    {"role": "user", "content": "你好，请介绍一下自己。"}
  ],
  "model": "gpt-3.5-turbo",
  "temperature": 0.7
}
```

**响应示例:**

```json
{
  "message": {
    "role": "assistant",
    "content": "你好！我是一个AI助手，被设计用来提供信息、回答问题和协助完成各种任务。我可以讨论各种主题，提供解释，帮助解决问题，或者只是聊天。虽然我没有个人经历或意识，但我努力提供有用、准确和有礼貌的回应。如果你有任何问题或需要帮助，请随时告诉我！"
  },
  "model": "gpt-3.5-turbo-0613",
  "usage": {
    "prompt_tokens": 37,
    "completion_tokens": 108,
    "total_tokens": 145
  }
}
```

## 测试

使用`test_client.py`脚本进行简单测试:

```bash
python test_client.py "你好，请介绍一下自己。"
``` 