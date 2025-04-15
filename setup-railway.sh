#!/bin/bash
# Railway部署辅助脚本

# 获取当前部署网址
RAILWAY_URL=$RAILWAY_PUBLIC_DOMAIN
if [ -z "$RAILWAY_URL" ]; then
  echo "错误: 无法获取Railway部署网址，请确保这是在Railway环境中运行"
  exit 1
fi

# 设置前端的API URL环境变量
echo "设置API URL环境变量..."
export API_URL="https://$RAILWAY_URL"
echo "API_URL设置为: $API_URL"

# 这个脚本可以在nixpacks.toml的phases.build阶段后运行，
# 以确保前端正确配置了后端API URL

# 创建一个标记文件表示此脚本已运行
touch .railway-setup-done 