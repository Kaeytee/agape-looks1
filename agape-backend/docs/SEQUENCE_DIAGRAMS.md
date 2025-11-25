# Sequence Diagrams

## 1. Payment Flow - Complete End-to-End

```
┌──────┐      ┌──────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐     ┌────────┐
│Client│      │ Backend  │     │   DB    │     │  Redis   │     │Paystack │     │ Queue  │
└──┬───┘      └────┬─────┘     └────┬────┘     └────┬─────┘     └────┬────┘     └───┬────┘
   │                │                │               │                │              │
   │ 1. Create Order│                │               │                │              │
   ├───────────────►│                │               │                │              │
   │                │ 2. Validate    │               │                │              │
   │                ├───────────────►│               │                │              │
   │                │                │               │                │              │
   │                │ 3. Reserve Stock│              │                │              │
   │                ├───────────────►│               │                │              │
   │                ├──────────────────────────────► │                │              │
   │                │      (15 min TTL)              │                │              │
   │                │                │               │                │              │
   │                │ 4. Create Order│               │                │              │
   │                ├───────────────►│               │                │              │
   │   Order Created│◄───────────────┤               │                │              │
   │◄───────────────┤                │               │                │              │
   │   {order_id}   │                │               │                │              │
   │                │                │               │                │              │
   │ 5. Initialize  │                │               │                │              │
   │    Payment     │                │               │                │              │
   ├───────────────►│                │               │                │              │
   │                │ 6. Generate Ref│               │                │              │
   │                │ TXN_xxxxx      │               │                │              │
   │                │                │               │                │              │
   │                │ 7. Store Payment               │                │              │
   │                ├───────────────►│               │                │              │
   │                ├──────────────────────────────► │                │              │
   │                │    (payment intent 20min TTL)  │                │              │
   │                │                │               │                │              │
   │                │ 8. Init Paystack Transaction   │                │              │
   │                ├────────────────────────────────────────────────►│              │
   │                │                │               │                │              │
   │                │ 9. Auth URL    │               │                │              │
   │                │◄────────────────────────────────────────────────┤              │
   │  Payment URL   │                │               │                │              │
   │◄───────────────┤                │               │                │              │
   │                │                │               │                │              │
   │ 10. Redirect to Paystack        │               │                │              │
   ├─────────────────────────────────────────────────────────────────►│              │
   │                │                │               │                │              │
   │ 11. User Completes Payment      │               │                │              │
   │◄────────────────────────────────────────────────────────────────►│              │
   │                │                │               │                │              │
   │                │ 12. Webhook Event              │                │              │
   │                │◄────────────────────────────────────────────────┤              │
   │                │   (charge.success)             │                │              │
   │                │                │               │                │              │
   │                │ 13. Verify Signature           │                │              │
   │                │                │               │                │              │
   │                │ 14. Check Idempotency          │                │              │
   │                ├───────────────►│               │                │              │
   │                │  (event_id)    │               │                │              │
   │                │                │               │                │              │
   │                │ 15. BEGIN TRANSACTION          │                │              │
   │                ├───────────────►│               │                │              │
   │                │                │               │                │              │
   │                │ 16. Update Payment Status=paid │                │              │
   │                ├───────────────►│               │                │              │
   │                │                │               │                │              │
   │                │ 17. Update Order Status=paid   │                │              │
   │                ├───────────────►│               │                │              │
   │                │                │               │                │              │
   │                │ 18. Commit Inventory           │                │              │
   │                ├───────────────►│               │                │              │
   │                │   (optimistic lock, version++)  │                │              │
   │                │                │               │                │              │
   │                │ 19. Create Audit Log           │                │              │
   │                ├───────────────►│               │                │              │
   │                │                │               │                │              │
   │                │ 20. COMMIT     │               │                │              │
   │                ├───────────────►│               │                │              │
   │                │                │               │                │              │
   │                │ 21. Clear Cache│               │                │              │
   │                ├──────────────────────────────► │                │              │
   │                │                │               │                │              │
   │                │ 22. Queue Jobs │               │                │              │
   │                ├───────────────────────────────────────────────────────────────►│
   │                │   - Invoice Generation         │                │              │
   │                │   - Order Confirmation Email   │                │              │
   │                │   - Payment Receipt            │                │              │
   │                │                │               │                │              │
   │  200 OK        │                │               │                │              │
   │◄───────────────┤                │               │                │              │
   │                │                │               │                │              │
```

