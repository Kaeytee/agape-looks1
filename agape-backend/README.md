# AGAPE LOOKS Backend System

Production-grade, modular, high-availability e-commerce backend built with Node.js, PostgreSQL, Redis, and modern best practices.

## 🏗️ Architecture Overview

### **Core Principles**
- **Stateless Application Servers**: Horizontal scaling via container orchestration
- **Strong Consistency**: ACID transactions for orders and payments
- **Idempotent Operations**: Webhook and API retry safety
- **Optimistic Concurrency**: Inventory management with versioning
- **Security-First**: PCI compliance, RS256 JWT, encrypted PII
- **Observability**: Structured logging, distributed tracing, comprehensive metrics

### **Service Modules**
1. **Auth Service**: Registration, JWT authentication, 2FA, RBAC
2. **Product Catalog**: CRUD, full-text search, caching, metadata management
3. **Inventory Service**: Stock tracking, reservations, optimistic locking
4. **Cart Service**: Redis-backed carts with PostgreSQL persistence
5. **Order & Billing**: State machine, invoice generation, lifecycle management
6. **Payments Service**: Paystack integration, webhooks, reconciliation, refunds
7. **Notifications**: Resend email, templating, queue-based delivery
8. **Media Service**: Cloudinary integration, transformations, CDN
9. **Admin & Reporting**: Business analytics, exports, audit logs
10. **Health & Metrics**: Prometheus metrics, health checks

---

## 🚀 Quick Start

> **⚡ Fast Track:** See [QUICKSTART.md](./QUICKSTART.md) for a 5-minute setup guide!

### **Prerequisites**
- Node.js >= 18.0.0
- pnpm >= 8.0.0 (Install: `npm install -g pnpm`)
- PostgreSQL >= 13
- Redis >= 6
- Docker & Docker Compose (optional but recommended)

### **Installation**

```bash
# Clone repository
git clone <repository-url>
cd Agape

# Install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env

# Generate JWT keys (RS256)
mkdir -p keys
ssh-keygen -t rsa -b 4096 -m PEM -f keys/jwt-private.pem -N ""
openssl rsa -in keys/jwt-private.pem -pubout -outform PEM -out keys/jwt-public.pem

# Configure .env with your credentials
# Edit .env and add: PostgreSQL, Redis, Paystack, Cloudinary, Resend credentials

# Run database migrations
pnpm run migrate:up

# Seed initial data (optional)
pnpm run seed

# Start development server
pnpm run dev
```

### **Docker Quick Start**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### **Development Tools**

```bash
# Start with dev tools (Redis Commander, PgAdmin)
docker-compose --profile dev-tools up -d

# Access tools
# PgAdmin: http://localhost:8080
# Redis Commander: http://localhost:8081
```

---

## 📖 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get running in 5 minutes
- **[Operations Guide](./docs/OPERATIONS_GUIDE.md)** - Complete operational manual
- **[API Contract](./docs/API_CONTRACT.md)** - Full API specification  
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - ERD and table definitions
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Security Checklist](./docs/SECURITY_CHECKLIST.md)** - Security audit
- **[Sequence Diagrams](./docs/SEQUENCE_DIAGRAMS.md)** - System flows
- **[Operational Runbooks](./docs/OPERATIONAL_RUNBOOKS.md)** - Incident response
- **[Incident Response Plan](./docs/INCIDENT_RESPONSE_PLAN.md)** - Security incidents

---

## 📚 API Documentation

### **Base URL**
```
Development: http://localhost:3000/api/v1
Production: https://api.agapelooks.com/api/v1
```

### **Authentication**
Most endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <access_token>
```

### **Rate Limiting**
- **Auth endpoints**: 5 requests/minute
- **Public endpoints**: 100 requests/minute
- **Admin endpoints**: 200 requests/minute

### **Error Response Format**
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "userMessage": "Please provide a valid email address",
  "timestamp": "2025-10-13T22:03:26Z",
  "requestId": "req_abc123",
  "details": []
}
```

### **Key Endpoints**

#### **Auth Service**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `POST /auth/verify-email` - Email verification
- `POST /auth/password-reset-request` - Request password reset
- `POST /auth/password-reset` - Reset password
- `GET /auth/sessions` - List active sessions
- `POST /auth/sessions/:id/revoke` - Revoke session
- `POST /auth/2fa/enable` - Enable 2FA
- `POST /auth/2fa/disable` - Disable 2FA

