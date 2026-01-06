#!/usr/bin/env bash

# Quick Start Script for VectorMind AI Frontend

set -e

echo "🚀 VectorMind AI - Quick Start"
echo "================================"
echo ""

# Check if in frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install --silent
echo "✅ Dependencies installed"
echo ""

echo "🔑 Step 2: Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found"
    echo ""
    echo "Please create .env.local with:"
    echo "  OPENAI_API_KEY=sk-proj-your-key-here"
    echo ""
    echo "Get your key from: https://platform.openai.com/api-keys"
    exit 1
fi

if ! grep -q "OPENAI_API_KEY=sk-" .env.local; then
    echo "⚠️  Warning: OPENAI_API_KEY doesn't look valid"
    echo "   Make sure it starts with 'sk-'"
else
    echo "✅ API key configured"
fi
echo ""

echo "📋 Available Commands:"
echo "  npm run dev      - Start development server"
echo "  node test-api.js - Test the chat API"
echo "  npm run build    - Build for production"
echo ""

echo "🎯 Quick Test:"
echo "  1. Run: npm run dev"
echo "  2. In another terminal, run: node test-api.js"
echo "  3. Open http://localhost:3000 in your browser"
echo ""

echo "✨ Setup complete! Run 'npm run dev' to get started."
