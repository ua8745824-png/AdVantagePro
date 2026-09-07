# NOVYRA Database Architecture & Schema Specification

**Database Engine:** Microsoft SQL Server  
**ORM:** Entity Framework Core  
**Standard Timestamp:** UTC  
**Monetary Precision:** `decimal(18,2)` (Strictly no floating point)  
**Concurrency Protection:** RowVersion concurrency tokens & explicit database transaction locks

---

## 1. Complete Database Table Inventory (22 Tables)

### Table 1: `Roles`
- **Purpose:** System role definitions for role-based access control (RBAC).
- **Primary Key:** `Id` (INT, IDENTITY)
- **Columns:**
  - `Id` (INT, PK)
  - `Name` (NVARCHAR(50), NOT NULL)
  - `Description` (NVARCHAR(200), NULL)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
- **Unique Constraints:** `UQ_Roles_Name` ON `(Name)`
- **Relationships:** Many-to-Many with `Users` via `UserRoles`.

---

### Table 2: `Users`
- **Purpose:** Core user identity, credentials, account status, and referral tracking.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `FullName` (NVARCHAR(100), NOT NULL)
  - `Username` (NVARCHAR(50), NOT NULL)
  - `Email` (NVARCHAR(150), NOT NULL)
  - `PhoneNumber` (NVARCHAR(30), NOT NULL)
  - `PasswordHash` (NVARCHAR(255), NOT NULL)
  - `ReferralCode` (NVARCHAR(20), NOT NULL)
  - `ReferredByUserId` (BIGINT, NULL, FK -> `Users.Id`)
  - `IsActive` (BIT, NOT NULL, DEFAULT 1)
  - `IsSuspended` (BIT, NOT NULL, DEFAULT 0)
  - `SuspensionReason` (NVARCHAR(500), NULL)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
  - `UpdatedAt` (DATETIME2, NULL)
  - `LastLoginAt` (DATETIME2, NULL)
- **Unique Constraints:**
  - `UQ_Users_Username` ON `(Username)`
  - `UQ_Users_Email` ON `(Email)`
  - `UQ_Users_ReferralCode` ON `(ReferralCode)`
- **Indexes:**
  - `IX_Users_Username`
  - `IX_Users_Email`
  - `IX_Users_ReferralCode`
  - `IX_Users_ReferredByUserId`
  - `IX_Users_IsActive_IsSuspended`
- **Foreign Keys:**
  - `FK_Users_ReferredByUserId` -> `Users(Id)` (ON DELETE NO ACTION)

---

### Table 3: `UserRoles`
- **Purpose:** Association mapping between users and assigned roles.
- **Primary Key:** `(UserId, RoleId)`
- **Columns:**
  - `UserId` (BIGINT, PK, FK -> `Users.Id`)
  - `RoleId` (INT, PK, FK -> `Roles.Id`)
  - `AssignedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
- **Foreign Keys:**
  - `FK_UserRoles_UserId` -> `Users(Id)` (ON DELETE CASCADE)
  - `FK_UserRoles_RoleId` -> `Roles(Id)` (ON DELETE RESTRICT)

---

### Table 4: `RefreshTokens`
- **Purpose:** Cryptographic refresh tokens for secure JWT rotation.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `UserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `TokenHash` (NVARCHAR(255), NOT NULL)
  - `ExpiresAt` (DATETIME2, NOT NULL)
  - `IsRevoked` (BIT, NOT NULL, DEFAULT 0)
  - `RevokedAt` (DATETIME2, NULL)
  - `ReplacedByTokenHash` (NVARCHAR(255), NULL)
  - `CreatedByIp` (NVARCHAR(45), NULL)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
- **Unique Constraints:** `UQ_RefreshTokens_TokenHash` ON `(TokenHash)`
- **Indexes:**
  - `IX_RefreshTokens_UserId_ExpiresAt`
  - `IX_RefreshTokens_TokenHash`
- **Foreign Keys:**
  - `FK_RefreshTokens_UserId` -> `Users(Id)` (ON DELETE CASCADE)

---

