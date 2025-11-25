#!/bin/bash

# Test environment setup script

set -e

echo "🧪 Setting up test environment..."

# Set test environment
export NODE_ENV=test
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=agape_looks_test
export DB_USER=postgres
export DB_PASSWORD=postgres
export REDIS_HOST=localhost
export REDIS_PORT=6379

# Generate test JWT keys if not exists
if [ ! -f "keys/jwt-private.pem" ]; then
  echo "Generating test JWT keys..."
  mkdir -p keys
  ssh-keygen -t rsa -b 4096 -m PEM -f keys/jwt-private.pem -N ""
  openssl rsa -in keys/jwt-private.pem -pubout -outform PEM -out keys/jwt-public.pem
fi

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d postgres -c '\q' 2>/dev/null; do
  sleep 1
done
echo "✅ PostgreSQL is ready"

# Wait for Redis
echo "⏳ Waiting for Redis..."
until redis-cli -h $REDIS_HOST -p $REDIS_PORT ping 2>/dev/null; do
  sleep 1
done
echo "✅ Redis is ready"

# Create test database
echo "Creating test database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" || true
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"

# Run migrations
echo "Running migrations..."
npm run migrate:up

echo "✅ Test environment ready!"