---

## 2. Refund Flow

```
┌──────┐      ┌──────────┐     ┌─────────┐     ┌──────────┐     ┌────────┐
│Admin │      │ Backend  │     │   DB    │     │Paystack  │     │ Queue  │
└──┬───┘      └────┬─────┘     └────┬────┘     └────┬─────┘     └───┬────┘
   │                │                │               │              │
   │ 1. Request Refund               │               │              │
   ├───────────────►│                │               │              │
   │  {payment_id,  │                │               │              │
   │   amount,      │                │               │              │
   │   reason}      │                │               │              │
   │                │                │               │              │
   │                │ 2. Validate Admin Auth         │              │
   │                │                │               │              │
   │                │ 3. BEGIN TRANSACTION           │              │
   │                ├───────────────►│               │              │
   │                │                │               │              │
   │                │ 4. Get Payment Details         │              │
   │                ├───────────────►│               │              │
   │                │ {gateway_ref,  │               │              │
   │                │  amount,       │               │              │
   │                │  status}       │               │              │
   │                │◄───────────────┤               │              │
   │                │                │               │              │
   │                │ 5. Validate Payment Status     │              │
   │                │    (must be 'paid')            │              │
   │                │                │               │              │
   │                │ 6. Create Refund Record        │              │
   │                ├───────────────►│               │              │
   │                │  status='requested'            │              │
   │                │                │               │              │
   │                │ 7. Call Paystack Refund API    │              │
   │                ├────────────────────────────────►│              │
   │                │                │               │              │
   │                │ 8. Refund Response             │              │
   │                │◄────────────────────────────────┤              │
   │                │ {refund_id}    │               │              │
   │                │                │               │              │
   │                │ 9. Update Refund Record        │              │
   │                ├───────────────►│               │              │
   │                │  gateway_ref=refund_id         │              │
   │                │                │               │              │
   │                │ 10. Update Order Status        │              │
   │                ├───────────────►│               │              │
   │                │  status='refunded'             │              │
   │                │                │               │              │
   │                │ 11. Create Audit Log           │              │
   │                ├───────────────►│               │              │
   │                │                │               │              │
   │                │ 12. COMMIT     │               │              │
   │                ├───────────────►│               │              │
   │                │                │               │              │
   │                │ 13. Queue Notification         │              │
   │                ├───────────────────────────────────────────────►│
   │                │   (refund confirmation email)  │              │
   │                │                │               │              │
   │  Refund Success│                │               │              │
   │◄───────────────┤                │               │              │
   │                │                │               │              │
```

---

## 3. Webhook Idempotency Handling

```
┌──────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│Paystack  │     │ Backend  │     │   DB    │     │  Redis   │
└────┬─────┘     └────┬─────┘     └────┬────┘     └────┬─────┘
     │                │                │               │
     │ 1. POST /webhook│               │               │
     ├───────────────►│                │               │
     │ {event_id,     │                │               │
     │  event_type,   │                │               │
     │  data: {...}}  │                │               │
     │                │                │               │
     │                │ 2. Verify Signature            │
     │                │    (HMAC-SHA512)               │
     │                │                │               │
     │                │ 3. Check Duplicate Event       │
     │                ├───────────────►│               │
     │                │  WHERE event_id = ?            │
     │                │                │               │
     │                │ Exists?        │               │
     │                │◄───────────────┤               │
     │                │                │               │
     │                │ IF DUPLICATE:  │               │
     │  200 OK        │  Return 200    │               │
     │◄───────────────┤  {status: 'duplicate'}         │
     │  (idempotent)  │                │               │
     │                │                │               │
     │                │ IF NEW:        │               │
     │                │ 4. Store Event │               │
     │                ├───────────────►│               │
     │                │  status='processing'           │
     │                │                │               │
     │                │ 5. Process Event               │
     │                │    (update payment, order)     │
     │                │                │               │
     │                │ 6. Mark Processed              │
     │                ├───────────────►│               │
     │                │  status='processed'            │
     │                │  processed_at=NOW()            │
     │                │                │               │
     │  200 OK        │                │               │
     │◄───────────────┤                │               │
     │                │                │               │
```