### Table 5: `Wallets`
- **Purpose:** User account balance master record and financial concurrency control.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `UserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `AvailableBalance` (DECIMAL(18,2), NOT NULL, DEFAULT 0.00)
  - `ReservedBalance` (DECIMAL(18,2), NOT NULL, DEFAULT 0.00)
  - `TotalEarned` (DECIMAL(18,2), NOT NULL, DEFAULT 0.00)
  - `TotalWithdrawn` (DECIMAL(18,2), NOT NULL, DEFAULT 0.00)
  - `ReferralEarnings` (DECIMAL(18,2), NOT NULL, DEFAULT 0.00)
  - `RowVersion` (ROWVERSION, NOT NULL)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
  - `UpdatedAt` (DATETIME2, NULL)
- **Unique Constraints:** `UQ_Wallets_UserId` ON `(UserId)`
- **Check Constraints:**
  - `CK_Wallets_AvailableBalance_NonNegative` CHECK (`AvailableBalance` >= 0)
  - `CK_Wallets_ReservedBalance_NonNegative` CHECK (`ReservedBalance` >= 0)
- **Foreign Keys:**
  - `FK_Wallets_UserId` -> `Users(Id)` (ON DELETE RESTRICT)

---

### Table 6: `WalletTransactions`
- **Purpose:** Immutable financial double-entry ledger. Every balance change requires a ledger row.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `WalletId` (BIGINT, NOT NULL, FK -> `Wallets.Id`)
  - `UserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `TransactionType` (NVARCHAR(50), NOT NULL) -- Deposit, TaskReward, ReferralCommission, WithdrawalReservation, WithdrawalRefund, WithdrawalPaid, AdminCredit, AdminDebit
  - `Amount` (DECIMAL(18,2), NOT NULL)
  - `BalanceBefore` (DECIMAL(18,2), NOT NULL)
  - `BalanceAfter` (DECIMAL(18,2), NOT NULL)
  - `ReferenceType` (NVARCHAR(50), NULL) -- Deposit, TaskCompletion, ReferralCommission, Withdrawal, AdminAdjustment
  - `ReferenceId` (BIGINT, NULL)
  - `IdempotencyKey` (NVARCHAR(100), NULL)
  - `Description` (NVARCHAR(255), NOT NULL)
  - `CreatedByAdminId` (BIGINT, NULL, FK -> `Users.Id`)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
- **Indexes:**
  - `IX_WalletTransactions_UserId_CreatedAt`
  - `IX_WalletTransactions_WalletId_CreatedAt`
  - `IX_WalletTransactions_TransactionType`
  - `IX_WalletTransactions_ReferenceType_ReferenceId`
  - `IX_WalletTransactions_IdempotencyKey` (Unique where not null)
- **Foreign Keys:**
  - `FK_WalletTransactions_WalletId` -> `Wallets(Id)` (ON DELETE RESTRICT)
  - `FK_WalletTransactions_UserId` -> `Users(Id)` (ON DELETE RESTRICT)
  - `FK_WalletTransactions_CreatedByAdminId` -> `Users(Id)` (ON DELETE RESTRICT)

---

### Table 7: `PaymentMethods`
- **Purpose:** Supported payment gateway definitions (Easypaisa, JazzCash, Bank, USDT TRC20).
- **Primary Key:** `Id` (INT, IDENTITY)
- **Columns:**
  - `Id` (INT, PK)
  - `Name` (NVARCHAR(50), NOT NULL) -- Easypaisa, JazzCash, Bank Transfer, USDT TRC20
  - `Type` (NVARCHAR(30), NOT NULL) -- MobileWallet, Bank, Crypto
  - `QrCodePath` (NVARCHAR(300), NULL)
  - `AccountTitle` (NVARCHAR(100), NULL)
  - `AccountNumber` (NVARCHAR(100), NULL) -- Hidden from public view for mobile wallets when QR only
  - `BankName` (NVARCHAR(100), NULL)
  - `Iban` (NVARCHAR(50), NULL)
  - `Instructions` (NVARCHAR(1000), NULL)
  - `MinDeposit` (DECIMAL(18,2), NOT NULL, DEFAULT 100.00)
  - `MaxDeposit` (DECIMAL(18,2), NOT NULL, DEFAULT 500000.00)
  - `MinWithdrawal` (DECIMAL(18,2), NOT NULL, DEFAULT 500.00)
  - `MaxWithdrawal` (DECIMAL(18,2), NOT NULL, DEFAULT 100000.00)
  - `IsEnabled` (BIT, NOT NULL, DEFAULT 1)
  - `DisplayOrder` (INT, NOT NULL, DEFAULT 0)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
  - `UpdatedAt` (DATETIME2, NULL)

