# NOVYRA Quality Assurance & Testing Plan

## 1. Testing Strategy
NOVYRA employs a multi-tiered testing strategy covering compilation, security validation, ledger integrity, concurrency testing, and end-to-end user workflows.

---

## 2. Mandatory Financial Test Scenarios

| Test ID | Scenario | Expected Behavior |
|---|---|---|
| FIN-01 | Deposit Submission & Review | Creates `Pending` deposit; funds are not credited until admin approval. |
| FIN-02 | Deposit Idempotency | Multiple approval triggers only credit the user's wallet exactly once. |
| FIN-03 | Task Completion Verification | Short session duration is rejected; eligible duration awards reward and emits ledger entry. |
| FIN-04 | Duplicate Task Claim | Replaying task completion nonce results in 409 Conflict without duplicate payout. |
| FIN-05 | Referral Commission Payout | 10% commission credited only on eligible task rewards; no commission on deposits/refunds. |
| FIN-06 | Withdrawal Fund Reservation | Requested funds are atomically moved to `ReservedBalance`; cannot be double-spent. |
| FIN-07 | Withdrawal Rejection / Refund | Reserved funds are returned to `AvailableBalance` with an audit ledger entry. |
| FIN-08 | Concurrency Overdraft Prevention | Multiple simultaneous withdrawal requests exceeding available balance fail safely. |

---

## 3. UI & Responsive Testing
- **Cross-device**: Mobile (Android/iOS 360px+), Tablet (768px+), Desktop (1280px+)
- **Multi-language**: Verify LTR layout in English and Roman Urdu; verify correct RTL mirroring and typography in Urdu.
