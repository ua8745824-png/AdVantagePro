# NOVYRA REST API Specifications

## 1. Design Conventions
- **Base URL**: `/api`
- **Content-Type**: `application/json` (or `multipart/form-data` for authorized file uploads)
- **Standard Envelope**:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "errors": null,
  "timestamp": "2026-09-03T16:30:00.000Z"
}
```

---

## 2. API Route Namespaces
- `/api/auth`: Registration, login, refresh token, password reset, session revoke
- `/api/profile`: User profile, password update, notification preferences
- `/api/tasks`: Active tasks list, task session initiation, task completion submission
- `/api/wallet`: Wallet summary, ledger history, balance breakdown
- `/api/deposits`: Payment methods list, deposit submission, proof upload, deposit status
- `/api/withdrawals`: Withdrawal methods, fee estimates, payout submission, withdrawal history
- `/api/referrals`: User referral code, referred users list, commission ledger
- `/api/notifications`: Notifications list, mark as read, unread count
- `/api/support`: Tickets creation, message threads, attachment upload
- `/api/admin/*`: Enterprise admin management endpoints (Users, Tasks, Campaigns, Deposits, Withdrawals, Wallets, Fraud, Audit Logs, Settings)
