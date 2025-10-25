# Pop Post Analyzer API

AI-powered post analysis for market generation

## Quick Start

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Create environment file:**

   ```bash
   cp env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

3. **Start development server:**
   ```bash
   pnpm run start:dev
   ```

## API Documentation

Swagger UI: `http://localhost:3001/api`

## Deployment

```bash
ssh ubuntu@server-ip
cd POP/backend
chmod +x deploy.sh
./deploy.sh
```

## Commands

```bash
pm2 status     # Check if running
pm2 logs       # View logs
pm2 restart    # Restart app
pm2 stop       # Stop app
```
