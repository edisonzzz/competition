#!/bin/bash

echo "🛡️  蓝队CTF竞赛平台 - 启动脚本"
echo "================================"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到Node.js，请先安装Node.js"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"
echo "✅ npm版本: $(npm -v)"
echo ""

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   后端依赖已安装，跳过"
fi

# 初始化数据库
echo ""
echo "🗄️  初始化数据库..."
node src/initDatabase.js

# 返回根目录
cd ..

# 安装前端依赖
echo ""
echo "📦 安装前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   前端依赖已安装，跳过"
fi

cd ..

echo ""
echo "================================"
echo "✅ 安装完成！"
echo ""
echo "🚀 启动说明："
echo ""
echo "1. 启动后端（新终端窗口）："
echo "   cd backend && npm run dev"
echo ""
echo "2. 启动前端（新终端窗口）："
echo "   cd frontend && npm run dev"
echo ""
echo "3. 访问平台："
echo "   http://localhost:5173"
echo ""
echo "🔐 测试账号："
echo "   裁判: judge / judge123"
echo "   队员: team1 / team123"
echo ""
