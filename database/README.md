# NOVYRA Database Architecture

## Overview
NOVYRA uses **Microsoft SQL Server** as its primary relational database engine.
The database schema is strictly normalized with primary keys, foreign key constraints, unique constraints, check constraints, non-clustered performance indexes, and optimistic/pessimistic concurrency tokens where applicable.

## Files
- `schema.sql`: Contains the complete, canonical DDL SQL script defining all enterprise tables, relations, and indexes. (Detailed in Phase 1)
- `seed.sql`: Contains the canonical seed scripts with required system roles, initial admin accounts, default system settings, and mock campaign configurations for development. (Detailed in Phase 1)

## Connection String Template
```json
"Server=(localdb)\\mssqllocaldb;Database=NovyraDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
```

## Financial & Ledger Integrity Rules
1. All balance-mutating operations execute within atomic SQL transactions.
2. Direct balance edits are strictly prohibited; all balance changes occur through the `WalletTransactions` ledger.
3. Concurrency tokens (rowversion) ensure protection against double withdrawals and race conditions.
