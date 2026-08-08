#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Load environment variables
if [ -f .env.prod ]; then
  export $(cat .env.prod | xargs)
fi

# Pull latest code
git pull origin main

# Build and start containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# Cleanup
docker system prune -f

echo "✅ Deployment complete!"
echo "Frontend: http://localhost"
echo "API: http://localhost:3001"
