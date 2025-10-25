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

# Check if PM2 process exists
if pm2 list | grep -q "pop-backend"; then
    echo "🔄 Reloading existing PM2 process..."
    pm2 reload pop-backend
else
    echo "🚀 Starting new PM2 process..."
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
fi

echo "✅ Deployment complete!"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs"