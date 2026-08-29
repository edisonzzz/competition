#!/bin/bash

echo "🐳 蓝队CTF平台 - Docker 一键启动"
echo "================================"
echo ""

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未检测到Docker，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 错误: 未检测到Docker Compose，请先安装"
    exit 1
fi

echo "✅ Docker 环境检测通过"
echo ""

# 启动服务
echo "🚀 启动服务..."
docker compose up -d --build

echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo ""
echo "📊 服务状态:"
docker compose ps

echo ""
echo "================================"
echo "✅ 平台已启动！"
echo ""
echo "🌐 访问地址:"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:3001"
echo ""
echo "🔐 测试账号:"
echo "   裁判: judge / judge123"
echo "   队员: team1 / team123"
echo ""
echo "📋 常用命令:"
echo "   查看日志: docker compose logs -f"
echo "   停止服务: docker compose down"
echo "   清理数据: docker compose down -v"
echo "   重启服务: docker compose restart"
echo ""