#### **Products**
- `GET /products` - List products (filters, pagination, search)
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin)
- `PATCH /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

#### **Cart**
- `GET /cart` - Get user cart
- `POST /cart/items` - Add item to cart
- `PATCH /cart/items/:id` - Update cart item
- `DELETE /cart/items/:id` - Remove cart item
- `POST /cart/merge` - Merge guest cart to user cart
- `DELETE /cart` - Clear cart

#### **Orders**
- `POST /orders` - Create order
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details
- `POST /orders/:id/cancel` - Cancel order

#### **Payments**
- `POST /payments/initialize` - Initialize payment
- `POST /payments/webhook` - Paystack webhook receiver
- `POST /payments/:id/verify` - Verify payment
- `POST /payments/:id/refund` - Refund payment (admin)

#### **Admin**
- `GET /admin/orders` - List all orders
- `PATCH /admin/orders/:id` - Update order status
- `GET /admin/reports/sales` - Sales reports
- `GET /admin/reports/inventory` - Inventory reports
- `POST /admin/refunds` - Process refunds

#### **Media**
- `POST /media/upload` - Upload image
- `DELETE /media/:publicId` - Delete image

#### **Health**
- `GET /healthz` - Health check
- `GET /metrics` - Prometheus metrics

---

## 🗄️ Database Schema

### **Core Tables**

#### **users**
```sql
id UUID PRIMARY KEY
email VARCHAR(255) UNIQUE NOT NULL
phone VARCHAR(50)
name VARCHAR(255)
password_hash VARCHAR(255) NOT NULL
role VARCHAR(50) DEFAULT 'customer'
verified_at TIMESTAMP
two_factor_secret VARCHAR(255)
two_factor_enabled BOOLEAN DEFAULT FALSE
failed_login_attempts INT DEFAULT 0
locked_until TIMESTAMP
metadata JSONB
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
last_login TIMESTAMP
```

#### **sessions**
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id) ON DELETE CASCADE
refresh_token_hash VARCHAR(255) NOT NULL
device_info VARCHAR(500)
ip_address VARCHAR(45)
user_agent TEXT
created_at TIMESTAMP DEFAULT NOW()
expires_at TIMESTAMP NOT NULL
revoked_at TIMESTAMP
```

#### **products**
```sql
id UUID PRIMARY KEY
sku VARCHAR(100) UNIQUE NOT NULL
title VARCHAR(500) NOT NULL
description TEXT
price DECIMAL(10,2) NOT NULL
currency VARCHAR(3) DEFAULT 'NGN'
weight DECIMAL(10,2)
dimensions JSONB
category_id UUID REFERENCES categories(id)
is_active BOOLEAN DEFAULT TRUE
metadata JSONB
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

#### **product_variants**
```sql
id UUID PRIMARY KEY
product_id UUID REFERENCES products(id) ON DELETE CASCADE
variant_name VARCHAR(255)
sku VARCHAR(100) UNIQUE NOT NULL
price_delta DECIMAL(10,2) DEFAULT 0
stock INT DEFAULT 0
version INT DEFAULT 1
metadata JSONB
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

#### **orders**
```sql
id UUID PRIMARY KEY
order_number VARCHAR(50) UNIQUE NOT NULL
user_id UUID REFERENCES users(id)
status VARCHAR(50) NOT NULL
subtotal DECIMAL(10,2) NOT NULL
tax DECIMAL(10,2) DEFAULT 0
shipping DECIMAL(10,2) DEFAULT 0
total DECIMAL(10,2) NOT NULL
currency VARCHAR(3) DEFAULT 'NGN'
shipping_address JSONB
billing_address JSONB
metadata JSONB
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

#### **payments**
```sql
id UUID PRIMARY KEY
order_id UUID REFERENCES orders(id)
gateway VARCHAR(50) NOT NULL
gateway_ref VARCHAR(255) UNIQUE
amount DECIMAL(10,2) NOT NULL
currency VARCHAR(3) DEFAULT 'NGN'
status VARCHAR(50) NOT NULL
raw_response JSONB
created_at TIMESTAMP DEFAULT NOW()
settled_at TIMESTAMP
```

[See full schema in `/docs/database-schema.md`]

---

## 🔐 Security

### **Authentication & Authorization**
- **JWT with RS256**: Asymmetric key signing
- **Short-lived access tokens**: 15 minutes
- **Long-lived refresh tokens**: 30 days (httpOnly cookies)
- **RBAC**: customer, admin, merchant, fulfilment, finance roles
- **2FA/TOTP**: Optional two-factor authentication

### **Data Protection**
- **No card storage**: Paystack tokenization only
- **PII encryption**: Phone numbers hashed at rest
- **Password policy**: Min 8 chars, complexity requirements
- **Account lockout**: 5 failed attempts = 15 min lockout
- **SQL injection prevention**: Parameterized queries only

### **API Security**
- **HTTPS only**: HSTS enabled
- **Webhook signature verification**: HMAC validation
- **Rate limiting**: Per-endpoint limits
- **Input validation**: Joi schemas on all inputs
- **CORS**: Whitelist-based origin control

### **Compliance**
- **PCI DSS**: Scope minimized, no card data storage
- **GDPR**: Data export, deletion, retention policies
- **Audit logs**: All critical actions logged

---

## 🧪 Testing

### **Test Suites**

```bash
# Run all tests
pnpm test

