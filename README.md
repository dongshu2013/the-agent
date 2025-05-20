# AI Agent 项目

这是一个提供AI聊天和工具调用能力的应用程序，包含后端API和前端界面。

## 项目结构

```
/
├── backend/               # FastAPI后端
│   ├── routes/            # API路由
│   ├── services/          # 服务层
│   ├── main.py            # 主应用入口
│   └── requirements.txt   # Python依赖
│
├── web/                   # 前端应用
│   ├── components/        # React组件
│   ├── pages/             # 页面
│   └── package.json       # NPM依赖
│
└── start-services.sh      # 部署启动脚本
```

## 功能

- 与OpenAI/DeepSeek等LLM模型对接的聊天接口
- 支持工具调用 (Tool Calling)
- 响应式界面设计
- PostgreSQL数据存储

## 快速开始

### 环境设置

1. 克隆仓库

```bash
git clone https://github.com/yourusername/ai-agent.git
cd ai-agent
```

2. 设置环境变量

创建`.env`文件:

```
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_postgres_connection_string
```

### 启动后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 启动前端

```bash
cd web
npm install
npm run dev
```

### 或使用部署脚本启动全部服务

```bash
chmod +x start-services.sh
./start-services.sh
```

## API文档

后端启动后，访问 http://localhost:8000/docs 查看API文档。

## 开发

### 后端开发

后端基于FastAPI开发，支持异步处理请求：

```python
@router.post("/completion")
async def chat_completion(payload: ChatRequest):
    response = await chat_with_llm(payload)
    return response
```

### 前端开发

前端使用Next.js框架，组件结构清晰：

```jsx
<ChatContainer>
  <MessageList messages={messages} />
  <ChatInput onSendMessage={handleSendMessage} />
</ChatContainer>
```

## 贡献

欢迎提交问题和改进建议！

## 许可

本项目采用MIT许可证。
