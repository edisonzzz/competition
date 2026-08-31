#!/bin/bash

# Cybersecurity Competition Platform (China Mirror)
# Quick start script - using China mirror sources

echo "🚀 Starting Competition Platform (China Mirror)..."
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose not installed. Please install Docker Compose first."
    exit 1
fi

# Stop old containers
echo "🛑 Stopping old containers..."
docker compose down

# Cleaning old images...
read -p "⚠️  Clear old images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing old images..."
    docker compose down --rmi all
fi

# Build images (using China mirrors)
echo "🔨 Building with China mirrors..."
docker compose build --no-cache

# Start services
echo "🚀 Starting services..."
docker compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
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
