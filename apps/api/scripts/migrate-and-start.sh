#!/bin/bash
set -e

echo "🔄 Running database migrations..."
echo "📍 Current directory: $(pwd)"

cd apps/api
echo "📍 Changed to: $(pwd)"

echo "🔍 Checking for migration files..."
ls -la prisma/migrations/ || echo "⚠️  No migrations directory found"

echo "🚀 Running prisma migrate deploy..."
pnpm prisma migrate deploy

echo "✅ Migrations completed successfully"
echo "🚀 Starting API server..."
cd ../..
pnpm --filter @padel/api start