---

### Table 8: `Deposits`
- **Purpose:** User deposit verification requests and payment proof validation.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `UserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `PaymentMethodId` (INT, NOT NULL, FK -> `PaymentMethods.Id`)
  - `Amount` (DECIMAL(18,2), NOT NULL)
  - `TransactionReference` (NVARCHAR(100), NOT NULL) -- User-submitted TRX / Sender Ref
  - `ProofFilePath` (NVARCHAR(300), NOT NULL) -- Protected server storage path
  - `Status` (NVARCHAR(30), NOT NULL, DEFAULT 'Pending') -- Pending, Approved, Rejected
  - `AdminNote` (NVARCHAR(500), NULL)
  - `RejectionReason` (NVARCHAR(500), NULL)
  - `ReviewedByAdminId` (BIGINT, NULL, FK -> `Users.Id`)
  - `ReviewedAt` (DATETIME2, NULL)
  - `WalletTransactionId` (BIGINT, NULL, FK -> `WalletTransactions.Id`)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
  - `UpdatedAt` (DATETIME2, NULL)
- **Indexes:**
  - `IX_Deposits_UserId_CreatedAt`
  - `IX_Deposits_Status_CreatedAt`
  - `IX_Deposits_TransactionReference`
- **Foreign Keys:**
  - `FK_Deposits_UserId` -> `Users(Id)` (ON DELETE RESTRICT)
  - `FK_Deposits_PaymentMethodId` -> `PaymentMethods(Id)` (ON DELETE RESTRICT)
  - `FK_Deposits_ReviewedByAdminId` -> `Users(Id)` (ON DELETE RESTRICT)
  - `FK_Deposits_WalletTransactionId` -> `WalletTransactions(Id)` (ON DELETE RESTRICT)

---

### Table 9: `Withdrawals`
- **Purpose:** Withdrawal request lifecycle, fund reservations, fee calculations, and payout references.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `UserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `PaymentMethodId` (INT, NOT NULL, FK -> `PaymentMethods.Id`)
  - `RequestedAmount` (DECIMAL(18,2), NOT NULL)
  - `FeeAmount` (DECIMAL(18,2), NOT NULL, DEFAULT 0.00)
  - `NetAmount` (DECIMAL(18,2), NOT NULL)
  - `PayoutAccountTitle` (NVARCHAR(100), NOT NULL)
  - `PayoutAccountNumber` (NVARCHAR(100), NOT NULL) -- Mobile number / Bank IBAN / USDT Wallet Address
  - `PayoutBankName` (NVARCHAR(100), NULL)
  - `Status` (NVARCHAR(30), NOT NULL, DEFAULT 'Pending') -- Pending, Processing, Approved, Paid, Rejected
  - `RejectionReason` (NVARCHAR(500), NULL)
  - `AdminNote` (NVARCHAR(500), NULL)
  - `TransactionReference` (NVARCHAR(150), NULL) -- TXID / Bank Reference Number
  - `ReviewedByAdminId` (BIGINT, NULL, FK -> `Users.Id`)
  - `ReviewedAt` (DATETIME2, NULL)
  - `PaidAt` (DATETIME2, NULL)
  - `ReservationWalletTransactionId` (BIGINT, NULL, FK -> `WalletTransactions.Id`)
  - `FinalWalletTransactionId` (BIGINT, NULL, FK -> `WalletTransactions.Id`)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
  - `UpdatedAt` (DATETIME2, NULL)
- **Indexes:**
  - `IX_Withdrawals_UserId_CreatedAt`
  - `IX_Withdrawals_Status_CreatedAt`
  - `IX_Withdrawals_TransactionReference`
- **Foreign Keys:**
  - `FK_Withdrawals_UserId` -> `Users(Id)` (ON DELETE RESTRICT)
  - `FK_Withdrawals_PaymentMethodId` -> `PaymentMethods(Id)` (ON DELETE RESTRICT)
  - `FK_Withdrawals_ReviewedByAdminId` -> `Users(Id)` (ON DELETE RESTRICT)