---

## 4. Inventory Reservation & Release

```
┌──────┐      ┌──────────┐     ┌─────────┐     ┌──────────┐
│Client│      │ Backend  │     │   DB    │     │  Redis   │
└──┬───┘      └────┬─────┘     └────┬────┘     └────┬─────┘
   │                │                │               │
   │ Checkout Flow  │                │               │
   │                │                │               │
   │                │ 1. Check Stock (Optimistic Lock)
   │                ├───────────────►│               │
   │                │  SELECT stock, version         │
   │                │  WHERE id = ? FOR UPDATE       │
   │                │                │               │
   │                │ 2. Validate    │               │
   │                │  stock >= qty  │               │
   │                │                │               │
   │                │ 3. Create Reservation          │
   │                ├───────────────►│               │
   │                │  reserved_until = NOW() + 15min│
   │                │                │               │
   │                │ 4. Cache in Redis              │
   │                ├──────────────────────────────► │
   │                │  TTL = 15 minutes              │
   │                │                │               │
   │                │ --- User Pays ---              │
   │                │                │               │
   │                │ 5. Commit Reservation          │
   │                ├───────────────►│               │
   │                │  UPDATE stock = stock - qty    │
   │                │  WHERE version = ? (optimistic)│
   │                │  version = version + 1         │
   │                │                │               │
   │                │ 6. Mark Released               │
   │                ├───────────────►│               │
   │                │  released_at = NOW()           │
   │                │                │               │
   │                │ 7. Clear Redis │               │
   │                ├──────────────────────────────► │
   │                │                │               │
   │                │ --- OR: Expires ---            │
   │                │                │               │
   │                │ 8. Cleanup Job (Cron)          │
   │                │  Release WHERE reserved_until < NOW()
   │                │                │               │
```

---

## 5. Cart Merge on Login

```
┌──────┐      ┌──────────┐     ┌─────────┐     ┌──────────┐
│Client│      │ Backend  │     │   DB    │     │  Redis   │
└──┬───┘      └────┬─────┘     └────┬────┘     └────┬─────┘
   │                │                │               │
   │ Login Request  │                │               │
   ├───────────────►│                │               │
   │ {email, pwd,   │                │               │
   │  sessionId}    │                │               │
   │                │                │               │
   │                │ 1. Authenticate User           │
   │                │                │               │
   │                │ 2. Get Guest Cart              │
   │                ├──────────────────────────────► │
   │                │  cart:session:{sessionId}      │
   │                │                │               │
   │                │ 3. Get User Cart               │
   │                ├──────────────────────────────► │
   │                │  cart:user:{userId}            │
   │                │  (or from DB)  │               │
   │                │                │               │
   │                │ 4. Merge Items │               │
   │                │  - For each guest item:        │
   │                │    * If exists in user cart:   │
   │                │      Add quantities            │
   │                │    * Else: Add new item        │
   │                │                │               │
   │                │ 5. Save Merged Cart            │
   │                ├───────────────►│               │
   │                ├──────────────────────────────► │
   │                │                │               │
   │                │ 6. Delete Guest Cart           │
   │                ├──────────────────────────────► │
   │                │  DEL cart:session:{sessionId}  │
   │                │                │               │
   │  Merged Cart   │                │               │
   │◄───────────────┤                │               │
   │                │                │               │
```

---

## Key Design Patterns

### 1. Idempotency
- Event ID tracking for webhooks
- Unique constraint on `webhook_events.event_id`
- Return 200 with status for duplicates

### 2. Optimistic Locking
- Version field on `product_variants`
- Increment on every stock update
- Retry if version mismatch detected

### 3. Two-Phase Inventory
- **Phase 1**: Reserve with TTL (soft lock)
- **Phase 2**: Commit on payment (hard lock)
- Automatic cleanup for expired reservations

### 4. Transactional Consistency
- DB transactions for critical paths
- All-or-nothing updates
- Rollback on any failure

### 5. Async Processing
- Queue jobs after transaction commit
- Email, invoice generation, notifications
- Retry with exponential backoff
