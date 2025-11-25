# AGAPE LOOKS Backend Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 13+ database
- Redis 6+ instance
- Docker (optional)
- GitHub account (for CI/CD)
- Cloud platform account (Render, Railway, or AWS)

## Required Environment Variables

Configure these secrets in your deployment platform:

### Database
```
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=agape_looks
DB_USER=postgres
DB_PASSWORD=your-secure-password
```

### Redis
```
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### JWT Keys
Generate RS256 keys:
```bash
ssh-keygen -t rsa -b 4096 -m PEM -f jwt-private.pem -N ""
openssl rsa -in jwt-private.pem -pubout -outform PEM -out jwt-public.pem
```

Store keys as base64:
```
JWT_PRIVATE_KEY=<base64-encoded-private-key>
JWT_PUBLIC_KEY=<base64-encoded-public-key>
```

### External Services
```
PAYSTACK_SECRET_KEY=sk_live_your_key
PAYSTACK_PUBLIC_KEY=pk_live_your_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RESEND_API_KEY=re_your_api_key

FRONTEND_URL=https://agapewone.com
```

---

## Deployment Options

### Option 1: Deploy to Render

1. **Create PostgreSQL Database**
   - Go to Render Dashboard → New → PostgreSQL
   - Copy the internal connection string

2. **Create Redis Instance**
   - New → Redis
   - Copy the internal connection string

3. **Deploy Backend**
   - New → Web Service
   - Connect GitHub repository
   - Build Command: `npm ci && npm run migrate:up`
   - Start Command: `npm start`
   - Add environment variables from settings

4. **Configure Webhook URL**
   - Set Paystack webhook URL to: `https://your-app.onrender.com/api/v1/payments/webhook`

### Option 2: Deploy to Railway

1. **Create Project**
   ```bash
   railway login
   railway init
   ```

2. **Add PostgreSQL**
   ```bash
   railway add postgresql
   ```

3. **Add Redis**
   ```bash
   railway add redis
   ```

4. **Deploy**
   ```bash
   railway up
   railway run npm run migrate:up
   ```

### Option 3: Docker Deployment

1. **Build Image**
   ```bash
   docker build -t agape-looks-backend .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Run Migrations**
   ```bash
   docker-compose exec app npm run migrate:up
   ```

---

## Database Migration

Always run migrations after deployment:

```bash
npm run migrate:up
```

Rollback if needed:
```bash
npm run migrate:down
```

---

## Health Check

Verify deployment:
```bash
curl https://your-app.com/healthz
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-13T10:30:00Z",
  "uptime": 3600,
  "environment": "production"
}
```

---

## CI/CD Setup (GitHub Actions)

### Required Secrets

Add these to GitHub Settings → Secrets:

**For CI Pipeline:**
- `SNYK_TOKEN` (optional, for security scanning)

**For Deployment:**
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `RENDER_API_KEY` (or Railway token)
- `RENDER_SERVICE_ID`
- `DATABASE_URL`
- `SLACK_WEBHOOK` (optional, for notifications)

### Workflow Triggers

- **CI Pipeline:** Runs on every push/PR to main/develop
- **Deployment:** Runs on push to main branch

---

## Post-Deployment Checklist

- [ ] Run database migrations
- [ ] Verify health endpoint returns 200
- [ ] Test user registration flow
- [ ] Create test order
- [ ] Verify Paystack webhook URL is configured
- [ ] Test payment flow end-to-end
- [ ] Verify emails are being sent via Resend
- [ ] Check Cloudinary image uploads
- [ ] Monitor error logs for 24 hours
- [ ] Set up monitoring alerts
- [ ] Configure backup schedule
- [ ] Document rollback procedure

---

## Monitoring

### Log Aggregation
Application logs are written to:
- `logs/error.log` - Error level logs
- `logs/combined.log` - All logs
- Stdout (for cloud platforms)

### Metrics Endpoint
```
GET /metrics
```
Returns Prometheus-compatible metrics.

### Alerts
Set up alerts for:
- 5xx error rate > 2%
- Payment webhook failures > 5%
- Database connection failures
- Redis unavailability
- High response times (p99 > 5s)

---

## Backup Strategy

### Database Backups
- **Frequency:** Daily at 2 AM UTC
- **Retention:** 30 days
- **Location:** Cloud provider automated backups

### Manual Backup
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
psql $DATABASE_URL < backup_20250113.sql
```

---

## Scaling

### Horizontal Scaling
1. Increase number of instances
2. Ensure load balancer distributes traffic
3. No session state in application servers
4. All state in PostgreSQL and Redis

### Vertical Scaling
1. Increase RAM/CPU for database
2. Upgrade Redis instance
3. Monitor query performance

---

## Troubleshooting

### Issue: Payment webhook not received
**Solution:**
1. Check Paystack dashboard → Settings → Webhooks
2. Verify URL is correct
3. Test webhook manually
4. Check application logs for errors

### Issue: Database connection timeout
**Solution:**
1. Check connection pool settings
2. Verify database is accessible
3. Check firewall rules
4. Increase `DB_CONNECTION_TIMEOUT`

### Issue: Redis connection failed
**Solution:**
1. Application degrades gracefully (logs warning)
2. Check Redis instance status
3. Verify connection string
4. Test with redis-cli

### Issue: Email not sending
**Solution:**
1. Check Resend API key is valid
2. Verify sender email is verified
3. Check queue is processing
4. Review email service logs

---

## Rollback Procedure

1. **Identify Issue**
   - Check logs and metrics
   - Determine if rollback is needed

2. **Rollback Deployment**
   ```bash
   # Render
   Render Dashboard → Deployments → Rollback to previous

   # Railway
   railway rollback

   # Docker
   docker-compose down
   docker-compose up -d <previous-tag>
   ```

3. **Rollback Database**
   ```bash
   npm run migrate:down
   ```

4. **Verify**
   - Check health endpoint
   - Test critical flows
   - Monitor error rates

---

## Security Considerations

- Never commit `.env` file
- Rotate JWT keys every 90 days
- Keep dependencies updated
- Run `npm audit` regularly
- Enable HTTPS only
- Use strong database passwords
- Whitelist IP addresses for admin access
- Enable 2FA for all admin users
- Monitor audit logs for suspicious activity

---

## Support

For deployment issues:
- Check logs first
- Review this guide
-- Contact: devops@agapelooks.com
- Slack: #backend-support
