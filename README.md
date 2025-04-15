# Railway部署指南

本项目使用Railway进行部署，同时部署前端和后端服务。

## 项目结构

```
/
├── web/             # 前端项目
├── backend/         # 后端项目 
├── nixpacks.toml    # Railway部署配置
├── start-services.sh # 服务启动脚本
└── Procfile         # 进程文件
```

## 部署步骤

1. **Fork或克隆此仓库**

2. **创建Railway项目**
   - 登录 [Railway](https://railway.app/)
   - 创建新项目
   - 选择从GitHub部署
   - 选择你的仓库

3. **设置环境变量**
   在Railway项目设置中添加以下环境变量：
   ```
   OPENAI_API_KEY=你的OpenAI API密钥
   ```
   
   可选变量:
   ```
   API_URL=你的后端API URL（如果与默认不同）
   PORT=服务端口（默认8080）
   ```

4. **部署**
   点击Deploy按钮进行部署，Railway会自动使用nixpacks.toml中的配置进行构建和部署。

## 本地开发

### 安装依赖
```bash
# 安装后端依赖
cd backend
python -m venv venv
source venv/bin/activate  # 在Windows上使用 venv\Scripts\activate
pip install -r requirements.txt

# 安装前端依赖
cd web
yarn install
```

### 运行服务
```bash
# 启动后端
cd backend
python run.py

# 启动前端
cd web
yarn dev
```

## 故障排除

如果部署失败，请检查：

1. 确保环境变量正确设置
2. 检查Railway日志，查看具体错误信息
3. 确保项目结构符合要求（frontend/和backend/目录正确放置）
4. 尝试手动本地构建验证项目无误后再部署 