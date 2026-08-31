#!/bin/bash

echo "🐳 CTF Platform - Docker One-click Start"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker not found, please install Docker first"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose not found, please install"
    exit 1
fi

echo "Docker environment check passed"
echo ""

# Start services
echo "Starting services..."
docker compose up -d --build

echo ""
echo "Waiting for services to start..."
sleep 5

# Check service status
echo ""
echo "Service status:"
docker compose ps

echo ""
echo "================================"
echo "Platform started!"
echo ""
echo "Access addresses:"
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:3001"
echo ""
echo "Test accounts:"
echo "   Judge: judge / judge123"
echo "   Player: team1 / team123"
echo ""
echo "Common commands:"
echo "   View logs: docker compose logs -f"
echo "   Stop: docker compose down"
echo "   Clean data: docker compose down -v"
echo "   Restart: docker compose restart"
echo ""