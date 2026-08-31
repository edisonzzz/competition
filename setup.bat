@echo off
echo 🛡️  CTF Competition Platform - Setup Script
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js not found, please install Node.js first
    pause
    exit /b 1
)

echo Node.js installed
node -v
npm -v
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
if not exist "node_modules" (
    call npm install
) else (
    echo Backend dependencies already installed, skipping
)

REM Initialize database
echo.
echo Initializing database...
node src/initDatabase.js

REM Return to root
cd ..

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
) else (
    echo Frontend dependencies already installed, skipping
)

cd ..

echo.
echo ================================
echo Installation complete!
echo.
echo How to start:
echo.
echo 1. Start backend (new terminal):
echo    cd backend ^&^& npm run dev
echo.
echo 2. Start frontend (new terminal):
echo    cd frontend ^&^& npm run dev
echo.
echo 3. Access platform:
echo    http://localhost:5173
echo.
echo Test accounts:
echo    Judge: judge / judge123
echo    Player: team1 / team123
echo.
pause