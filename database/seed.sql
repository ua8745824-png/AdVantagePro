-- ============================================================================
-- NOVYRA Platform - Master Database Seed Script (Microsoft SQL Server)
-- Brand: NOVYRA | Tagline: Watch. Complete. Earn.
-- Version: 1.0.0
-- Database: NovyraDb
-- Safe Development & Staging Configuration Seeds
-- ============================================================================

USE NovyraDb;
GO

-- 1. Seed Roles
IF NOT EXISTS (SELECT 1 FROM Roles WHERE Name = 'SuperAdmin')
BEGIN
    INSERT INTO Roles (Name, Description, CreatedAt) VALUES
    ('SuperAdmin', 'Full platform control and administrative privileges.', GETUTCDATE()),
    ('Admin', 'Operations, user management, and deposit/withdrawal approvals.', GETUTCDATE()),
    ('User', 'Standard registered participant (Watch & Earn tasks, referrals, wallet).', GETUTCDATE()),
    ('FinanceAdmin', 'Financial review, payment reconciliation, and audit management.', GETUTCDATE()),
    ('SupportAgent', 'Customer support desk and ticket resolution.', GETUTCDATE()),
    ('Advertiser', 'Sponsored campaign sponsor and content creator.', GETUTCDATE());
END
GO

-- 2. Seed System Settings
IF NOT EXISTS (SELECT 1 FROM SystemSettings WHERE [Key] = 'DailyTaskLimitPerUser')
BEGIN
    INSERT INTO SystemSettings ([Key], [Value], Description, Category, UpdatedAt) VALUES
    ('DailyTaskLimitPerUser', '15', 'Maximum number of sponsored tasks a single user can complete per 24 hours.', 'Tasks', GETUTCDATE()),
    ('DailyEarningLimitPKR', '500.00', 'Maximum earnings in PKR a user can claim within a single calendar day.', 'Limits', GETUTCDATE()),
    ('ReferralCommissionPercentage', '10.00', 'Configurable commission percentage earned strictly on eligible task completions.', 'Referrals', GETUTCDATE()),
    ('MinWithdrawalAmountPKR', '500.00', 'Minimum withdrawal threshold in PKR.', 'Finance', GETUTCDATE()),
    ('MaxWithdrawalAmountPKR', '100000.00', 'Maximum single withdrawal limit in PKR.', 'Finance', GETUTCDATE()),
    ('WithdrawalFixedFeePKR', '0.00', 'Fixed administrative fee applied to withdrawals in PKR.', 'Finance', GETUTCDATE()),
    ('WithdrawalPercentageFee', '0.00', 'Percentage fee applied to withdrawals.', 'Finance', GETUTCDATE()),
    ('MinDepositAmountPKR', '100.00', 'Minimum deposit funding amount in PKR.', 'Finance', GETUTCDATE()),
    ('PlatformMaintenanceMode', 'false', 'Set to true to restrict non-admin access during maintenance windows.', 'System', GETUTCDATE());
END
GO

-- 3. Seed Payment Methods
IF NOT EXISTS (SELECT 1 FROM PaymentMethods WHERE Name = 'Easypaisa')
BEGIN
    INSERT INTO PaymentMethods (Name, Type, QrCodePath, AccountTitle, AccountNumber, BankName, Iban, Instructions, MinDeposit, MaxDeposit, MinWithdrawal, MaxWithdrawal, IsEnabled, DisplayOrder, CreatedAt) VALUES
    ('Easypaisa', 'MobileWallet', '/uploads/qr/easypaisa-sample-qr.png', NULL, NULL, NULL, NULL, 'Scan the QR code in your Easypaisa App or transfer directly to the merchant title shown. Upload the transaction receipt screenshot.', 100.00, 500000.00, 500.00, 50000.00, 1, 1, GETUTCDATE()),
    ('JazzCash', 'MobileWallet', '/uploads/qr/jazzcash-sample-qr.png', NULL, NULL, NULL, NULL, 'Scan the QR code using the JazzCash App. Ensure the reference / TRX ID matches your uploaded payment proof.', 100.00, 500000.00, 500.00, 50000.00, 1, 2, GETUTCDATE()),
    ('Bank Transfer', 'Bank', NULL, 'NOVYRA Operations Account', 'PK00NOVY0000123456789012', 'Standard Chartered Bank Pakistan', 'PK00NOVY0000123456789012', 'Transfer funds via 1Link or IBFT. Upload your banking confirmation receipt showing the 12-digit transaction sequence.', 500.00, 1000000.00, 1000.00, 200000.00, 1, 3, GETUTCDATE()),
    ('USDT (TRC20)', 'Crypto', NULL, NULL, 'TJNovyraPlatformOfficialTRC20VaultAddressExample', NULL, NULL, 'Send USDT strictly via the TRC20 network. Allow 12 network confirmations, then submit your transaction hash (TXID).', 1000.00, 2000000.00, 2500.00, 500000.00, 1, 4, GETUTCDATE());
END
GO

-- 4. Seed Default SuperAdmin Account (BCrypt Hash for: Admin@Novyra2026!)
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'superadmin')
BEGIN
    INSERT INTO Users (FullName, Username, Email, PhoneNumber, PasswordHash, ReferralCode, IsActive, IsSuspended, CreatedAt)
    VALUES ('NOVYRA Super Administrator', 'superadmin', 'admin@novyra.internal', '+923000000000', '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'NOVYRA-ADMIN', 1, 0, GETUTCDATE());

    DECLARE @AdminUserId BIGINT = SCOPE_IDENTITY();
    DECLARE @SuperAdminRoleId INT = (SELECT Id FROM Roles WHERE Name = 'SuperAdmin');

    INSERT INTO UserRoles (UserId, RoleId, AssignedAt) VALUES (@AdminUserId, @SuperAdminRoleId, GETUTCDATE());

    INSERT INTO Wallets (UserId, AvailableBalance, ReservedBalance, TotalEarned, TotalWithdrawn, ReferralEarnings, CreatedAt)
    VALUES (@AdminUserId, 0.00, 0.00, 0.00, 0.00, 0.00, GETUTCDATE());
END
GO
