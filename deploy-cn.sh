#!/bin/bash

echo "==================================="
echo "CTF Platform Deployment Script (China Mirror Optimized)"
echo "==================================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Docker not installed, installing..."
    curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
    systemctl start docker
    systemctl enable docker
fi

if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose not installed, installing..."
    curl -L "https://get.daocloud.io/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "Docker environment check passed"
echo ""

# Configure Docker mirror acceleration
if [ ! -f /etc/docker/daemon.json ]; then
    echo "Configuring Docker mirror acceleration..."
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
EOF
    systemctl restart docker
    echo "Docker mirror acceleration configured"
fi

echo ""
echo "Building and starting services..."
echo ""

# Stop old containers
docker compose down 2>/dev/null || true

# Clean old images (optional)
read -p "Clean old Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose down --rmi all
    docker system prune -af
fi

# Build and start
docker compose up -d --build

echo ""
echo "Waiting for services to start..."
sleep 10

# Check status
echo ""
echo "Service status:"
docker compose ps

echo ""
echo "Deployment complete!"
echo ""
echo "Access addresses:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend: http://localhost:3001"
echo ""
echo "Test accounts:"
echo "   - Judge: judge / judge123"
echo "   - Player: team1 / team123"
echo ""
echo "View logs:"
echo "   docker compose logs -f"
echo ""