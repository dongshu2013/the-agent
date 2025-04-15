#!/bin/bash
# 健康检查脚本 - 检查后端API是否可用

# 设置变量
API_URL=${1:-"http://localhost:8080"}
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "开始检查后端API健康状态..."
echo "API URL: $API_URL"

# 尝试连接健康检查端点
for ((i=1; i<=MAX_RETRIES; i++)); do
  echo "尝试 $i/$MAX_RETRIES..."
  
  # 使用curl检查API状态
  if curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" | grep -q "200\|201\|404"; then
    echo "后端API可用！"
    exit 0
  fi
  
  echo "后端API还未准备好，等待 $RETRY_INTERVAL 秒..."
  sleep $RETRY_INTERVAL
done

echo "错误: 无法连接到后端API，健康检查失败"
exit 1 