---

### Table 10: `Campaigns`
- **Purpose:** Advertising sponsor campaigns with budget limits, duration, and target completions.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `CampaignName` (NVARCHAR(150), NOT NULL)
  - `AdvertiserName` (NVARCHAR(100), NOT NULL)
  - `Description` (NVARCHAR(1000), NULL)
  - `RewardPerCompletion` (DECIMAL(18,2), NOT NULL)
  - `PlatformCommission` (DECIMAL(18,2), NOT NULL, DEFAULT 0.00)
  - `DailyBudget` (DECIMAL(18,2), NOT NULL)
  - `TotalBudget` (DECIMAL(18,2), NOT NULL)
  - `SpentBudget` (DECIMAL(18,2), NOT NULL, DEFAULT 0.00)
  - `TodaySpent` (DECIMAL(18,2), NOT NULL, DEFAULT 0.00)
  - `StartDate` (DATETIME2, NOT NULL)
  - `EndDate` (DATETIME2, NOT NULL)
  - `Status` (NVARCHAR(30), NOT NULL, DEFAULT 'Active') -- Draft, Active, Paused, Completed, Cancelled
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
  - `UpdatedAt` (DATETIME2, NULL)
- **Indexes:**
  - `IX_Campaigns_Status_StartDate_EndDate`

---

### Table 11: `Tasks`
- **Purpose:** Individual sponsored tasks (Watch Video, Complete Survey, Visit Partner) within campaigns.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `CampaignId` (BIGINT, NOT NULL, FK -> `Campaigns.Id`)
  - `Title` (NVARCHAR(150), NOT NULL)
  - `Description` (NVARCHAR(1000), NOT NULL)
  - `Category` (NVARCHAR(50), NOT NULL, DEFAULT 'Video') -- Video, Social, Visit, Survey
  - `VideoUrl` (NVARCHAR(500), NULL)
  - `DestinationUrl` (NVARCHAR(500), NULL)
  - `ThumbnailUrl` (NVARCHAR(500), NULL)
  - `Reward` (DECIMAL(18,2), NOT NULL)
  - `RequiredDurationSeconds` (INT, NOT NULL, DEFAULT 30)
  - `DailyLimitPerUser` (INT, NOT NULL, DEFAULT 1)
  - `TotalCompletionLimit` (INT, NOT NULL, DEFAULT 1000)
  - `CurrentCompletionCount` (INT, NOT NULL, DEFAULT 0)
  - `StartDate` (DATETIME2, NOT NULL)
  - `EndDate` (DATETIME2, NOT NULL)
  - `IsActive` (BIT, NOT NULL, DEFAULT 1)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
  - `UpdatedAt` (DATETIME2, NULL)
- **Indexes:**
  - `IX_Tasks_CampaignId`
  - `IX_Tasks_IsActive_StartDate_EndDate`
- **Foreign Keys:**
  - `FK_Tasks_CampaignId` -> `Campaigns(Id)` (ON DELETE RESTRICT)

---

### Table 12: `TaskSessions`
- **Purpose:** Server-side task verification nonces to guarantee minimum watch duration and anti-cheat validation.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `UserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `TaskId` (BIGINT, NOT NULL, FK -> `Tasks.Id`)
  - `SessionNonce` (NVARCHAR(100), NOT NULL)
  - `StartedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
  - `ExpiresAt` (DATETIME2, NOT NULL)
  - `CompletedAt` (DATETIME2, NULL)
  - `Status` (NVARCHAR(30), NOT NULL, DEFAULT 'Active') -- Active, Completed, Expired, Aborted
  - `IpAddress` (NVARCHAR(45), NULL)
  - `UserAgent` (NVARCHAR(300), NULL)
- **Unique Constraints:** `UQ_TaskSessions_SessionNonce` ON `(SessionNonce)`
- **Indexes:**
  - `IX_TaskSessions_UserId_TaskId_StartedAt`
  - `IX_TaskSessions_SessionNonce`
- **Foreign Keys:**
  - `FK_TaskSessions_UserId` -> `Users(Id)` (ON DELETE RESTRICT)
  - `FK_TaskSessions_TaskId` -> `Tasks(Id)` (ON DELETE RESTRICT)

---

