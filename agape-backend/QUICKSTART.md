# 🚀 AGAPE LOOKS Backend - Quick Start Guide

Get the backend running in under 10 minutes!

---

## ⚡ Express Setup (Docker - Recommended)

### Prerequisites
- Docker Desktop installed
- Git installed

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd Agape

# 2. Copy environment file
cp .env.example .env

# 3. Start everything with Docker
docker-compose up -d

# 4. Wait for services (30 seconds)
sleep 30

# 5. Run migrations
docker-compose exec app pnpm run migrate:up

# 6. Check health
curl http://localhost:3000/healthz
```

✅ **Done!** API is running at `http://localhost:3000/api/v1`

---

## 🛠️ Manual Setup (Without Docker)

### Prerequisites
```bash
# Install Node.js 18+
node --version  # Should be v18.x.x or higher

# Install pnpm
npm install -g pnpm
pnpm --version  # Should be 8.x.x or higher
```

### Step 1: Install & Setup

```bash
# Clone repository
git clone <your-repo-url>
cd Agape

# Install dependencies
pnpm install

# Generate JWT keys
./scripts/generate-keys.sh
# Or manually:
# mkdir -p keys
# ssh-keygen -t rsa -b 4096 -m PEM -f keys/jwt-private.pem -N ""
# openssl rsa -in keys/jwt-private.pem -pubout -outform PEM -out keys/jwt-public.pem
```

### Step 2: Setup Database & Redis

**Option A: Use Docker for DB/Redis only**
```bash
docker-compose up -d postgres redis
sleep 15  # Wait for services
```

**Option B: Use local PostgreSQL & Redis**
```bash
# Start PostgreSQL (if installed locally)
# Create database
psql -U postgres
CREATE DATABASE agape_looks;
\q

# Start Redis (if installed locally)
redis-server
```

### Step 3: Configure Environment

```bash
# Copy example
cp .env.example .env

# Edit .env file with your values
nano .env  # or use your preferred editor
```

**Minimum required settings:**
```bash
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=agape_looks
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379

# Add your API keys:
PAYSTACK_SECRET_KEY=sk_test_your_key
CLOUDINARY_CLOUD_NAME=your_cloud
RESEND_API_KEY=re_your_key
```

### Step 4: Run Migrations & Start

```bash
# Run database migrations
pnpm run migrate:up

# Start development server
pnpm run dev
```

✅ **Server running at** `http://localhost:3000`

---

## 🧪 Testing the Installation

### 1. Health Check
```bash
curl http://localhost:3000/healthz
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-13T22:00:00Z",
  "uptime": 60,
  "environment": "development"
}
```

### 2. Register a Test User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "name": "Test User"
  }'
```

### 3. Check Database
```bash
# If using Docker
docker-compose exec postgres psql -U postgres -d agape_looks -c "SELECT COUNT(*) FROM users;"

# If using local PostgreSQL
psql -U postgres -d agape_looks -c "SELECT COUNT(*) FROM users;"
```

---

## 📊 Access Development Tools

### PgAdmin (Database GUI)
```bash
# Start with dev tools
docker-compose --profile dev-tools up -d

# Access at: http://localhost:8080
# Email: admin@agape.com
# Password: admin
```

### Redis Commander (Redis GUI)
```bash
# Access at: http://localhost:8081
```

### View Logs
```bash
# All logs
docker-compose logs -f

# App logs only
docker-compose logs -f app

# PostgreSQL logs
docker-compose logs -f postgres

# Redis logs
docker-compose logs -f redis
```

---

## 🎯 Common Tasks

### Running Tests
```bash
# All tests
pnpm test

# Unit tests only
pnpm run test:unit

# With coverage
pnpm test -- --coverage
```

### Database Operations
```bash
# Create new migration
pnpm run migrate:create add_new_table

# Run migrations
pnpm run migrate:up

# Rollback last migration
pnpm run migrate:down

# Seed sample data
pnpm run seed
```

### Code Quality
```bash
# Lint code
pnpm run lint

# Auto-fix linting issues
pnpm run lint:fix

# Format code
pnpm run format
```

### Stopping Services
```bash
# Stop Docker services
docker-compose down

# Stop and remove data
docker-compose down -v

# Stop dev server (Ctrl+C in terminal)
```

---

## 🔧 Troubleshooting

### Port 3000 already in use
```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 pnpm run dev
```

### Cannot connect to PostgreSQL
```bash
# Check if running
docker-compose ps postgres

# Restart
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Cannot connect to Redis
```bash
# Check if running
docker-compose ps redis

# Restart
docker-compose restart redis

# Test connection
redis-cli ping
```

### Migrations failed
```bash
# Check database connection
psql -h localhost -U postgres -d agape_looks

# Rollback and try again
pnpm run migrate:down
pnpm run migrate:up

# Check migration status
psql -U postgres -d agape_looks -c "SELECT * FROM schema_migrations;"
```

### pnpm command not found
```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

---

## 📚 Next Steps

1. **Read the full documentation:**
   - `/docs/OPERATIONS_GUIDE.md` - Complete operational guide
   - `/docs/API_CONTRACT.md` - API documentation
   - `/docs/DATABASE_SCHEMA.md` - Database structure

2. **Configure external services:**
   - Set up Paystack account (payments)
   - Set up Cloudinary account (media)
   - Set up Resend account (emails)

3. **Test the APIs:**
   - Use Postman or Insomnia
   - Import API collection (if available)
   - Test authentication, products, cart, orders

4. **Deploy to production:**
   - Read `/docs/DEPLOYMENT_GUIDE.md`
   - Set up CI/CD pipeline
   - Configure production environment

---

## 🆘 Need Help?

- **Full Operations Guide:** `/docs/OPERATIONS_GUIDE.md`
- **Deployment Guide:** `/docs/DEPLOYMENT_GUIDE.md`
- **API Documentation:** `/docs/API_CONTRACT.md`
- **Security Checklist:** `/docs/SECURITY_CHECKLIST.md`
- **Troubleshooting:** `/docs/OPERATIONAL_RUNBOOKS.md`

---

## 📞 Key Endpoints to Test

Once running, try these:

```bash
# Health check
curl http://localhost:3000/healthz

# API v1 base
curl http://localhost:3000/api/v1

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Test@1234","name":"Test User"}'

# List products (after seeding)
curl http://localhost:3000/api/v1/products

# Metrics (Prometheus format)
curl http://localhost:3000/metrics
```

---

**🎉 Happy coding! Your backend is ready to go!**
