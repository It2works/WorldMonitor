#!/bin/bash
# World Monitor — Setup Script
# Run this from the worldmonitor/ root directory

set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     🌍 World Monitor — Setup             ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# 1. Backend
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"
echo ""

# 2. Frontend
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"
echo ""

# 3. Environment
cd ..
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 Created .env from .env.example"
else
  echo "📝 .env already exists"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     ✅ Setup Complete!                    ║"
echo "╠══════════════════════════════════════════╣"
echo "║                                          ║"
echo "║  Start backend:                          ║"
echo "║    cd backend && npm start               ║"
echo "║                                          ║"
echo "║  Start frontend (new terminal):          ║"
echo "║    cd frontend && npm run dev            ║"
echo "║                                          ║"
echo "║  (Optional) Install Ollama:              ║"
echo "║    curl -fsSL https://ollama.ai/install.sh | sh  ║"
echo "║    ollama pull qwen2:1.5b                ║"
echo "║                                          ║"
echo "╚══════════════════════════════════════════╝"
