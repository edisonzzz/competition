#!/bin/bash

echo "🛡️  CTF Platform - One-click Start Script"
echo "================================"
echo ""

# Check if in project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Start backend
echo "Starting backend service..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Start frontend
echo "Starting frontend service..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "================================"
echo "Services started!"
echo ""
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Test accounts:"
echo "   Judge: judge / judge123"
echo "   Player: team1 / team123"
echo ""
echo "Process info:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "Stop services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Log files:"
echo "   Backend log: backend.log"
echo "   Frontend log: frontend.log"
echo ""