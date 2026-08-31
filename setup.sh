#!/bin/bash

echo "🛡️  CTF Competition Platform - Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js not found, please install Node.js first"
    exit 1
fi

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Backend dependencies already installed, skipping"
fi

# Initialize database
echo ""
echo "Initializing database..."
node src/initDatabase.js

# Return to root
cd ..

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Frontend dependencies already installed, skipping"
fi

cd ..

echo ""
echo "================================"
echo "Installation complete!"
echo ""
echo "How to start:"
echo ""
echo "1. Start backend (new terminal):"
echo "   cd backend && npm run dev"
echo ""
echo "2. Start frontend (new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Access platform:"
echo "   http://localhost:5173"
echo ""
echo "Test accounts:"
echo "   Judge: judge / judge123"
echo "   Player: team1 / team123"
echo ""