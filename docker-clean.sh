#!/bin/bash

echo "🧹 清理蓝队CTF平台"
echo "================================"
echo ""

read -p "确定要清理所有数据吗？(y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 停止服务..."
    docker compose down

    echo "🗑️  删除容器和数据卷..."
    docker compose down -v

    echo "🧹 清理镜像..."
    docker rmi blueteamctf-backend blueteamctf-frontend 2>/dev/null || true

    echo ""
    echo "✅ 清理完成！"
    echo ""
    echo "💡 下次启动时会重新构建并初始化数据库"
else
    echo "❌ 取消清理"
fi