# Unit tests only
pnpm run test:unit

# Integration tests
pnpm run test:integration

# E2E tests
pnpm run test:e2e

# Coverage report
pnpm test -- --coverage
```

### **Coverage Requirements**
- **Critical modules** (auth, payments, orders): >80%
- **Overall**: >70%

### **Test Categories**
1. **Unit Tests**: Module-level logic testing
2. **Integration Tests**: Database and external API integration
3. **E2E Tests**: Full user flow simulation
4. **Load Tests**: Concurrent checkout scenarios
5. **Security Tests**: SAST, dependency scanning

---

## 🔄 Payment Flow

### **Initialization**
1. Client creates order via `POST /orders`
2. Backend reserves inventory (15-min TTL)
3. Backend creates payment intent
4. Client calls `POST /payments/initialize` with order ID
5. Backend calls Paystack initialize API
6. Backend stores payment reference in Redis + DB
7. Backend returns authorization URL to client

### **Completion**
1. User completes payment on Paystack
2. Paystack sends webhook to `POST /payments/webhook`
3. Backend verifies signature
4. Backend checks event idempotency
5. **DB Transaction Begin**:
   - Update payment status to `paid`
   - Update order status to `processing`
   - Commit inventory reservation
   - Create audit log
6. **Transaction Commit**
7. Enqueue async jobs:
   - Generate invoice PDF
   - Send confirmation email
   - Notify merchant
   - Trigger fulfillment

### **Refunds**
1. Admin initiates refund via `POST /payments/:id/refund`
2. Backend creates refund record
3. Backend calls Paystack refund API
4. Backend updates refund status
5. Backend marks order as refunded
6. Send refund notification email

### **Reconciliation**
- **Daily job** (2 AM): Pull Paystack transactions
- Match gateway_ref to orders
- Flag mismatches for manual review
- Generate CSV report
- Email finance team

---

## 📊 Monitoring & Observability

### **Metrics (Prometheus)**
Access: `http://localhost:9090/metrics`

**Key Metrics:**
- Request latency (p50, p90, p99)
- Error rates (4xx, 5xx)
- Queue backlog size
- Payment success rate
- Inventory oversell attempts
- DB connection pool usage
- Redis memory usage

### **Structured Logging**
```json
{
  "level": "info",
  "timestamp": "2025-10-13T22:03:26Z",
  "service": "payments",
  "traceId": "trace_abc123",
  "requestId": "req_xyz789",
  "userId": "hashed_user_id",
  "message": "Payment initialized successfully",
  "metadata": {
    "orderId": "AGP123456",
    "amount": 50000,
    "currency": "NGN"
  }
}
```

### **Alerts**
- Payment webhook failures >5% in 15 min
- Error rate >2% sustained
- Queue backlog >100 jobs
- DB connection exhaustion
- Redis memory >80%

### **Dashboards**
1. **Payment Dashboard**: Transactions/hr, success %, processing time
2. **Operations Dashboard**: CPU, memory, latency, errors
3. **Business Dashboard**: Orders/hr, revenue, AOV

---

## 🚀 Deployment

### **CI/CD Pipeline**

```yaml
# Automated pipeline:
1. Code commit to main branch
2. Run linters (ESLint)
3. Run security scans (npm audit, Snyk)
4. Run unit tests
5. Run integration tests
6. Build Docker image
7. Push to private registry
8. Deploy to staging
9. Run smoke tests
10. Canary deployment to production (10%)
11. Monitor metrics for 15 minutes
12. Full production rollout or automatic rollback
```

### **Database Migrations**

```bash
# Create migration
pnpm run migrate:create add_user_column

# Run migrations
pnpm run migrate:up

# Rollback migration
pnpm run migrate:down
```

### **Environment Setup**

**Staging**: Mirrors production scale
**Production**: Auto-scaling groups behind load balancer

---

## 📁 Project Structure

