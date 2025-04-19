import os
import requests
from dotenv import load_dotenv

def main():
    # 加载环境变量
    load_dotenv()
    
    # 获取 Railway API 密钥
    api_key = os.getenv('RAILWAY_API_KEY')
    if not api_key:
        raise ValueError("RAILWAY_API_KEY environment variable is not set")
    
    # 获取项目 ID
    project_id = os.getenv('RAILWAY_PROJECT_ID')
    if not project_id:
        raise ValueError("RAILWAY_PROJECT_ID environment variable is not set")
    
    # 获取服务 ID
    service_id = os.getenv('RAILWAY_SERVICE_ID')
    if not service_id:
        raise ValueError("RAILWAY_SERVICE_ID environment variable is not set")
    
    # 构建 API 请求
    url = f"https://backboard.railway.app/graphql/v2"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # 安装 pgvector 扩展的 GraphQL 查询
    query = """
    mutation {
        postgresqlCreateExtension(
            input: {
                projectId: "%s"
                serviceId: "%s"
                extension: "vector"
            }
        ) {
            success
            error
        }
    }
    """ % (project_id, service_id)
    
    # 发送请求
    response = requests.post(url, json={"query": query}, headers=headers)
    result = response.json()
    
    if "errors" in result:
        print("Error installing pgvector extension:")
        print(result["errors"])
    else:
        print("Successfully installed pgvector extension!")

if __name__ == "__main__":
    main() 