### Table 13: `TaskCompletions`
- **Purpose:** Immutable verified completion records linking tasks, sessions, rewards, and ledger transactions.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `UserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `TaskId` (BIGINT, NOT NULL, FK -> `Tasks.Id`)
  - `TaskSessionId` (BIGINT, NOT NULL, FK -> `TaskSessions.Id`)
  - `RewardAmount` (DECIMAL(18,2), NOT NULL)
  - `WalletTransactionId` (BIGINT, NOT NULL, FK -> `WalletTransactions.Id`)
  - `CompletedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
- **Unique Constraints:**
  - `UQ_TaskCompletions_TaskSessionId` ON `(TaskSessionId)`
- **Indexes:**
  - `IX_TaskCompletions_UserId_CompletedAt`
  - `IX_TaskCompletions_TaskId_CompletedAt`
- **Foreign Keys:**
  - `FK_TaskCompletions_UserId` -> `Users(Id)` (ON DELETE RESTRICT)
  - `FK_TaskCompletions_TaskId` -> `Tasks(Id)` (ON DELETE RESTRICT)
  - `FK_TaskCompletions_TaskSessionId` -> `TaskSessions(Id)` (ON DELETE RESTRICT)
  - `FK_TaskCompletions_WalletTransactionId` -> `WalletTransactions(Id)` (ON DELETE RESTRICT)

---

### Table 14: `ReferralRelationships`
- **Purpose:** Direct tree mapping of referrer and referred users.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `ReferrerUserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `ReferredUserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `ReferralCode` (NVARCHAR(20), NOT NULL)
  - `Status` (NVARCHAR(30), NOT NULL, DEFAULT 'Active') -- Active, Suspended
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
- **Unique Constraints:** `UQ_ReferralRelationships_ReferredUserId` ON `(ReferredUserId)`
- **Indexes:**
  - `IX_ReferralRelationships_ReferrerUserId`
  - `IX_ReferralRelationships_ReferredUserId`
- **Foreign Keys:**
  - `FK_ReferralRelationships_ReferrerUserId` -> `Users(Id)` (ON DELETE RESTRICT)
  - `FK_ReferralRelationships_ReferredUserId` -> `Users(Id)` (ON DELETE RESTRICT)

---

### Table 15: `ReferralCommissions`
- **Purpose:** Commission distribution records generated strictly upon eligible `TaskCompletion`.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `ReferrerUserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `ReferredUserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `TaskCompletionId` (BIGINT, NOT NULL, FK -> `TaskCompletions.Id`)
  - `CommissionPercentage` (DECIMAL(5,2), NOT NULL, DEFAULT 10.00)
  - `CommissionAmount` (DECIMAL(18,2), NOT NULL)
  - `WalletTransactionId` (BIGINT, NOT NULL, FK -> `WalletTransactions.Id`)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
- **Unique Constraints:** `UQ_ReferralCommissions_TaskCompletionId` ON `(TaskCompletionId)`
- **Indexes:**
  - `IX_ReferralCommissions_ReferrerUserId_CreatedAt`
  - `IX_ReferralCommissions_ReferredUserId`
- **Foreign Keys:**
  - `FK_ReferralCommissions_ReferrerUserId` -> `Users(Id)` (ON DELETE RESTRICT)
  - `FK_ReferralCommissions_ReferredUserId` -> `Users(Id)` (ON DELETE RESTRICT)
  - `FK_ReferralCommissions_TaskCompletionId` -> `TaskCompletions(Id)` (ON DELETE RESTRICT)
  - `FK_ReferralCommissions_WalletTransactionId` -> `WalletTransactions(Id)` (ON DELETE RESTRICT)

---

