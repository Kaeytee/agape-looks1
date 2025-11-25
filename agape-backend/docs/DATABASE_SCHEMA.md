# Database Schema Documentation

## Entity Relationship Diagram

```
┌─────────────┐          ┌──────────────┐          ┌────────────────┐
│   users     │          │  categories  │          │   products     │
├─────────────┤          ├──────────────┤          ├────────────────┤
│ id (PK)     │          │ id (PK)      │          │ id (PK)        │
│ email       │          │ name         │◄─────────│ category_id    │
│ name        │          │ slug         │          │ sku            │
│ password    │          │ parent_id    │          │ title          │
│ role        │          └──────────────┘          │ description    │
│ verified_at │                                     │ price          │
└──────┬──────┘                                     │ is_active      │
       │                                            └────────┬───────┘
       │                                                     │
       │            ┌────────────────┐                      │
       │            │  sessions      │                      │
       └───────────►├────────────────┤                      │
                    │ id (PK)        │                      │
                    │ user_id (FK)   │                      │
                    │ refresh_token  │                      │
                    │ expires_at     │                      │
                    └────────────────┘                      │
                                                            │
       ┌────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────┐          ┌─────────────────┐
│product_variants │          │ product_images  │
├─────────────────┤          ├─────────────────┤
│ id (PK)         │          │ id (PK)         │
│ product_id (FK) │          │ product_id (FK) │
│ variant_name    │          │ url             │
│ stock           │          │ public_id       │
│ version         │          │ position        │
└────────┬────────┘          └─────────────────┘
         │
         │           ┌──────────────────────┐
         └──────────►│inventory_reservations│
                     ├──────────────────────┤
                     │ id (PK)              │
                     │ order_id (FK)        │
                     │ product_variant_id   │
                     │ quantity             │
                     │ reserved_until       │
                     └──────────────────────┘

┌─────────────┐          ┌─────────────────┐          ┌──────────────┐
│   orders    │          │  order_items    │          │   payments   │
├─────────────┤          ├─────────────────┤          ├──────────────┤
│ id (PK)     │◄─────────│ order_id (FK)   │          │ id (PK)      │
│ order_number│          │ product_id (FK) │          │ order_id (FK)│
│ user_id (FK)│          │ variant_id (FK) │          │ gateway      │
│ status      │          │ quantity        │          │ gateway_ref  │
│ subtotal    │          │ price_snapshot  │          │ amount       │
│ tax         │          └─────────────────┘          │ status       │
│ shipping    │                                        │ settled_at   │
│ total       │                                        └──────────────┘
└─────────────┘

┌─────────────────┐          ┌──────────────────┐
│    refunds      │          │ webhook_events   │
├─────────────────┤          ├──────────────────┤
│ id (PK)         │          │ id (PK)          │
│ payment_id (FK) │          │ gateway          │
│ order_id (FK)   │          │ event_id         │
│ amount          │          │ event_type       │
│ gateway_ref     │          │ payload          │
│ status          │          │ status           │
└─────────────────┘          │ processed_at     │
                             └──────────────────┘

┌──────────────┐          ┌─────────────────┐
│   coupons    │          │   audit_logs    │
├──────────────┤          ├─────────────────┤
│ id (PK)      │          │ id (PK)         │
│ code         │          │ actor_id (FK)   │
│ type         │          │ action          │
│ amount       │          │ entity          │
│ expires_at   │          │ entity_id       │
│ usage_limit  │          │ changes         │
│ used_count   │          │ created_at      │
└──────────────┘          └─────────────────┘
```

---

## Table Definitions

### users
**Purpose:** Store user account information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| phone | VARCHAR(50) | | User phone number |
| name | VARCHAR(255) | NOT NULL | Full name |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| role | VARCHAR(50) | DEFAULT 'customer' | User role (customer, admin, etc.) |
| verified_at | TIMESTAMP | | Email verification timestamp |
| two_factor_secret | VARCHAR(255) | | TOTP secret for 2FA |
| two_factor_enabled | BOOLEAN | DEFAULT FALSE | 2FA status |
| failed_login_attempts | INTEGER | DEFAULT 0 | Failed login counter |
| locked_until | TIMESTAMP | | Account lockout expiry |
| metadata | JSONB | DEFAULT '{}' | Additional user data |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |
| last_login | TIMESTAMP | | Last successful login |

**Indexes:**
- `idx_users_email` ON (email)
- `idx_users_role` ON (role)
- `idx_users_verified_at` ON (verified_at) WHERE verified_at IS NOT NULL

---

### products
**Purpose:** Store product catalog

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| sku | VARCHAR(100) | UNIQUE, NOT NULL | Stock keeping unit |
| title | VARCHAR(500) | NOT NULL | Product title |
| description | TEXT | | Product description |
| price | DECIMAL(10,2) | NOT NULL, CHECK (price >= 0) | Base price |
| currency | VARCHAR(3) | DEFAULT 'NGN' | Currency code |
| weight | DECIMAL(10,2) | | Product weight |
| dimensions | JSONB | | Width, height, length |
| category_id | UUID | FOREIGN KEY | Category reference |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| metadata | JSONB | DEFAULT '{}' | Tags, features, etc. |
| search_vector | tsvector | | Full-text search index |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_products_sku` ON (sku)
- `idx_products_category_id` ON (category_id)
- `idx_products_is_active` ON (is_active)
- `idx_products_search_vector` ON (search_vector) USING gin
- `idx_products_title_trgm` ON (title) USING gin

---

### product_variants
**Purpose:** Product variations (sizes, colors, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| product_id | UUID | FOREIGN KEY, NOT NULL | Parent product |
| variant_name | VARCHAR(255) | | Variant label |
| sku | VARCHAR(100) | UNIQUE, NOT NULL | Variant SKU |
| price_delta | DECIMAL(10,2) | DEFAULT 0 | Price adjustment |
| stock | INTEGER | DEFAULT 0, CHECK (stock >= 0) | Available quantity |
| version | INTEGER | DEFAULT 1 | Optimistic lock version |
| metadata | JSONB | DEFAULT '{}' | Additional data |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_product_variants_product_id` ON (product_id)
- `idx_product_variants_sku` ON (sku)
- `idx_product_variants_stock` ON (stock)

