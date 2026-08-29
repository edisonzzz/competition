#!/bin/bash

echo "🛡️  蓝队CTF平台 - 一键启动脚本"
echo "================================"
echo ""

# 检查是否在项目根目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 启动后端
echo "🚀 启动后端服务..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   后端进程 PID: $BACKEND_PID"
cd ..

# 等待后端启动
echo "⏳ 等待后端启动..."
sleep 3

# 启动前端
echo "🚀 启动前端服务..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   前端进程 PID: $FRONTEND_PID"
cd ..

echo ""
echo "================================"
echo "✅ 服务已启动！"
echo ""
echo "📡 后端: http://localhost:3000"
echo "🌐 前端: http://localhost:5173"
echo ""
echo "🔐 测试账号："
echo "   裁判: judge / judge123"
echo "   队员: team1 / team123"
echo ""
echo "📋 进程信息："
echo "   后端 PID: $BACKEND_PID"
echo "   前端 PID: $FRONTEND_PID"
echo ""
echo "🛑 停止服务："
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📝 日志文件："
echo "   后端日志: backend.log"
echo "   前端日志: frontend.log"
echo ""
