-- ============================================================================
-- NOVYRA Platform - Master Database DDL Schema (Microsoft SQL Server)
-- Brand: NOVYRA | Tagline: Watch. Complete. Earn.
-- Version: 1.0.0
-- Database: NovyraDb
-- All temporal values use UTC (GETUTCDATE())
-- All monetary amounts use DECIMAL(18,2)
-- Total Tables: 22
-- ============================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'NovyraDb')
BEGIN
    CREATE DATABASE NovyraDb;
END
GO

USE NovyraDb;
GO

-- ============================================================================
-- 1. Roles
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(50) NOT NULL,
        Description NVARCHAR(200) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_Roles_Name UNIQUE (Name)
    );
END
GO

-- ============================================================================
-- 2. Users
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(100) NOT NULL,
        Username NVARCHAR(50) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        PhoneNumber NVARCHAR(30) NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        ReferralCode NVARCHAR(20) NOT NULL,
        ReferredByUserId BIGINT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        IsSuspended BIT NOT NULL DEFAULT 0,
        SuspensionReason NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        LastLoginAt DATETIME2 NULL,
        CONSTRAINT UQ_Users_Username UNIQUE (Username),
        CONSTRAINT UQ_Users_Email UNIQUE (Email),
        CONSTRAINT UQ_Users_ReferralCode UNIQUE (ReferralCode),
        CONSTRAINT FK_Users_ReferredByUserId FOREIGN KEY (ReferredByUserId) REFERENCES Users(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_Users_Username ON Users(Username);
    CREATE NONCLUSTERED INDEX IX_Users_Email ON Users(Email);
    CREATE NONCLUSTERED INDEX IX_Users_ReferralCode ON Users(ReferralCode);
    CREATE NONCLUSTERED INDEX IX_Users_ReferredByUserId ON Users(ReferredByUserId);
    CREATE NONCLUSTERED INDEX IX_Users_Status ON Users(IsActive, IsSuspended);
END
GO

-- ============================================================================
-- 3. UserRoles
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserRoles')
BEGIN
    CREATE TABLE UserRoles (
        UserId BIGINT NOT NULL,
        RoleId INT NOT NULL,
        AssignedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        PRIMARY KEY (UserId, RoleId),
        CONSTRAINT FK_UserRoles_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        CONSTRAINT FK_UserRoles_RoleId FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 4. RefreshTokens
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RefreshTokens')
BEGIN
    CREATE TABLE RefreshTokens (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        TokenHash NVARCHAR(255) NOT NULL,
        ExpiresAt DATETIME2 NOT NULL,
        IsRevoked BIT NOT NULL DEFAULT 0,
        RevokedAt DATETIME2 NULL,
        ReplacedByTokenHash NVARCHAR(255) NULL,
        CreatedByIp NVARCHAR(45) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_RefreshTokens_TokenHash UNIQUE (TokenHash),
        CONSTRAINT FK_RefreshTokens_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_RefreshTokens_UserId_ExpiresAt ON RefreshTokens(UserId, ExpiresAt);
END
GO

-- ============================================================================
-- 5. Wallets
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Wallets')
BEGIN
    CREATE TABLE Wallets (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        AvailableBalance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        ReservedBalance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        TotalEarned DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        TotalWithdrawn DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        ReferralEarnings DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        RowVersion ROWVERSION NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT UQ_Wallets_UserId UNIQUE (UserId),
        CONSTRAINT CK_Wallets_AvailableBalance CHECK (AvailableBalance >= 0.00),
        CONSTRAINT CK_Wallets_ReservedBalance CHECK (ReservedBalance >= 0.00),
        CONSTRAINT FK_Wallets_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 6. WalletTransactions
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WalletTransactions')
BEGIN
    CREATE TABLE WalletTransactions (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        WalletId BIGINT NOT NULL,
        UserId BIGINT NOT NULL,
        TransactionType NVARCHAR(50) NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        BalanceBefore DECIMAL(18,2) NOT NULL,
        BalanceAfter DECIMAL(18,2) NOT NULL,
        ReferenceType NVARCHAR(50) NULL,
        ReferenceId BIGINT NULL,
        IdempotencyKey NVARCHAR(100) NULL,
        Description NVARCHAR(255) NOT NULL,
        CreatedByAdminId BIGINT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_WalletTransactions_WalletId FOREIGN KEY (WalletId) REFERENCES Wallets(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_WalletTransactions_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_WalletTransactions_AdminId FOREIGN KEY (CreatedByAdminId) REFERENCES Users(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_WalletTransactions_UserId_CreatedAt ON WalletTransactions(UserId, CreatedAt);
    CREATE NONCLUSTERED INDEX IX_WalletTransactions_WalletId_CreatedAt ON WalletTransactions(WalletId, CreatedAt);
    CREATE NONCLUSTERED INDEX IX_WalletTransactions_Type ON WalletTransactions(TransactionType);
    CREATE NONCLUSTERED INDEX IX_WalletTransactions_Reference ON WalletTransactions(ReferenceType, ReferenceId);
    CREATE NONCLUSTERED INDEX IX_WalletTransactions_Idempotency ON WalletTransactions(IdempotencyKey) WHERE IdempotencyKey IS NOT NULL;
END
GO

-- ============================================================================
-- 7. PaymentMethods
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PaymentMethods')
BEGIN
    CREATE TABLE PaymentMethods (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(50) NOT NULL,
        Type NVARCHAR(30) NOT NULL,
        QrCodePath NVARCHAR(300) NULL,
        AccountTitle NVARCHAR(100) NULL,
        AccountNumber NVARCHAR(100) NULL,
        BankName NVARCHAR(100) NULL,
        Iban NVARCHAR(50) NULL,
        Instructions NVARCHAR(1000) NULL,
        MinDeposit DECIMAL(18,2) NOT NULL DEFAULT 100.00,
        MaxDeposit DECIMAL(18,2) NOT NULL DEFAULT 500000.00,
        MinWithdrawal DECIMAL(18,2) NOT NULL DEFAULT 500.00,
        MaxWithdrawal DECIMAL(18,2) NOT NULL DEFAULT 100000.00,
        IsEnabled BIT NOT NULL DEFAULT 1,
        DisplayOrder INT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

-- ============================================================================
-- 8. Deposits
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Deposits')
BEGIN
    CREATE TABLE Deposits (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        PaymentMethodId INT NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        TransactionReference NVARCHAR(100) NOT NULL,
        ProofFilePath NVARCHAR(300) NOT NULL,
        Status NVARCHAR(30) NOT NULL DEFAULT 'Pending',
        AdminNote NVARCHAR(500) NULL,
        RejectionReason NVARCHAR(500) NULL,
        ReviewedByAdminId BIGINT NULL,
        ReviewedAt DATETIME2 NULL,
        WalletTransactionId BIGINT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Deposits_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Deposits_PaymentMethodId FOREIGN KEY (PaymentMethodId) REFERENCES PaymentMethods(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Deposits_ReviewedByAdminId FOREIGN KEY (ReviewedByAdminId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Deposits_WalletTransactionId FOREIGN KEY (WalletTransactionId) REFERENCES WalletTransactions(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_Deposits_UserId_CreatedAt ON Deposits(UserId, CreatedAt);
    CREATE NONCLUSTERED INDEX IX_Deposits_Status_CreatedAt ON Deposits(Status, CreatedAt);
    CREATE NONCLUSTERED INDEX IX_Deposits_TransactionReference ON Deposits(TransactionReference);
END
GO

-- ============================================================================
-- 9. Withdrawals
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Withdrawals')
BEGIN
    CREATE TABLE Withdrawals (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        PaymentMethodId INT NOT NULL,
        RequestedAmount DECIMAL(18,2) NOT NULL,
        FeeAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        NetAmount DECIMAL(18,2) NOT NULL,
        PayoutAccountTitle NVARCHAR(100) NOT NULL,
        PayoutAccountNumber NVARCHAR(100) NOT NULL,
        PayoutBankName NVARCHAR(100) NULL,
        Status NVARCHAR(30) NOT NULL DEFAULT 'Pending',
        RejectionReason NVARCHAR(500) NULL,
        AdminNote NVARCHAR(500) NULL,
        TransactionReference NVARCHAR(150) NULL,
        ReviewedByAdminId BIGINT NULL,
        ReviewedAt DATETIME2 NULL,
        PaidAt DATETIME2 NULL,
        ReservationWalletTransactionId BIGINT NULL,
        FinalWalletTransactionId BIGINT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Withdrawals_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Withdrawals_PaymentMethodId FOREIGN KEY (PaymentMethodId) REFERENCES PaymentMethods(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Withdrawals_ReviewedByAdminId FOREIGN KEY (ReviewedByAdminId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Withdrawals_ReservationTx FOREIGN KEY (ReservationWalletTransactionId) REFERENCES WalletTransactions(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Withdrawals_FinalTx FOREIGN KEY (FinalWalletTransactionId) REFERENCES WalletTransactions(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_Withdrawals_UserId_CreatedAt ON Withdrawals(UserId, CreatedAt);
    CREATE NONCLUSTERED INDEX IX_Withdrawals_Status_CreatedAt ON Withdrawals(Status, CreatedAt);
    CREATE NONCLUSTERED INDEX IX_Withdrawals_TransactionReference ON Withdrawals(TransactionReference);
END
GO

-- ============================================================================
-- 10. Campaigns
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Campaigns')
BEGIN
    CREATE TABLE Campaigns (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        CampaignName NVARCHAR(150) NOT NULL,
        AdvertiserName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(1000) NULL,
        RewardPerCompletion DECIMAL(18,2) NOT NULL,
        PlatformCommission DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        DailyBudget DECIMAL(18,2) NOT NULL,
        TotalBudget DECIMAL(18,2) NOT NULL,
        SpentBudget DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        TodaySpent DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        StartDate DATETIME2 NOT NULL,
        EndDate DATETIME2 NOT NULL,
        Status NVARCHAR(30) NOT NULL DEFAULT 'Active',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL
    );

    CREATE NONCLUSTERED INDEX IX_Campaigns_Status_Dates ON Campaigns(Status, StartDate, EndDate);
END
GO

-- ============================================================================
-- 11. Tasks
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tasks')
BEGIN
    CREATE TABLE Tasks (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        CampaignId BIGINT NOT NULL,
        Title NVARCHAR(150) NOT NULL,
        Description NVARCHAR(1000) NOT NULL,
        Category NVARCHAR(50) NOT NULL DEFAULT 'Video',
        VideoUrl NVARCHAR(500) NULL,
        DestinationUrl NVARCHAR(500) NULL,
        ThumbnailUrl NVARCHAR(500) NULL,
        Reward DECIMAL(18,2) NOT NULL,
        RequiredDurationSeconds INT NOT NULL DEFAULT 30,
        DailyLimitPerUser INT NOT NULL DEFAULT 1,
        TotalCompletionLimit INT NOT NULL DEFAULT 1000,
        CurrentCompletionCount INT NOT NULL DEFAULT 0,
        StartDate DATETIME2 NOT NULL,
        EndDate DATETIME2 NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Tasks_CampaignId FOREIGN KEY (CampaignId) REFERENCES Campaigns(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_Tasks_CampaignId ON Tasks(CampaignId);
    CREATE NONCLUSTERED INDEX IX_Tasks_IsActive_Dates ON Tasks(IsActive, StartDate, EndDate);
END
GO

-- ============================================================================
-- 12. TaskSessions
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TaskSessions')
BEGIN
    CREATE TABLE TaskSessions (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        TaskId BIGINT NOT NULL,
        SessionNonce NVARCHAR(100) NOT NULL,
        StartedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ExpiresAt DATETIME2 NOT NULL,
        CompletedAt DATETIME2 NULL,
        Status NVARCHAR(30) NOT NULL DEFAULT 'Active',
        IpAddress NVARCHAR(45) NULL,
        UserAgent NVARCHAR(300) NULL,
        CONSTRAINT UQ_TaskSessions_SessionNonce UNIQUE (SessionNonce),
        CONSTRAINT FK_TaskSessions_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_TaskSessions_TaskId FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_TaskSessions_UserId_TaskId_StartedAt ON TaskSessions(UserId, TaskId, StartedAt);
END
GO

-- ============================================================================
-- 13. TaskCompletions
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TaskCompletions')
BEGIN
    CREATE TABLE TaskCompletions (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        TaskId BIGINT NOT NULL,
        TaskSessionId BIGINT NOT NULL,
        RewardAmount DECIMAL(18,2) NOT NULL,
        WalletTransactionId BIGINT NOT NULL,
        CompletedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_TaskCompletions_TaskSessionId UNIQUE (TaskSessionId),
        CONSTRAINT FK_TaskCompletions_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_TaskCompletions_TaskId FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_TaskCompletions_TaskSessionId FOREIGN KEY (TaskSessionId) REFERENCES TaskSessions(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_TaskCompletions_WalletTransactionId FOREIGN KEY (WalletTransactionId) REFERENCES WalletTransactions(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_TaskCompletions_UserId_CompletedAt ON TaskCompletions(UserId, CompletedAt);
    CREATE NONCLUSTERED INDEX IX_TaskCompletions_TaskId_CompletedAt ON TaskCompletions(TaskId, CompletedAt);
END
GO

-- ============================================================================
-- 14. ReferralRelationships
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReferralRelationships')
BEGIN
    CREATE TABLE ReferralRelationships (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        ReferrerUserId BIGINT NOT NULL,
        ReferredUserId BIGINT NOT NULL,
        ReferralCode NVARCHAR(20) NOT NULL,
        Status NVARCHAR(30) NOT NULL DEFAULT 'Active',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_ReferralRelationships_ReferredUserId UNIQUE (ReferredUserId),
        CONSTRAINT FK_ReferralRelationships_Referrer FOREIGN KEY (ReferrerUserId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_ReferralRelationships_Referred FOREIGN KEY (ReferredUserId) REFERENCES Users(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_ReferralRelationships_Referrer ON ReferralRelationships(ReferrerUserId);
END
GO

-- ============================================================================
-- 15. ReferralCommissions
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReferralCommissions')
BEGIN
    CREATE TABLE ReferralCommissions (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        ReferrerUserId BIGINT NOT NULL,
        ReferredUserId BIGINT NOT NULL,
        TaskCompletionId BIGINT NOT NULL,
        CommissionPercentage DECIMAL(5,2) NOT NULL DEFAULT 10.00,
        CommissionAmount DECIMAL(18,2) NOT NULL,
        WalletTransactionId BIGINT NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_ReferralCommissions_TaskCompletionId UNIQUE (TaskCompletionId),
        CONSTRAINT FK_ReferralCommissions_Referrer FOREIGN KEY (ReferrerUserId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_ReferralCommissions_Referred FOREIGN KEY (ReferredUserId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_ReferralCommissions_TaskCompletion FOREIGN KEY (TaskCompletionId) REFERENCES TaskCompletions(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_ReferralCommissions_WalletTx FOREIGN KEY (WalletTransactionId) REFERENCES WalletTransactions(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_ReferralCommissions_Referrer_CreatedAt ON ReferralCommissions(ReferrerUserId, CreatedAt);
END
GO

-- ============================================================================
-- 16. Notifications
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE Notifications (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        Type NVARCHAR(50) NOT NULL,
        Title NVARCHAR(150) NOT NULL,
        Message NVARCHAR(1000) NOT NULL,
        IsRead BIT NOT NULL DEFAULT 0,
        ReferenceType NVARCHAR(50) NULL,
        ReferenceId BIGINT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ReadAt DATETIME2 NULL,
        CONSTRAINT FK_Notifications_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_Notifications_UserId_IsRead ON Notifications(UserId, IsRead, CreatedAt);
END
GO

-- ============================================================================
-- 17. SupportTickets
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SupportTickets')
BEGIN
    CREATE TABLE SupportTickets (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        TicketNumber NVARCHAR(30) NOT NULL,
        Subject NVARCHAR(200) NOT NULL,
        Category NVARCHAR(50) NOT NULL,
        Priority NVARCHAR(20) NOT NULL DEFAULT 'Medium',
        Status NVARCHAR(30) NOT NULL DEFAULT 'Open',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        ResolvedAt DATETIME2 NULL,
        CONSTRAINT UQ_SupportTickets_TicketNumber UNIQUE (TicketNumber),
        CONSTRAINT FK_SupportTickets_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_SupportTickets_UserId_CreatedAt ON SupportTickets(UserId, CreatedAt);
    CREATE NONCLUSTERED INDEX IX_SupportTickets_Status_Priority ON SupportTickets(Status, Priority);
END
GO

-- ============================================================================
-- 18. SupportMessages
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SupportMessages')
BEGIN
    CREATE TABLE SupportMessages (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        TicketId BIGINT NOT NULL,
        SenderId BIGINT NOT NULL,
        SenderRole NVARCHAR(30) NOT NULL DEFAULT 'User',
        Message NVARCHAR(MAX) NOT NULL,
        AttachmentPath NVARCHAR(300) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_SupportMessages_TicketId FOREIGN KEY (TicketId) REFERENCES SupportTickets(Id) ON DELETE CASCADE,
        CONSTRAINT FK_SupportMessages_SenderId FOREIGN KEY (SenderId) REFERENCES Users(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_SupportMessages_TicketId_CreatedAt ON SupportMessages(TicketId, CreatedAt);
END
GO

-- ============================================================================
-- 19. FraudFlags
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FraudFlags')
BEGIN
    CREATE TABLE FraudFlags (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        FlagType NVARCHAR(50) NOT NULL,
        RiskLevel NVARCHAR(20) NOT NULL DEFAULT 'Medium',
        Reason NVARCHAR(500) NOT NULL,
        MetadataJson NVARCHAR(MAX) NULL,
        Status NVARCHAR(30) NOT NULL DEFAULT 'Open',
        ReviewedByAdminId BIGINT NULL,
        AdminNote NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ReviewedAt DATETIME2 NULL,
        CONSTRAINT FK_FraudFlags_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_FraudFlags_ReviewedByAdminId FOREIGN KEY (ReviewedByAdminId) REFERENCES Users(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_FraudFlags_UserId_Status ON FraudFlags(UserId, Status);
    CREATE NONCLUSTERED INDEX IX_FraudFlags_RiskLevel_Status ON FraudFlags(RiskLevel, Status);
END
GO

-- ============================================================================
-- 20. AuditLogs
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
BEGIN
    CREATE TABLE AuditLogs (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        ActorAdminId BIGINT NULL,
        Action NVARCHAR(100) NOT NULL,
        EntityType NVARCHAR(50) NOT NULL,
        EntityId NVARCHAR(100) NOT NULL,
        Reason NVARCHAR(500) NULL,
        BeforeDataJson NVARCHAR(MAX) NULL,
        AfterDataJson NVARCHAR(MAX) NULL,
        IpAddress NVARCHAR(45) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_AuditLogs_ActorAdminId FOREIGN KEY (ActorAdminId) REFERENCES Users(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_AuditLogs_ActorAdminId_CreatedAt ON AuditLogs(ActorAdminId, CreatedAt);
    CREATE NONCLUSTERED INDEX IX_AuditLogs_Entity ON AuditLogs(EntityType, EntityId);
    CREATE NONCLUSTERED INDEX IX_AuditLogs_Action_CreatedAt ON AuditLogs(Action, CreatedAt);
END
GO

-- ============================================================================
-- 21. AdminAdjustments
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AdminAdjustments')
BEGIN
    CREATE TABLE AdminAdjustments (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        AdminId BIGINT NOT NULL,
        AdjustmentType NVARCHAR(20) NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        Reason NVARCHAR(500) NOT NULL,
        BalanceBefore DECIMAL(18,2) NOT NULL,
        BalanceAfter DECIMAL(18,2) NOT NULL,
        WalletTransactionId BIGINT NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_AdminAdjustments_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_AdminAdjustments_AdminId FOREIGN KEY (AdminId) REFERENCES Users(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_AdminAdjustments_WalletTx FOREIGN KEY (WalletTransactionId) REFERENCES WalletTransactions(Id) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_AdminAdjustments_UserId_CreatedAt ON AdminAdjustments(UserId, CreatedAt);
    CREATE NONCLUSTERED INDEX IX_AdminAdjustments_AdminId ON AdminAdjustments(AdminId);
END
GO

-- ============================================================================
-- 22. SystemSettings
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemSettings')
BEGIN
    CREATE TABLE SystemSettings (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        [Key] NVARCHAR(50) NOT NULL,
        [Value] NVARCHAR(500) NOT NULL,
        Description NVARCHAR(255) NULL,
        Category NVARCHAR(50) NOT NULL DEFAULT 'General',
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedByAdminId BIGINT NULL,
        CONSTRAINT UQ_SystemSettings_Key UNIQUE ([Key]),
        CONSTRAINT FK_SystemSettings_UpdatedByAdminId FOREIGN KEY (UpdatedByAdminId) REFERENCES Users(Id) ON DELETE NO ACTION
    );
END
GO
