#!/bin/bash
set -e

echo "🔄 Running database migrations..."
echo "📍 Current directory: $(pwd)"
echo "🔗 DATABASE_URL: ${DATABASE_URL:0:30}..." # Show first 30 chars only for security

cd apps/api
echo "📍 Changed to: $(pwd)"

echo "🔍 Checking for migration files..."
ls -la prisma/migrations/ || echo "⚠️  No migrations directory found"

echo "🚀 Running prisma migrate deploy..."
pnpm prisma migrate deploy

echo "✅ Migrations completed successfully"
echo "🔍 Verifying tables were created..."
pnpm prisma db execute --stdin <<EOF
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
EOF

echo "🚀 Starting API server..."
cd ../..
pnpm --filter @padel/api start