---

### orders
**Purpose:** Customer orders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable ID |
| user_id | UUID | FOREIGN KEY | Customer reference |
| status | VARCHAR(50) | NOT NULL | Order status |
| subtotal | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Items total |
| tax | DECIMAL(10,2) | DEFAULT 0 | Tax amount |
| shipping | DECIMAL(10,2) | DEFAULT 0 | Shipping cost |
| total | DECIMAL(10,2) | NOT NULL | Grand total |
| currency | VARCHAR(3) | DEFAULT 'NGN' | Currency code |
| shipping_address | JSONB | | Delivery address |
| billing_address | JSONB | | Billing address |
| metadata | JSONB | DEFAULT '{}' | Coupon, notes, etc. |
| created_at | TIMESTAMP | DEFAULT NOW() | Order date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_orders_order_number` ON (order_number)
- `idx_orders_user_id` ON (user_id)
- `idx_orders_status` ON (status)
- `idx_orders_created_at` ON (created_at)
- `idx_orders_pending_payment` ON (status) WHERE status IN ('pending', 'pending_payment')

**Order Status Values:**
- `pending` - Created, awaiting payment
- `pending_payment` - Payment initiated
- `paid` - Payment confirmed
- `processing` - Being prepared
- `shipped` - In transit
- `delivered` - Completed
- `cancelled` - Cancelled
- `refunded` - Refunded
- `payment_failed` - Payment unsuccessful

---

### payments
**Purpose:** Payment transactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| order_id | UUID | FOREIGN KEY, NOT NULL | Order reference |
| gateway | VARCHAR(50) | NOT NULL | Payment provider |
| gateway_ref | VARCHAR(255) | UNIQUE | Provider reference |
| amount | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Payment amount |
| currency | VARCHAR(3) | DEFAULT 'NGN' | Currency code |
| status | VARCHAR(50) | NOT NULL | Payment status |
| raw_response | JSONB | DEFAULT '{}' | Gateway response |
| created_at | TIMESTAMP | DEFAULT NOW() | Transaction date |
| settled_at | TIMESTAMP | | Settlement date |

**Indexes:**
- `idx_payments_order_id` ON (order_id)
- `idx_payments_gateway_ref` ON (gateway_ref)
- `idx_payments_status` ON (status)
- `idx_payments_created_at` ON (created_at)

---

### inventory_reservations
**Purpose:** Temporary stock holds during checkout

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| order_id | UUID | FOREIGN KEY | Order reference |
| product_variant_id | UUID | FOREIGN KEY, NOT NULL | Variant reserved |
| quantity | INTEGER | NOT NULL, CHECK > 0 | Reserved quantity |
| reserved_until | TIMESTAMP | NOT NULL | Expiry time |
| released_at | TIMESTAMP | | Release timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Reservation date |

**Indexes:**
- `idx_inventory_reservations_order_id` ON (order_id)
- `idx_inventory_reservations_variant_id` ON (product_variant_id)
- `idx_inventory_reservations_expires` ON (reserved_until) WHERE released_at IS NULL

---

### audit_logs
**Purpose:** Track all administrative actions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| actor_id | UUID | FOREIGN KEY | User who performed action |
| actor_role | VARCHAR(50) | | User role at time |
| action | VARCHAR(100) | NOT NULL | Action type |
| entity | VARCHAR(100) | NOT NULL | Affected entity |
| entity_id | UUID | | Entity identifier |
| changes | JSONB | DEFAULT '{}' | Before/after data |
| ip_address | VARCHAR(45) | | IP address |
| user_agent | TEXT | | Browser info |
| created_at | TIMESTAMP | DEFAULT NOW() | Action timestamp |

**Indexes:**
- `idx_audit_logs_actor_id` ON (actor_id)
- `idx_audit_logs_entity` ON (entity, entity_id)
- `idx_audit_logs_created_at` ON (created_at)
- `idx_audit_logs_action` ON (action)

---

## Constraints & Business Rules

1. **Optimistic Locking**: `product_variants.version` must increment on every update
2. **Stock Cannot Go Negative**: CHECK constraint on stock columns
3. **Reservation TTL**: 15 minutes default (configurable)
4. **Email Uniqueness**: Case-insensitive unique constraint
5. **Soft Delete**: Products use `is_active` flag
6. **Audit Trail**: All admin actions logged
7. **Idempotency**: Webhook events tracked by `event_id`

---

## Performance Optimizations

1. **Partial Indexes**: Active orders, unreleased reservations
2. **GIN Indexes**: Full-text search, JSONB queries
3. **Connection Pooling**: 2-10 connections
4. **Query Timeout**: 30 seconds default
5. **Auto-vacuum**: Enabled for high-traffic tables