```
Agape/
├── src/
│   ├── server.js                 # Application entry point
│   ├── app.js                    # Express app configuration
│   ├── config/                   # Configuration management
│   │   ├── index.js
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── jwt.js
│   ├── database/                 # Database layer
│   │   ├── connection.js
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── models/
│   ├── services/                 # Business logic modules
│   │   ├── auth/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── notifications/
│   │   ├── media/
│   │   ├── admin/
│   │   └── reporting/
│   ├── middleware/               # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── ratelimit.middleware.js
│   │   ├── error.middleware.js
│   │   └── logging.middleware.js
│   ├── utils/                    # Utility functions
│   │   ├── logger.js
│   │   ├── errors.js
│   │   ├── validators.js
│   │   └── crypto.js
│   ├── integrations/             # External API clients
│   │   ├── paystack.client.js
│   │   ├── cloudinary.client.js
│   │   └── resend.client.js
│   └── queues/                   # BullMQ job processors
│       ├── email.queue.js
│       ├── invoice.queue.js
│       └── reconciliation.queue.js
├── tests/                        # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                         # Documentation
│   ├── api-contract.md
│   ├── database-schema.md
│   ├── sequence-diagrams/
│   └── runbooks/
├── scripts/                      # Utility scripts
│   ├── init-db.sql
│   ├── generate-keys.sh
│   └── backup.sh
├── .github/                      # GitHub Actions
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛠️ Operational Runbooks

### **Payment Gateway Outage**
1. Detect via webhook failure rate monitoring
2. Enable maintenance mode banner
3. Pause advertising campaigns
4. Switch to manual order intake
5. Notify customers via email
6. Monitor Paystack status page
7. Resume after confirmation

### **Database Failover**
1. Detect primary DB failure
2. Promote read replica to primary
3. Update connection strings
4. Restart application pods
5. Verify health checks pass
6. Monitor replication lag
7. Post-incident review

### **Inventory Oversell**
1. Identify affected orders via audit logs
2. Contact affected customers
3. Offer refund or alternative product
4. Run inventory reconciliation job
5. Adjust stock levels
6. Review concurrency controls
7. Implement additional safeguards

[Full runbooks in `/docs/runbooks/`]

---

## 🔧 Troubleshooting

### **PostgreSQL Authentication Errors**

If you encounter `password authentication failed for user "postgres"`, follow these steps:

```bash
# Reset PostgreSQL password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Create database if it doesn't exist
sudo -u postgres psql -c "CREATE DATABASE agape_wone OWNER postgres;"
# Create database if it doesn't exist
sudo -u postgres psql -c "CREATE DATABASE agape_looks OWNER postgres;"

# Update .env file with the new password
sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=postgres/' .env

# Test connection
psql -h localhost -U postgres -d agape_wone -c "SELECT NOW();"
# Test connection
psql -h localhost -U postgres -d agape_looks -c "SELECT NOW();"
```

### **Redis Installation and Configuration**

If Redis is not installed on your system:

```bash
# Install Redis on Ubuntu/Debian
sudo apt update
sudo apt install -y redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping  # Should return PONG

# Check Redis service status
sudo systemctl status redis-server
```

### **Common Issues**

#### **Port 3000 Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### **Node Module Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### **Migration Errors**
```bash
# Reset migrations (CAUTION: This will drop all data)
pnpm run migrate:down:all
pnpm run migrate:up
```

#### **JWT Key Generation Issues**
```bash
# Ensure keys directory exists
mkdir -p keys

# Generate new keys
ssh-keygen -t rsa -b 4096 -m PEM -f keys/jwt-private.pem -N ""
openssl rsa -in keys/jwt-private.pem -pubout -outform PEM -out keys/jwt-public.pem

# Set proper permissions
chmod 600 keys/jwt-private.pem
chmod 644 keys/jwt-public.pem
```

#### **Database Connection Pool Exhausted**
```bash
# Check current connections
psql -h localhost -U postgres -d agape_wone -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'agape_wone';"
psql -h localhost -U postgres -d agape_looks -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'agape_looks';"

# Increase pool size in .env
DB_POOL_MAX=20  # Default is 10
```

### **Health Check Endpoints**

Verify system health using these endpoints:

```bash
# Application health
curl http://localhost:3000/healthz

# Prometheus metrics
curl http://localhost:9090/metrics

# Check logs
tail -f logs/combined.log
```

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📞 Support

- **Email**: support@agapewone.com
- **Documentation**: https://docs.agapewone.com
- **Status Page**: https://status.agapewone.com
-- **Email**: support@agapelooks.com
-- **Documentation**: https://docs.agapelooks.com
-- **Status Page**: https://status.agapelooks.com

**Built with ❤️ by the AGAPE LOOKS Team**
---

**Built with ❤️ by the AGAPE WONE Team**
