using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(NovyraDbContext context, ILogger logger)
    {
        try
        {
            logger.LogInformation("Ensuring NovyraDb database and schema are created...");
            await context.Database.EnsureCreatedAsync();

            // 1. Seed Roles
            if (!await context.Roles.AnyAsync())
            {
                logger.LogInformation("Seeding system roles...");
                var roles = new List<Role>
                {
                    new() { Name = "SuperAdmin", Description = "Full platform control and administrative privileges." },
                    new() { Name = "Admin", Description = "Operations, user management, and deposit/withdrawal approvals." },
                    new() { Name = "User", Description = "Standard registered participant (Watch & Earn tasks, referrals, wallet)." },
                    new() { Name = "FinanceAdmin", Description = "Financial review, payment reconciliation, and audit management." },
                    new() { Name = "SupportAgent", Description = "Customer support desk and ticket resolution." },
                    new() { Name = "Advertiser", Description = "Sponsored campaign sponsor and content creator." }
                };
                await context.Roles.AddRangeAsync(roles);
                await context.SaveChangesAsync();
            }

            // 2. Seed System Settings
            if (!await context.SystemSettings.AnyAsync())
            {
                logger.LogInformation("Seeding default system settings...");
                var settings = new List<SystemSetting>
                {
                    new() { Key = "DailyTaskLimitPerUser", Value = "15", Category = "Tasks", Description = "Maximum number of sponsored tasks a single user can complete per 24 hours." },
                    new() { Key = "DailyEarningLimitPKR", Value = "500.00", Category = "Limits", Description = "Maximum earnings in PKR a user can claim within a single calendar day." },
                    new() { Key = "ReferralCommissionPercentage", Value = "10.00", Category = "Referrals", Description = "Configurable commission percentage earned strictly on eligible task completions." },
                    new() { Key = "MinWithdrawalAmountPKR", Value = "500.00", Category = "Finance", Description = "Minimum withdrawal threshold in PKR." },
                    new() { Key = "MaxWithdrawalAmountPKR", Value = "100000.00", Category = "Finance", Description = "Maximum single withdrawal limit in PKR." },
                    new() { Key = "WithdrawalFixedFeePKR", Value = "0.00", Category = "Finance", Description = "Fixed administrative fee applied to withdrawals in PKR." },
                    new() { Key = "WithdrawalPercentageFee", Value = "0.00", Category = "Finance", Description = "Percentage fee applied to withdrawals." },
                    new() { Key = "MinDepositAmountPKR", Value = "100.00", Category = "Finance", Description = "Minimum deposit funding amount in PKR." },
                    new() { Key = "PlatformMaintenanceMode", Value = "false", Category = "System", Description = "Set to 'true' to restrict non-admin access during maintenance windows." }
                };
                await context.SystemSettings.AddRangeAsync(settings);
                await context.SaveChangesAsync();
            }

            // 3. Seed Payment Methods
            if (!await context.PaymentMethods.AnyAsync())
            {
                logger.LogInformation("Seeding supported payment methods...");
                var paymentMethods = new List<PaymentMethod>
                {
                    new()
                    {
                        Name = "Easypaisa",
                        Type = "MobileWallet",
                        QrCodePath = "/uploads/qr/easypaisa-sample-qr.png",
                        Instructions = "Scan the QR code in your Easypaisa App or transfer directly to the merchant title shown. Upload the transaction receipt screenshot.",
                        MinDeposit = 100.00m,
                        MaxDeposit = 500000.00m,
                        MinWithdrawal = 500.00m,
                        MaxWithdrawal = 50000.00m,
                        IsEnabled = true,
                        DisplayOrder = 1
                    },
                    new()
                    {
                        Name = "JazzCash",
                        Type = "MobileWallet",
                        QrCodePath = "/uploads/qr/jazzcash-sample-qr.png",
                        Instructions = "Scan the QR code using the JazzCash App. Ensure the reference / TRX ID matches your uploaded payment proof.",
                        MinDeposit = 100.00m,
                        MaxDeposit = 500000.00m,
                        MinWithdrawal = 500.00m,
                        MaxWithdrawal = 50000.00m,
                        IsEnabled = true,
                        DisplayOrder = 2
                    },
                    new()
                    {
                        Name = "Bank Transfer",
                        Type = "Bank",
                        AccountTitle = "NOVYRA Operations Account",
                        AccountNumber = "PK00NOVY0000123456789012",
                        BankName = "Standard Chartered Bank Pakistan",
                        Iban = "PK00NOVY0000123456789012",
                        Instructions = "Transfer funds via 1Link or IBFT. Upload your banking confirmation receipt showing the 12-digit transaction sequence.",
                        MinDeposit = 500.00m,
                        MaxDeposit = 1000000.00m,
                        MinWithdrawal = 1000.00m,
                        MaxWithdrawal = 200000.00m,
                        IsEnabled = true,
                        DisplayOrder = 3
                    },
                    new()
                    {
                        Name = "USDT (TRC20)",
                        Type = "Crypto",
                        AccountNumber = "TJNovyraPlatformOfficialTRC20VaultAddressExample",
                        Instructions = "Send USDT strictly via the TRC20 network. Allow 12 network confirmations, then submit your transaction hash (TXID).",
                        MinDeposit = 1000.00m,
                        MaxDeposit = 2000000.00m,
                        MinWithdrawal = 2500.00m,
                        MaxWithdrawal = 500000.00m,
                        IsEnabled = true,
                        DisplayOrder = 4
                    }
                };
                await context.PaymentMethods.AddRangeAsync(paymentMethods);
                await context.SaveChangesAsync();
            }

            // 4. Seed Initial SuperAdmin Account (Safe development credentials)
            var superAdminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "SuperAdmin");
            if (superAdminRole != null && !await context.Users.AnyAsync(u => u.Username == "superadmin"))
            {
                logger.LogInformation("Seeding default SuperAdmin account...");
                // Password: Admin@Novyra2026!
                var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@Novyra2026!", workFactor: 11);
                var superAdmin = new User
                {
                    FullName = "NOVYRA Super Administrator",
                    Username = "superadmin",
                    Email = "admin@novyra.internal",
                    PhoneNumber = "+923000000000",
                    PasswordHash = adminPasswordHash,
                    ReferralCode = "NOVYRA-ADMIN",
                    IsActive = true,
                    IsSuspended = false,
                    CreatedAt = DateTime.UtcNow
                };

                await context.Users.AddAsync(superAdmin);
                await context.SaveChangesAsync();

                // Assign SuperAdmin Role
                await context.UserRoles.AddAsync(new UserRole
                {
                    UserId = superAdmin.Id,
                    RoleId = superAdminRole.Id,
                    AssignedAt = DateTime.UtcNow
                });

                // Create Admin Wallet
                await context.Wallets.AddAsync(new Wallet
                {
                    UserId = superAdmin.Id,
                    AvailableBalance = 0.00m,
                    ReservedBalance = 0.00m,
                    TotalEarned = 0.00m,
                    TotalWithdrawn = 0.00m,
                    ReferralEarnings = 0.00m,
                    CreatedAt = DateTime.UtcNow
                });

                await context.SaveChangesAsync();
            }

            // 5. Seed Safe Demo Campaign & Tasks (Development / Sandbox)
            if (!await context.Campaigns.AnyAsync())
            {
                logger.LogInformation("Seeding sample development campaign and tasks...");
                var demoCampaign = new Campaign
                {
                    CampaignName = "Novyra Ecosystem Launch Campaign",
                    AdvertiserName = "Novyra Technologies",
                    Description = "Official launch partner tasks showcasing digital engagement and brand spotlight features.",
                    RewardPerCompletion = 10.00m,
                    PlatformCommission = 2.00m,
                    DailyBudget = 1000.00m,
                    TotalBudget = 25000.00m,
                    SpentBudget = 0.00m,
                    TodaySpent = 0.00m,
                    StartDate = DateTime.UtcNow.AddDays(-1),
                    EndDate = DateTime.UtcNow.AddDays(90),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                await context.Campaigns.AddAsync(demoCampaign);
                await context.SaveChangesAsync();

                var demoTasks = new List<TaskItem>
                {
                    new()
                    {
                        CampaignId = demoCampaign.Id,
                        Title = "Watch: NOVYRA Platform Official Introduction",
                        Description = "Watch the 30-second introduction video about verifiable task engagement and digital rewards.",
                        Category = "Video",
                        VideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        Reward = 15.00m,
                        RequiredDurationSeconds = 30,
                        DailyLimitPerUser = 1,
                        TotalCompletionLimit = 5000,
                        CurrentCompletionCount = 0,
                        StartDate = DateTime.UtcNow.AddDays(-1),
                        EndDate = DateTime.UtcNow.AddDays(90),
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        CampaignId = demoCampaign.Id,
                        Title = "Explore: Digital Asset Security & Wallet Protection",
                        Description = "Watch the security overview video covering wallet protection, 2FA, and transaction safety.",
                        Category = "Video",
                        VideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        Reward = 20.00m,
                        RequiredDurationSeconds = 45,
                        DailyLimitPerUser = 1,
                        TotalCompletionLimit = 5000,
                        CurrentCompletionCount = 0,
                        StartDate = DateTime.UtcNow.AddDays(-1),
                        EndDate = DateTime.UtcNow.AddDays(90),
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await context.Tasks.AddRangeAsync(demoTasks);
                await context.SaveChangesAsync();
            }

            logger.LogInformation("NovyraDb initialization and seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during database initialization: {Message}", ex.Message);
            throw;
        }
    }
}
