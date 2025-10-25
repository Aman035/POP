#!/bin/bash

echo "🚀 Deploying Pop Backend..."

# Create logs directory
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the application
echo "🔨 Building application..."
pnpm run build

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env from example..."
    cp env.example .env
    echo "❌ Please edit .env and add your GROQ_API_KEY"
    echo "   Then run: pm2 start ecosystem.config.js"
    exit 1
fi

# Start with PM2
echo "🚀 Starting with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deployment complete!"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs"