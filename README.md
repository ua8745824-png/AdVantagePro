# NOVYRA — Watch. Complete. Earn.

> **Enterprise Watch & Earn / Task & Reward Platform**  
> *A production-grade, highly secure system for verified digital tasks and sponsored media engagement.*

---

## 💎 Project Overview

**NOVYRA** is built on clean architectural principles, absolute financial transparency, and strict backend-driven verification:
- **Zero False Promises**: No guaranteed investment returns, no fake payment screenshots, no synthetic testimonials.
- **Double-Entry Ledger**: Every balance mutation is logged with immutable audit trails.
- **Server-Side Verification**: Task durations and completion eligibility are validated exclusively on the server using cryptographic session nonces.
- **Multi-Role RBAC**: Granular authorization for `User`, `Admin`, and `SuperAdmin`.
- **Tri-Lingual & RTL Ready**: Seamless real-time switching between English, Urdu (RTL), and Roman Urdu.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend API** | ASP.NET Core Web API (.NET 10.0 / C#), EF Core |
| **Database** | Microsoft SQL Server |
| **Authentication** | JWT with Refresh Token Rotation & BCrypt Hashing |
| **Frontend SPA** | React 18, Vite, Tailwind CSS, Lucide React |
| **Design System** | Custom NOVYRA Dark Mode, Glassmorphism, Design Tokens |
| **Documentation** | OpenAPI 3.0 / Swagger UI |

---

## 📂 Repository Structure

```
NOVYRA/
│
├── backend/                  # ASP.NET Core Web API
│   ├── Controllers/          # RESTful Controllers
│   ├── Services/             # Domain & Financial Services
│   ├── DTOs/                 # Request & Response Transfer Models
│   ├── Entities/             # EF Core Domain Entities
│   ├── Data/                 # DbContext & Database Configurations
│   ├── Middleware/           # Global Exception & Pipeline Middleware
│   ├── Authentication/       # JWT Handlers & Token Generators
│   ├── Authorization/        # Role & Policy Providers
│   ├── Utilities/            # Validation & Cryptographic Helpers
│   ├── Configuration/        # Strongly Typed Configuration Models
│   └── uploads/              # Protected Upload Directory
│
├── frontend/                 # React SPA (Vite + Tailwind)
│   ├── src/
│   │   ├── components/       # Reusable UI & Layout Components
│   │   ├── layouts/          # Public, User & Admin Layouts
│   │   ├── pages/            # Public, User & Admin Route Views
│   │   ├── services/         # Axios API Client & Endpoint Wrappers
│   │   ├── hooks/            # Custom React Hooks
│   │   ├── context/          # State & Language Providers
│   │   ├── i18n/             # Translations & RTL Dictionary
│   │   ├── utils/            # Formatting & Validation Helpers
│   │   └── assets/           # Media & Brand Assets
│   └── index.html            # Application Root HTML
│
├── database/                 # Database Scripts
│   ├── schema.sql            # Master DDL Schema
│   ├── seed.sql              # Master Seed Data
│   └── README.md             # Database Guidelines
│
├── docs/                     # System Documentation
│   ├── architecture.md       # High-Level Architecture
│   ├── database.md           # Database Specifications
│   ├── api.md                # API Specifications
│   ├── security.md           # Security & Audit Architecture
│   └── testing.md            # QA & Concurrency Test Plan
│
└── README.md                 # Project Overview & Quick Start
```

---

## 🚀 Getting Started

### Prerequisites
- [.NET 8.0 / 10.0 SDK](https://dotnet.microsoft.com/)
- [Node.js v18+ & npm](https://nodejs.org/)
- [SQL Server (LocalDB / Express / Standard)](https://www.microsoft.com/sql-server)

### Running the Backend
```bash
cd backend
dotnet restore
dotnet run
```
API runs on `http://localhost:5000`  
Swagger UI is accessible at `http://localhost:5000/swagger`

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

---

## 📜 Development Phases

- **Phase 0:** Project Initialization *(Completed)*
- **Phase 1:** Database Architecture & Entity Specifications *(Next)*
- **Phase 2:** Authentication & RBAC *(Upcoming)*
- **Phase 3:** Wallet Ledger & Concurrency Foundation *(Upcoming)*
- **Phase 4:** Tasks & Campaign Engine *(Upcoming)*
- **Phase 5:** Referral Network & Commission Engine *(Upcoming)*
- **Phase 6:** Deposit System & Payment Method QR Management *(Upcoming)*
- **Phase 7:** Withdrawal System & Fund Reservation *(Upcoming)*
- **Phase 8:** Support Ticketing & Notification Hub *(Upcoming)*
- **Phase 9:** Public Marketing & Information Portal *(Upcoming)*
- **Phase 10:** User Portal *(Upcoming)*
- **Phase 11:** Enterprise Admin Console *(Upcoming)*
- **Phase 12:** UI/UX & Design System Polish *(Upcoming)*
- **Phase 13:** Security Hardening & Concurrency QA *(Upcoming)*
- **Phase 14:** Full End-to-End Testing *(Upcoming)*
- **Phase 15:** Deployment & Production Operations *(Upcoming)*
