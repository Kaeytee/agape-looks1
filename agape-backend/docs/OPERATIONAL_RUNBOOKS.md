# Operational Runbooks

## 1. Payment Gateway Outage

### Detection
- Webhook failure rate > 5% in 15 minutes
- Paystack status page shows incident
- Multiple payment initialization failures

### Immediate Actions
1. **Enable Maintenance Banner**
   ```bash
   # Update environment variable
   export MAINTENANCE_MODE=true
   # Restart application
   pm2 restart agape-backend
   ```

2. **Pause Marketing Campaigns**
   - Disable paid ads
   - Update website banner
   - Send notification to marketing team

3. **Switch to Manual Order Processing**
   - Document orders in spreadsheet
   - Process payments when gateway restored
   - Send confirmation emails manually

4. **Customer Communication**
   - Post status update on social media
   - Send email to users with pending orders
   - Update website with estimated resolution

### Resolution Steps
1. Monitor Paystack status page
2. Test payment flow in sandbox
3. Enable production traffic gradually
4. Process queued orders
5. Send apology emails with discount codes

### Post-Incident
- Review logs for root cause
- Update monitoring thresholds
- Document lessons learned
- Conduct team retrospective

---

## 2. Failed Webhook Processing

### Detection
- Webhooks stuck in `failed` status
- Orders remain in `pending_payment` after successful Paystack payment
- Customer complaints about delayed confirmations

### Diagnosis
```bash
# Check webhook logs
docker-compose logs app | grep "webhook"

# Query failed webhooks
psql $DATABASE_URL -c "
  SELECT id, event_type, status, error_message, retry_count
  FROM webhook_events
  WHERE status = 'failed'
  ORDER BY created_at DESC
  LIMIT 20;
"
```

### Recovery Actions
1. **Manual Reprocessing**
   ```bash
   # Identify failed webhooks
   # Trigger manual reprocessing via admin endpoint
   curl -X POST https://api.agapelooks.com/api/v1/admin/webhooks/reprocess \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -d '{"webhookId": "webhook-id-here"}'
   ```

2. **Verify Payment Status**
   ```bash
   # Check Paystack directly
   curl https://api.paystack.co/transaction/verify/:reference \
     -H "Authorization: Bearer $PAYSTACK_SECRET_KEY"
   ```

3. **Manual Order Update**
   - Update order status in database
   - Send confirmation emails
   - Generate invoices

---

## 3. Database Failover

### Detection
- Application cannot connect to database
- High connection timeout errors
- Database health check fails

### Immediate Actions
1. **Promote Replica**
   ```bash
   # For managed databases (Render/Railway)
   # Promote read replica via dashboard

   # For self-hosted
   pg_ctl promote -D /var/lib/postgresql/data
   ```

2. **Update Connection String**
   ```bash
   # Update environment variable
   export DATABASE_URL=new-primary-connection-string

   # Restart application
   docker-compose restart app
   ```

3. **Verify Connectivity**
   ```bash
   # Test connection
   psql $DATABASE_URL -c "SELECT NOW();"
   
   # Check application health
   curl https://api.agapelooks.com/healthz
   ```

4. **Monitor Replication Lag**
   ```sql
   SELECT
     client_addr,
     state,
     sent_lsn,
     write_lsn,
     replay_lsn,
     sync_state
   FROM pg_stat_replication;
   ```

### Post-Failover
- Investigate primary failure cause
- Rebuild failed primary as new replica
- Update monitoring alerts
- Document timeline

---

## 4. Inventory Oversell

### Detection
- Stock goes negative in database
- Customer complaints about unavailable products
- Concurrent order errors

### Immediate Actions
1. **Identify Affected Orders**
   ```sql
   SELECT o.id, o.order_number, o.status, oi.product_id, oi.quantity
   FROM orders o
   JOIN order_items oi ON o.id = oi.order_id
   JOIN product_variants pv ON oi.variant_id = pv.id
   WHERE pv.stock < 0;
   ```

2. **Contact Customers**
   - Email affected customers immediately
   - Offer refund or alternative product
   - Provide discount for inconvenience

