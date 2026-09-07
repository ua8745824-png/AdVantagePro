# NOVYRA Security Architecture & Policies

## 1. Authentication & Session Security
- **JWT Architecture**: Access tokens have a short lifespan (15 minutes); refresh tokens are securely stored as cryptographic hashes with 7-day expiration and automatic rotation upon refresh.
- **Revocation**: Refresh tokens are revoked upon logout, password reset, or admin suspension.
- **Password Hashing**: BCrypt with salt rounds >= 11.

---

## 2. Authorization & RBAC
- Role-based authorization enforced strictly at the controller and action levels using `[Authorize(Roles = "...")]`.
- Supported roles: `SuperAdmin`, `Admin`, `User` (with clean architecture for future roles such as `Advertiser`, `FinanceAdmin`, `SupportAgent`).
- Frontend routes are protected by role checks; however, all security boundaries are validated independently on the backend.

---

## 3. Financial & Ledger Security
- **Atomic Concurrency Protection**: High-concurrency operations (e.g., simultaneous withdrawal requests or reward claims) use SQL transaction isolation and rowversion concurrency tokens.
- **Idempotency Safeguards**: Replay attacks and accidental duplicate submissions are prevented through unique transaction references and strict status assertions.

---

## 4. File Upload Security
- Direct user file paths are never used. Uploaded proofs are given random GUID filenames.
- Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`.
- File sizes are capped at 5 MB.
- Content-type validation is verified against magic bytes / file signatures to prevent executable uploads.
- Payment proof files are not exposed via public directory listings; access is governed through authorized endpoints.
