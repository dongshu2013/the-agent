#!/bin/bash
# 健康检查脚本 - 检查后端API是否可用

# 设置变量
API_URL=${1:-"http://localhost:8080"}
MAX_RETRIES=60  # 增加重试次数
RETRY_INTERVAL=2

echo "开始检查后端API健康状态..."
echo "API URL: $API_URL"

# 尝试连接健康检查端点
for ((i=1; i<=MAX_RETRIES; i++)); do
  echo "尝试 $i/$MAX_RETRIES..."
  
  # 使用curl检查API状态，增加详细输出
  HTTP_CODE=$(curl -s -o /tmp/health_response.txt -w "%{http_code}" "$API_URL/health")
  
  echo "HTTP状态码: $HTTP_CODE"
  
  if [[ "$HTTP_CODE" =~ ^(200|201|404)$ ]]; then
    echo "后端API可用！"
    echo "响应内容:"
    cat /tmp/health_response.txt
    rm -f /tmp/health_response.txt
    exit 0
  fi
  
  echo "响应内容:"
  cat /tmp/health_response.txt
  rm -f /tmp/health_response.txt
  
  # 尝试访问根路径
  if [ $i -eq 10 ]; then
    echo "尝试访问根路径..."
    ROOT_CODE=$(curl -s -o /tmp/root_response.txt -w "%{http_code}" "$API_URL/")
    echo "根路径HTTP状态码: $ROOT_CODE"
    cat /tmp/root_response.txt
    rm -f /tmp/root_response.txt
  fi
  
  echo "后端API还未准备好，等待 $RETRY_INTERVAL 秒..."
  sleep $RETRY_INTERVAL
done

echo "错误: 无法连接到后端API，健康检查失败"
exit 1 