3. **Correct Stock Levels**
   ```sql
   UPDATE product_variants
   SET stock = 0
   WHERE stock < 0;
   ```

4. **Review Concurrency Issues**
   - Check optimistic locking implementation
   - Review recent deployments
   - Analyze transaction logs

### Prevention
- Enable strict inventory checks
- Increase reservation buffer
- Add monitoring alerts for negative stock
- Implement additional safeguards

---

## 5. Security Incident

### Detection
- Unusual login patterns
- Multiple failed authentication attempts
- Suspicious admin actions in audit logs
- External security alert

### Immediate Actions
1. **Isolate Affected Services**
   ```bash
   # Disable affected endpoints
   # Block suspicious IP addresses via firewall
   
   # For severe incidents, enable maintenance mode
   export MAINTENANCE_MODE=true
   pm2 restart agape-backend
   ```

2. **Revoke Compromised Credentials**
   ```sql
   -- Revoke all sessions for affected user
   UPDATE sessions
   SET revoked_at = NOW()
   WHERE user_id = 'compromised-user-id';
   
   -- Force password reset
   UPDATE users
   SET password_hash = 'REVOKED'
   WHERE id = 'compromised-user-id';
   ```

3. **Rotate Secrets**
   ```bash
   # Generate new JWT keys
   ssh-keygen -t rsa -b 4096 -m PEM -f new-jwt-private.pem
   
   # Update API keys
   # - Paystack
   # - Cloudinary
   # - Resend
   
   # Deploy with new secrets
   ```

4. **Preserve Evidence**
   - Export audit logs
   - Save database snapshot
   - Capture network logs
   - Document timeline

5. **Notify Stakeholders**
   - Inform legal team
   - Notify compliance officer
   - Prepare user communication
   - Contact affected customers if data breach

### Investigation
- Review audit logs
- Analyze access patterns
- Identify entry point
- Assess data exposure
- Document findings

### Recovery
- Deploy security patches
- Update firewall rules
- Enable additional monitoring
- Conduct security audit
- Train team on incident

---

## 6. High Error Rate (5xx)

### Detection
- Error rate > 2% sustained
- Multiple customer complaints
- Monitoring alert triggered

### Diagnosis
```bash
# Check application logs
docker-compose logs --tail=100 app | grep "ERROR"

# Check error distribution
docker-compose logs app | grep "500\|502\|503" | wc -l

# Monitor resource usage
docker stats agape_app
```

### Actions
1. **Identify Root Cause**
   - Database connection pool exhaustion?
   - Redis unavailable?
   - External service timeout?
   - Memory leak?

2. **Quick Fixes**
   ```bash
   # Restart application
   docker-compose restart app
   
   # Scale horizontally if available
   # Railway/Render: Increase instance count
   
   # Increase connection pools if needed
   export DB_POOL_MAX=20
   pm2 restart agape-backend
   ```

3. **Monitor Recovery**
   - Watch error rate decrease
   - Check response times
   - Verify all endpoints responding

---

## 7. Queue Backlog

### Detection
- Email queue > 100 pending jobs
- Invoice generation delayed
- Customer complaints about missing emails

### Actions
```bash
# Check queue statistics
curl https://api.agapewone.com/api/v1/admin/queues/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Scale workers
export QUEUE_CONCURRENCY=10
pm2 restart queue-workers

# Manually process stuck jobs
node scripts/process-queue.js email

# Clear dead jobs
node scripts/clear-failed-jobs.js
```

---

## Emergency Contacts

- **On-Call Engineer**: +234-xxx-xxx-xxxx
-- **DevOps Lead**: devops@agapelooks.com
-- **CTO**: cto@agapelooks.com
- **Paystack Support**: support@paystack.com
- **Cloudinary Support**: support@cloudinary.com

---

## Monitoring Dashboards

-- **Application**: https://dashboard.agapelooks.com
- **Database**: Provider dashboard
- **Redis**: Provider dashboard
- **Logs**: Cloud logging service
- **Alerts**: Slack #alerts channel
