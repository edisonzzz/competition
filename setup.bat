@echo off
echo 🛡️  蓝队CTF竞赛平台 - 启动脚本
echo ================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo ✅ Node.js已安装
node -v
npm -v
echo.

REM 安装后端依赖
echo 📦 安装后端依赖...
cd backend
if not exist "node_modules" (
    call npm install
) else (
    echo    后端依赖已安装，跳过
)

REM 初始化数据库
echo.
echo 🗄️  初始化数据库...
node src/initDatabase.js

REM 返回根目录
cd ..

REM 安装前端依赖
echo.
echo 📦 安装前端依赖...
cd frontend
if not exist "node_modules" (
    call npm install
) else (
    echo    前端依赖已安装，跳过
)

cd ..

echo.
echo ================================
echo ✅ 安装完成！
echo.
echo 🚀 启动说明：
echo.
echo 1. 启动后端（新命令行窗口）：
echo    cd backend ^&^& npm run dev
echo.
echo 2. 启动前端（新命令行窗口）：
echo    cd frontend ^&^& npm run dev
echo.
echo 3. 访问平台：
echo    http://localhost:5173
echo.
echo 🔐 测试账号：
echo    裁判: judge / judge123
echo    队员: team1 / team123
echo.
pause