### Table 16: `Notifications`
- **Purpose:** Real-time and persistent user notifications for financial and security events.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `UserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `Type` (NVARCHAR(50), NOT NULL) -- TaskReward, DepositApproved, DepositRejected, WithdrawalUpdate, ReferralCommission, SupportUpdate, SystemAnnouncement, SecurityAlert
  - `Title` (NVARCHAR(150), NOT NULL)
  - `Message` (NVARCHAR(1000), NOT NULL)
  - `IsRead` (BIT, NOT NULL, DEFAULT 0)
  - `ReferenceType` (NVARCHAR(50), NULL)
  - `ReferenceId` (BIGINT, NULL)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
  - `ReadAt` (DATETIME2, NULL)
- **Indexes:**
  - `IX_Notifications_UserId_IsRead_CreatedAt`
- **Foreign Keys:**
  - `FK_Notifications_UserId` -> `Users(Id)` (ON DELETE CASCADE)

---

### Table 17: `SupportTickets`
- **Purpose:** Customer support inquiry tracking and lifecycle management.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `UserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `TicketNumber` (NVARCHAR(30), NOT NULL) -- E.g. 'NOV-749281'
  - `Subject` (NVARCHAR(200), NOT NULL)
  - `Category` (NVARCHAR(50), NOT NULL) -- Account, Deposit, Withdrawal, TaskReward, Technical, General
  - `Priority` (NVARCHAR(20), NOT NULL, DEFAULT 'Medium') -- Low, Medium, High, Urgent
  - `Status` (NVARCHAR(30), NOT NULL, DEFAULT 'Open') -- Open, AwaitingUser, AwaitingAdmin, Resolved, Closed
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
  - `UpdatedAt` (DATETIME2, NULL)
  - `ResolvedAt` (DATETIME2, NULL)
- **Unique Constraints:** `UQ_SupportTickets_TicketNumber` ON `(TicketNumber)`
- **Indexes:**
  - `IX_SupportTickets_UserId_CreatedAt`
  - `IX_SupportTickets_Status_Priority`
  - `IX_SupportTickets_TicketNumber`
- **Foreign Keys:**
  - `FK_SupportTickets_UserId` -> `Users(Id)` (ON DELETE RESTRICT)

---

### Table 18: `SupportMessages`
- **Purpose:** Threaded replies inside support tickets with optional file attachment paths.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `TicketId` (BIGINT, NOT NULL, FK -> `SupportTickets.Id`)
  - `SenderId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `SenderRole` (NVARCHAR(30), NOT NULL) -- User, Admin, SupportAgent
  - `Message` (NVARCHAR(MAX), NOT NULL)
  - `AttachmentPath` (NVARCHAR(300), NULL)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
- **Indexes:**
  - `IX_SupportMessages_TicketId_CreatedAt`
- **Foreign Keys:**
  - `FK_SupportMessages_TicketId` -> `SupportTickets(Id)` (ON DELETE CASCADE)
  - `FK_SupportMessages_SenderId` -> `Users(Id)` (ON DELETE RESTRICT)

---

### Table 19: `FraudFlags`
- **Purpose:** Risk heuristics and automated anti-fraud signal flags.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `UserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `FlagType` (NVARCHAR(50), NOT NULL) -- VelocityAnomaly, RapidTaskCompletion, MultipleAccountsIp, SuspiciousWithdrawal, RepeatedAuthFailure
  - `RiskLevel` (NVARCHAR(20), NOT NULL, DEFAULT 'Medium') -- Low, Medium, High, Critical
  - `Reason` (NVARCHAR(500), NOT NULL)
  - `MetadataJson` (NVARCHAR(MAX), NULL)
  - `Status` (NVARCHAR(30), NOT NULL, DEFAULT 'Open') -- Open, UnderReview, Cleared, Confirmed
  - `ReviewedByAdminId` (BIGINT, NULL, FK -> `Users.Id`)
  - `AdminNote` (NVARCHAR(500), NULL)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
  - `ReviewedAt` (DATETIME2, NULL)
- **Indexes:**
  - `IX_FraudFlags_UserId_Status`
  - `IX_FraudFlags_RiskLevel_Status`
- **Foreign Keys:**
  - `FK_FraudFlags_UserId` -> `Users(Id)` (ON DELETE RESTRICT)
  - `FK_FraudFlags_ReviewedByAdminId` -> `Users(Id)` (ON DELETE RESTRICT)

---

