#!/bin/bash

# Cybersecurity Competition Platform (China Mirror)
# 快速启动脚本 - 使用国内镜像源

echo "🚀 Starting Competition Platform (China Mirror)..."
echo ""

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed. Please install Docker first."
    exit 1
fi

# 检查Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose not installed. Please install Docker Compose first."
    exit 1
fi

# 停止旧容器
echo "🛑 Stopping old containers..."
docker compose down

# 清理旧镜像（可选）
read -p "⚠️  Clear old images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing old images..."
    docker compose down --rmi all
fi

# 构建镜像（使用国内源）
echo "🔨 Building with China mirrors..."
docker compose build --no-cache

# 启动服务
echo "🚀 Starting services..."
docker compose up -d

# 等待服务启动
echo "⏳ Waiting for services to start..."
sleep 10

# 检查服务状态
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "✅ Competition Platform is running!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
echo "🔐 Default Accounts:"
echo "   Judge:  judge / judge123"
echo "   Player: team1 / team123"
echo ""
echo "📝 View logs: docker compose logs -f"
echo "🛑 Stop:      docker compose down"
echo ""
