# AGAPE LOOKS Backend - Complete Operations Guide

## 📋 Table of Contents
1. [Initial Setup](#initial-setup)
2. [Running the Application](#running-the-application)
3. [Daily Operations](#daily-operations)
4. [Monitoring & Health Checks](#monitoring--health-checks)
5. [Database Operations](#database-operations)
6. [Queue Management](#queue-management)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance Tasks](#maintenance-tasks)

---

## 🚀 Initial Setup

### Step 1: Install Prerequisites

```bash
# Install Node.js 18+ (using nvm - recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install pnpm globally
npm install -g pnpm

# Verify installations
node --version    # Should show v18.x.x or higher
pnpm --version    # Should show 8.x.x or higher
```

### Step 2: Clone and Install

```bash
# Clone the repository
git clone <your-repository-url>
cd Agape

# Install all dependencies
pnpm install

# This will install:
# - Production dependencies
# - Development dependencies
# - Create pnpm-lock.yaml (commit this file)
```

### Step 3: Generate JWT Keys

```bash
# Run the provided script
chmod +x scripts/generate-keys.sh
./scripts/generate-keys.sh

# Or manually:
mkdir -p keys
ssh-keygen -t rsa -b 4096 -m PEM -f keys/jwt-private.pem -N ""
openssl rsa -in keys/jwt-private.pem -pubout -outform PEM -out keys/jwt-public.pem
chmod 600 keys/jwt-private.pem
chmod 644 keys/jwt-public.pem

# ⚠️ IMPORTANT: Never commit keys/ directory to git
# It's already in .gitignore
```

### Step 4: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit with your preferred editor
nano .env  # or vim, code, etc.
```

**Required Environment Variables:**

```bash
# === Server Configuration ===
NODE_ENV=development
PORT=3000
HOST=localhost

# === Database (PostgreSQL) ===
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agape_looks
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_CONNECTION_TIMEOUT=30000

# === Redis ===
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# === JWT Configuration ===
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=30d
JWT_PRIVATE_KEY_PATH=./keys/jwt-private.pem
JWT_PUBLIC_KEY_PATH=./keys/jwt-public.pem

# === External Services ===

# Paystack (Payment Gateway)
PAYSTACK_SECRET_KEY=sk_test_your_test_key
PAYSTACK_PUBLIC_KEY=pk_test_your_test_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary (Media Management)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend (Email Service)
RESEND_API_KEY=re_your_api_key

# === Application Settings ===
FRONTEND_URL=http://localhost:3001
ADMIN_IP_WHITELIST=127.0.0.1,::1

# === Fraud Detection ===
MAX_TRANSACTION_AMOUNT=5000000
DAILY_USER_LIMIT=10000000
HOURLY_USER_LIMIT=2000000

# === Queue Settings ===
QUEUE_CONCURRENCY=5
QUEUE_MAX_RETRIES=3
```

### Step 5: Setup Database

#### Option A: Using Docker (Recommended for Development)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be ready (10-15 seconds)
sleep 15

# Run migrations
pnpm run migrate:up

# Seed sample data (optional)
pnpm run seed
```

#### Option B: Using Local PostgreSQL

```bash
# Create database
psql -U postgres
CREATE DATABASE agape_looks;
\q

# Run migrations
pnpm run migrate:up

# Seed sample data (optional)
pnpm run seed
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Start development server with auto-reload
pnpm run dev

# The server will start on http://localhost:3000
# API available at: http://localhost:3000/api/v1
```

**What happens:**
- Nodemon watches for file changes
- Auto-restarts on code changes
- Detailed logging enabled
- Source maps active for debugging

### Production Mode

```bash
# Start production server
pnpm start

# Or with PM2 (recommended for production)
pnpm install -g pm2
pm2 start src/server.js --name agape-backend
pm2 save
pm2 startup
```

### Using Docker (Full Stack)

```bash
# Start all services (app, postgres, redis)
docker-compose up -d

# View logs
docker-compose logs -f app

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Development with Admin Tools

```bash
# Start with PgAdmin and Redis Commander
docker-compose --profile dev-tools up -d

# Access tools:
# PgAdmin: http://localhost:8080
#   Email: admin@agape.com
#   Password: admin

# Redis Commander: http://localhost:8081
```

---

## 📊 Daily Operations

### Checking Application Health

```bash
# Health check endpoint
curl http://localhost:3000/healthz

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-13T22:00:00Z",
#   "uptime": 3600,
#   "environment": "development"
# }

# Detailed health check with dependencies
curl http://localhost:3000/healthz/detailed

# Prometheus metrics
curl http://localhost:3000/metrics
```

### Viewing Logs

```bash
# Real-time logs (Docker)
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Filter by level (local development)
tail -f logs/combined.log | grep ERROR

# View error logs only
tail -f logs/error.log

# View specific service logs
tail -f logs/combined.log | grep "service\":\"payments"
```

### Monitoring Queue Jobs

```bash
# Check queue statistics (requires auth token)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/v1/admin/queues/stats

# Response example:
# {
#   "email": {
#     "waiting": 5,
#     "active": 2,
#     "completed": 1523,
#     "failed": 3
#   },
#   "invoice": {
#     "waiting": 0,
#     "active": 0,
#     "completed": 450,
#     "failed": 0
#   }
# }
```

### Database Connection Status

```bash
# Check PostgreSQL connections
docker-compose exec postgres psql -U postgres -d agape_wone -c "\
  SELECT count(*) as active_connections \
  FROM pg_stat_activity \
  WHERE datname = 'agape_wone';"

# Check slow queries
docker-compose exec postgres psql -U postgres -d agape_wone -c "\
  SELECT pid, now() - query_start as duration, query \
  FROM pg_stat_activity \
  WHERE state = 'active' AND now() - query_start > interval '5 seconds';"
```

### Redis Status

```bash
# Check Redis connection
redis-cli -h localhost -p 6379 ping
# Should return: PONG

# Check memory usage
redis-cli -h localhost -p 6379 INFO memory | grep used_memory_human

# Check connected clients
redis-cli -h localhost -p 6379 INFO clients | grep connected_clients

# Monitor commands in real-time
redis-cli -h localhost -p 6379 MONITOR
```

---

## 🗄️ Database Operations

### Running Migrations

```bash
# Apply all pending migrations
pnpm run migrate:up

# Rollback last migration
pnpm run migrate:down

# Create new migration
pnpm run migrate:create add_coupon_table

# Check migration status
psql -U postgres -d agape_wone -c "\
  SELECT * FROM schema_migrations ORDER BY executed_at DESC LIMIT 10;"
```

### Database Backup

```bash
# Manual backup
./scripts/backup.sh

# Or manually with pg_dump
pg_dump -U postgres -d agape_wone -F c -f backup_$(date +%Y%m%d).dump

# Compress backup
gzip backup_$(date +%Y%m%d).dump

# Restore from backup
pg_restore -U postgres -d agape_wone -c backup_20250113.dump
```

### Common Database Queries

```bash
# Count users
psql -U postgres -d agape_wone -c "SELECT COUNT(*) FROM users;"

# Count orders by status
psql -U postgres -d agape_wone -c "\
  SELECT status, COUNT(*) \
  FROM orders \
  GROUP BY status;"

# Recent payments
psql -U postgres -d agape_wone -c "\
  SELECT id, gateway_ref, amount, status, created_at \
  FROM payments \
  ORDER BY created_at DESC \
  LIMIT 10;"

# Low stock products
psql -U postgres -d agape_wone -c "\
  SELECT p.title, pv.variant_name, pv.stock \
  FROM product_variants pv \
  JOIN products p ON pv.product_id = p.id \
  WHERE pv.stock < 10 \
  ORDER BY pv.stock ASC;"
```

### Database Maintenance

```bash
# Vacuum and analyze
psql -U postgres -d agape_wone -c "VACUUM ANALYZE;"

# Reindex all tables
psql -U postgres -d agape_wone -c "REINDEX DATABASE agape_wone;"

# Check table sizes
psql -U postgres -d agape_wone -c "\
  SELECT relname AS table_name, \
         pg_size_pretty(pg_total_relation_size(relid)) AS size \
  FROM pg_catalog.pg_statio_user_tables \
  ORDER BY pg_total_relation_size(relid) DESC;"
```

---

## 🔄 Queue Management

### Checking Queue Status

```bash
# Via Redis CLI
redis-cli -h localhost -p 6379

# List all queues
KEYS bull:*:id

# Check waiting jobs in email queue
LLEN bull:email:wait

# Check failed jobs
LLEN bull:email:failed
```

### Processing Stuck Jobs

```bash
# Via API (requires admin token)
curl -X POST http://localhost:3000/api/v1/admin/queues/email/process \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Retry failed jobs
curl -X POST http://localhost:3000/api/v1/admin/queues/email/retry-failed \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Clear completed jobs
curl -X DELETE http://localhost:3000/api/v1/admin/queues/email/completed \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Manual Job Triggering

```bash
# Manually trigger reconciliation
curl -X POST http://localhost:3000/api/v1/admin/reconciliation/trigger \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromDate": "2025-10-01",
    "toDate": "2025-10-13"
  }'
```

---

## 🔍 Troubleshooting

### Application Won't Start

**Problem:** Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm run dev
```

**Problem:** Cannot connect to database
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
psql -h localhost -U postgres -d agape_looks

# Restart PostgreSQL
docker-compose restart postgres
```

**Problem:** Redis connection failed
```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli -h localhost -p 6379 ping

# Restart Redis
docker-compose restart redis
```

### High Memory Usage

```bash
# Check Node.js memory
docker stats agape_app

# Check for memory leaks
node --inspect src/server.js

# Restart application
docker-compose restart app
```

### Slow Queries

```bash
# Enable query logging (temporarily)
# Add to .env:
# DB_LOG_QUERIES=true

# View slow queries in logs
tail -f logs/combined.log | grep "duration"

# Check PostgreSQL slow queries
psql -U postgres -d agape_wone -c "\
  SELECT query, calls, total_time, mean_time \
  FROM pg_stat_statements \
  ORDER BY mean_time DESC \
  LIMIT 10;"
```

### Payment Webhook Issues

```bash
# Check webhook logs
tail -f logs/combined.log | grep webhook

# Verify Paystack webhook secret
echo $PAYSTACK_WEBHOOK_SECRET

# Test webhook locally (use ngrok for testing)
ngrok http 3000

# Update Paystack webhook URL to ngrok URL
```

---

## 🔧 Maintenance Tasks

### Daily Tasks

```bash
# 1. Check application health
curl http://localhost:3000/healthz

# 2. Monitor error logs
tail -n 50 logs/error.log

# 3. Check queue backlogs
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/v1/admin/queues/stats

# 4. Verify payment reconciliation ran
tail -f logs/combined.log | grep reconciliation
```

### Weekly Tasks

```bash
# 1. Review audit logs
psql -U postgres -d agape_wone -c "\
  SELECT action, COUNT(*) \
  FROM audit_logs \
  WHERE created_at > NOW() - INTERVAL '7 days' \
  GROUP BY action;"

# 2. Check database size
psql -U postgres -d agape_wone -c "\
  SELECT pg_size_pretty(pg_database_size('agape_wone'));"

# 3. Update dependencies
pnpm update --latest

# 4. Run security audit
pnpm audit
```

### Monthly Tasks

```bash
# 1. Rotate JWT keys (if needed)
./scripts/generate-keys.sh
# Deploy with new keys
# Old keys remain valid for 24 hours

# 2. Review and archive old logs
gzip logs/combined.log.$(date -d '30 days ago' +%Y%m%d)

# 3. Database vacuum
psql -U postgres -d agape_wone -c "VACUUM FULL ANALYZE;"

# 4. Review API usage patterns
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/v1/admin/reports/api-usage
```

### Quarterly Tasks

```bash
# 1. Security audit
pnpm audit --audit-level=moderate

# 2. Performance review
# Run load tests
# Review slow query logs
# Optimize indexes

# 3. Disaster recovery drill
# Test backup restoration
# Verify failover procedures

# 4. Update documentation
# Update runbooks
# Review and update README
```

---

## 📱 Useful Commands Cheat Sheet

### Application

```bash
# Start development
pnpm run dev

# Start production
pnpm start

# Run tests
pnpm test

# Lint code
pnpm run lint

# Format code
pnpm run format
```

### Docker

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart service
docker-compose restart app

# View logs
docker-compose logs -f app

# Execute command in container
docker-compose exec app pnpm run migrate:up

# Rebuild image
docker-compose build app

# Remove all containers and volumes
docker-compose down -v
```

### Database

```bash
# Connect to database
psql -h localhost -U postgres -d agape_wone

# Run migration
pnpm run migrate:up

# Backup
./scripts/backup.sh

# Restore
pg_restore -U postgres -d agape_wone backup.dump
```

### Monitoring

```bash
# Health check
curl http://localhost:3000/healthz

# Metrics
curl http://localhost:3000/metrics

# Queue stats
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/admin/queues/stats
```

---

## 🆘 Getting Help

### Logs Location

```
logs/
├── combined.log     # All logs
├── error.log        # Error logs only
└── exceptions.log   # Uncaught exceptions
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port in use | `lsof -i :3000` and kill process |
| DB connection failed | Check PostgreSQL running: `docker-compose ps` |
| Redis timeout | Restart Redis: `docker-compose restart redis` |
| Migration failed | Rollback: `pnpm run migrate:down` |
| Queue stuck | Clear queue via Redis CLI or admin API |
| High memory | Restart app: `docker-compose restart app` |

### Support Channels

- **Documentation**: `/docs` directory
- **Runbooks**: `/docs/OPERATIONAL_RUNBOOKS.md`
- **Security**: `/docs/SECURITY_CHECKLIST.md`
- **API Docs**: `/docs/API_CONTRACT.md`

---

**Last Updated:** 2025-10-13  
**Version:** 1.0.0