### Table 20: `AuditLogs`
- **Purpose:** Immutable audit trail of all sensitive administrator and system actions.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `ActorAdminId` (BIGINT, NULL, FK -> `Users.Id`)
  - `Action` (NVARCHAR(100), NOT NULL) -- UserSuspended, UserActivated, DepositApproved, DepositRejected, WithdrawalApproved, WithdrawalPaid, WithdrawalRejected, WalletAdjustment, SettingUpdated, QrUpdated
  - `EntityType` (NVARCHAR(50), NOT NULL) -- User, Deposit, Withdrawal, Wallet, SystemSetting, PaymentMethod
  - `EntityId` (NVARCHAR(100), NOT NULL)
  - `Reason` (NVARCHAR(500), NULL)
  - `BeforeDataJson` (NVARCHAR(MAX), NULL)
  - `AfterDataJson` (NVARCHAR(MAX), NULL)
  - `IpAddress` (NVARCHAR(45), NULL)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
- **Indexes:**
  - `IX_AuditLogs_ActorAdminId_CreatedAt`
  - `IX_AuditLogs_EntityType_EntityId`
  - `IX_AuditLogs_Action_CreatedAt`
- **Foreign Keys:**
  - `FK_AuditLogs_ActorAdminId` -> `Users(Id)` (ON DELETE RESTRICT)

---

### Table 21: `AdminAdjustments`
- **Purpose:** Specific audit records for manual credit/debit balance adjustments executed by administrators.
- **Primary Key:** `Id` (BIGINT, IDENTITY)
- **Columns:**
  - `Id` (BIGINT, PK)
  - `UserId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `AdminId` (BIGINT, NOT NULL, FK -> `Users.Id`)
  - `AdjustmentType` (NVARCHAR(20), NOT NULL) -- Credit, Debit
  - `Amount` (DECIMAL(18,2), NOT NULL)
  - `Reason` (NVARCHAR(500), NOT NULL)
  - `BalanceBefore` (DECIMAL(18,2), NOT NULL)
  - `BalanceAfter` (DECIMAL(18,2), NOT NULL)
  - `WalletTransactionId` (BIGINT, NOT NULL, FK -> `WalletTransactions.Id`)
  - `CreatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
- **Indexes:**
  - `IX_AdminAdjustments_UserId_CreatedAt`
  - `IX_AdminAdjustments_AdminId`
- **Foreign Keys:**
  - `FK_AdminAdjustments_UserId` -> `Users(Id)` (ON DELETE RESTRICT)
  - `FK_AdminAdjustments_AdminId` -> `Users(Id)` (ON DELETE RESTRICT)
  - `FK_AdminAdjustments_WalletTransactionId` -> `WalletTransactions(Id)` (ON DELETE RESTRICT)

---

### Table 22: `SystemSettings`
- **Purpose:** Centralized, dynamic business rule and financial threshold configurations.
- **Primary Key:** `Id` (INT, IDENTITY)
- **Columns:**
  - `Id` (INT, PK)
  - `Key` (NVARCHAR(50), NOT NULL)
  - `Value` (NVARCHAR(500), NOT NULL)
  - `Description` (NVARCHAR(255), NULL)
  - `Category` (NVARCHAR(50), NOT NULL, DEFAULT 'General') -- Limits, Finance, Referrals, Tasks, System
  - `UpdatedAt` (DATETIME2, NOT NULL, DEFAULT GETUTCDATE())
  - `UpdatedByAdminId` (BIGINT, NULL, FK -> `Users.Id`)
- **Unique Constraints:** `UQ_SystemSettings_Key` ON `(`Key`)`
- **Foreign Keys:**
  - `FK_SystemSettings_UpdatedByAdminId` -> `Users(Id)` (ON DELETE RESTRICT)

---

## 2. Financial Flows & Invariants

### 2.1. Wallet Balance Lifecycle
```
[ AvailableBalance ] ──(Withdrawal Requested)──> [ ReservedBalance ]
       │                                                │
       │                                     ┌──────────┴──────────┐
       │ (Task Reward / Deposit Approved)    ▼                     ▼
       ▼                                (Paid / Dispatched)   (Rejected / Refunded)
[ AvailableBalance + Amount ]            [ Funds Deducted ]    [ AvailableBalance + Reserved ]
```

### 2.2. Invariants
1. **`AvailableBalance >= 0`**: Guaranteed by database Check Constraint and atomic transaction balance checks.
2. **`ReservedBalance >= 0`**: Guaranteed by database Check Constraint.
3. **No Direct Balances Mutations**: Every balance change creates a corresponding `WalletTransactions` row.
4. **Idempotency**: All sensitive balance operations check for an existing idempotency key or prior status.
