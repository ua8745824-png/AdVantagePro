# NOVYRA Platform Architecture Document

## 1. System Vision & Core Mission
**NOVYRA** (*Watch. Complete. Earn.*) is an enterprise-grade digital reward and sponsored media engagement platform. Users earn verified rewards (in PKR) by completing sponsored tasks, watching verified partner video content, and referring active peers.

### Compliance & Ethical Foundation
- **No Guaranteed Profit Claims**: All earnings are based on actual task completion and approved advertising sponsor budgets.
- **No Fake Testimonials / Proofs**: All transactions, payouts, and balances are backed by genuine database ledger entries.
- **Deposits are NOT Investments**: Deposits represent user account funding for platform services, campaigns, or verified activities.

---

## 2. High-Level Architecture

```
[ Clients (Web / Mobile Browsers) ]
                 │
           HTTPS │ (REST API / JWT)
                 ▼
[ ASP.NET Core Web API (Kestrel) ]
  ├── Middleware Layer (Global Exception, CORS, Rate Limiting, Auth)
  ├── Controllers Layer (Thin Controllers, DTO Validation)
  ├── Service Layer (Business Logic, Fraud Engine, Ledger Engine)
  ├── Data Access Layer (Entity Framework Core / Raw SQL Transactions)
  └── Uploads & File Storage (Validated, Protected Static Directory)
                 │
                 ▼
[ Microsoft SQL Server ]
  ├── Users & Auth Tables
  ├── Financial Ledger (Wallets & Transactions)
  ├── Tasks, Campaigns & Session Nonces
  ├── Deposits, Withdrawals & Payout Methods
  ├── Notifications & Support Tickets
  └── Audit Logs & System Settings
```

---

## 3. Technology Stack

### Backend
- **Framework:** ASP.NET Core Web API (.NET 10.0 / C#)
- **Data Access:** Entity Framework Core + Microsoft.EntityFrameworkCore.SqlServer
- **Authentication:** JWT (JSON Web Tokens) with refresh-token rotation
- **Password Security:** BCrypt.Net-Next (work factor 11+)
- **API Documentation:** Swashbuckle Swagger UI (OpenAPI 3.0)

### Frontend
- **Framework:** React 18 SPA built with Vite
- **Styling & Design System:** Tailwind CSS with custom NOVYRA brand tokens, dark mode, glassmorphism, and responsive breakpoints
- **Icons & Visuals:** Lucide React + custom SVG geometric branding
- **Routing:** React Router DOM (v6)
- **Multi-language / i18n:** Built-in dynamic i18n system supporting English (LTR), Urdu (RTL), and Roman Urdu (LTR)

### Database
- **Engine:** Microsoft SQL Server
- **Data Integrity:** Foreign keys, unique constraints, check constraints, non-clustered performance indexes, and strict concurrency controls.

---

## 4. Key Architectural Subsystems

### 4.1. Double-Entry Wallet Ledger Subsystem
- Balances are strictly calculated and audited through the immutable `WalletTransactions` ledger.
- Every financial mutation (deposit approval, task reward, referral commission, withdrawal reservation, refund, admin adjustment) is wrapped in atomic transactions with optimistic concurrency checks.

### 4.2. Task Nonce & Duration Verification Subsystem
- The platform creates a server-side `TaskSession` with a cryptographically unique nonce upon initiation.
- The server validates minimum duration elapsed, account standing, daily task limits, and campaign budget caps prior to awarding rewards.
- Frontend timers are purely cosmetic; the backend retains exclusive authority over completion eligibility and credits.

### 4.3. Anti-Fraud & Risk Detection Engine
- Monitors velocity, abnormal completion timestamps, duplicate session claims, and IP/session risk markers.
- Suspicious activity triggers automated `FraudFlags` without exposing internal thresholds to client-side code.

### 4.4. Protected File Storage
- User payment proofs and support attachments are validated for MIME type, file signature, and size.
- Uploaded files are stored with random GUID names in a secure folder accessible only through authorized API endpoints.
