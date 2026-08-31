#!/bin/bash

echo "==================================="
echo "蓝队CTF平台部署脚本 (国内镜像优化版)"
echo "==================================="
echo ""

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，正在安装..."
    curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
    systemctl start docker
    systemctl enable docker
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose未安装，正在安装..."
    curl -L "https://get.daocloud.io/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "✅ Docker环境检查完成"
echo ""

# 配置Docker镜像加速
if [ ! -f /etc/docker/daemon.json ]; then
    echo "⚙️ 配置Docker镜像加速..."
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
    echo "✅ Docker镜像加速配置完成"
fi

echo ""
echo "🚀 开始构建和启动服务..."
echo ""

# 停止旧容器
docker compose down 2>/dev/null || true

# 清理旧镜像（可选）
read -p "是否清理旧Docker镜像? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose down --rmi all
    docker system prune -af
fi

# 构建并启动
docker compose up -d --build

echo ""
echo "⏳ 等待服务启动..."
sleep 10

# 检查状态
echo ""
echo "📊 服务状态："
docker compose ps

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址："
echo "   - 前端: http://localhost:5173"
echo "   - 后端: http://localhost:3001"
echo ""
echo "🔐 测试账号："
echo "   - 裁判: judge / judge123"
echo "   - 队员: team1 / team123"
echo ""
echo "📝 查看日志："
echo "   docker compose logs -f"
echo ""
