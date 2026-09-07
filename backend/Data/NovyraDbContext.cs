using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Data;

public class NovyraDbContext : DbContext
{
    public NovyraDbContext(DbContextOptions<NovyraDbContext> options) : base(options)
    {
    }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<WalletTransaction> WalletTransactions => Set<WalletTransaction>();
    public DbSet<PaymentMethod> PaymentMethods => Set<PaymentMethod>();
    public DbSet<Deposit> Deposits => Set<Deposit>();
    public DbSet<Withdrawal> Withdrawals => Set<Withdrawal>();
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<TaskSession> TaskSessions => Set<TaskSession>();
    public DbSet<TaskCompletion> TaskCompletions => Set<TaskCompletion>();
    public DbSet<ReferralRelationship> ReferralRelationships => Set<ReferralRelationship>();
    public DbSet<ReferralCommission> ReferralCommissions => Set<ReferralCommission>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<SupportMessage> SupportMessages => Set<SupportMessage>();
    public DbSet<FraudFlag> FraudFlags => Set<FraudFlag>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<AdminAdjustment> AdminAdjustments => Set<AdminAdjustment>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Role Configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(200);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // 2. User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
            entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(30);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.ReferralCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.SuspensionReason).HasMaxLength(500);

            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.ReferralCode).IsUnique();
            entity.HasIndex(e => e.ReferredByUserId);
            entity.HasIndex(e => new { e.IsActive, e.IsSuspended });

            entity.HasOne(e => e.ReferredByUser)
                  .WithMany(u => u.ReferredUsers)
                  .HasForeignKey(e => e.ReferredByUserId)
                  .OnDelete(DeleteBehavior.NoAction);
        });

        // 3. UserRole (Composite Key)
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("UserRoles");
            entity.HasKey(e => new { e.UserId, e.RoleId });

            entity.HasOne(e => e.User)
                  .WithMany(u => u.UserRoles)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Role)
                  .WithMany(r => r.UserRoles)
                  .HasForeignKey(e => e.RoleId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 4. RefreshToken Configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TokenHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.ReplacedByTokenHash).HasMaxLength(255);
            entity.Property(e => e.CreatedByIp).HasMaxLength(45);

            entity.HasIndex(e => e.TokenHash).IsUnique();
            entity.HasIndex(e => new { e.UserId, e.ExpiresAt });

            entity.HasOne(e => e.User)
                  .WithMany(u => u.RefreshTokens)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 5. Wallet Configuration (Financial Master)
        modelBuilder.Entity<Wallet>(entity =>
        {
            entity.ToTable("Wallets");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AvailableBalance).HasPrecision(18, 2);
            entity.Property(e => e.ReservedBalance).HasPrecision(18, 2);
            entity.Property(e => e.TotalEarned).HasPrecision(18, 2);
            entity.Property(e => e.TotalWithdrawn).HasPrecision(18, 2);
            entity.Property(e => e.ReferralEarnings).HasPrecision(18, 2);
            entity.Property(e => e.RowVersion).IsRowVersion();

            entity.HasIndex(e => e.UserId).IsUnique();

            entity.HasOne(e => e.User)
                  .WithOne(u => u.Wallet)
                  .HasForeignKey<Wallet>(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 6. WalletTransaction Configuration (Immutable Financial Ledger)
        modelBuilder.Entity<WalletTransaction>(entity =>
        {
            entity.ToTable("WalletTransactions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TransactionType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.BalanceBefore).HasPrecision(18, 2);
            entity.Property(e => e.BalanceAfter).HasPrecision(18, 2);
            entity.Property(e => e.ReferenceType).HasMaxLength(50);
            entity.Property(e => e.IdempotencyKey).HasMaxLength(100);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(255);

            entity.HasIndex(e => new { e.UserId, e.CreatedAt });
            entity.HasIndex(e => new { e.WalletId, e.CreatedAt });
            entity.HasIndex(e => e.TransactionType);
            entity.HasIndex(e => new { e.ReferenceType, e.ReferenceId });
            entity.HasIndex(e => e.IdempotencyKey);

            entity.HasOne(e => e.Wallet)
                  .WithMany(w => w.Transactions)
                  .HasForeignKey(e => e.WalletId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.WalletTransactions)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CreatedByAdmin)
                  .WithMany()
                  .HasForeignKey(e => e.CreatedByAdminId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 7. PaymentMethod Configuration
        modelBuilder.Entity<PaymentMethod>(entity =>
        {
            entity.ToTable("PaymentMethods");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(30);
            entity.Property(e => e.QrCodePath).HasMaxLength(300);
            entity.Property(e => e.AccountTitle).HasMaxLength(100);
            entity.Property(e => e.AccountNumber).HasMaxLength(100);
            entity.Property(e => e.BankName).HasMaxLength(100);
            entity.Property(e => e.Iban).HasMaxLength(50);
            entity.Property(e => e.Instructions).HasMaxLength(1000);
            entity.Property(e => e.MinDeposit).HasPrecision(18, 2);
            entity.Property(e => e.MaxDeposit).HasPrecision(18, 2);
            entity.Property(e => e.MinWithdrawal).HasPrecision(18, 2);
            entity.Property(e => e.MaxWithdrawal).HasPrecision(18, 2);
        });

        // 8. Deposit Configuration
        modelBuilder.Entity<Deposit>(entity =>
        {
            entity.ToTable("Deposits");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.TransactionReference).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ProofFilePath).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30);
            entity.Property(e => e.AdminNote).HasMaxLength(500);
            entity.Property(e => e.RejectionReason).HasMaxLength(500);

            entity.HasIndex(e => new { e.UserId, e.CreatedAt });
            entity.HasIndex(e => new { e.Status, e.CreatedAt });
            entity.HasIndex(e => e.TransactionReference);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Deposits)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.PaymentMethod)
                  .WithMany(pm => pm.Deposits)
                  .HasForeignKey(e => e.PaymentMethodId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ReviewedByAdmin)
                  .WithMany()
                  .HasForeignKey(e => e.ReviewedByAdminId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.WalletTransaction)
                  .WithMany()
                  .HasForeignKey(e => e.WalletTransactionId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 9. Withdrawal Configuration
        modelBuilder.Entity<Withdrawal>(entity =>
        {
            entity.ToTable("Withdrawals");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RequestedAmount).HasPrecision(18, 2);
            entity.Property(e => e.FeeAmount).HasPrecision(18, 2);
            entity.Property(e => e.NetAmount).HasPrecision(18, 2);
            entity.Property(e => e.PayoutAccountTitle).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PayoutAccountNumber).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PayoutBankName).HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30);
            entity.Property(e => e.RejectionReason).HasMaxLength(500);
            entity.Property(e => e.AdminNote).HasMaxLength(500);
            entity.Property(e => e.TransactionReference).HasMaxLength(150);

            entity.HasIndex(e => new { e.UserId, e.CreatedAt });
            entity.HasIndex(e => new { e.Status, e.CreatedAt });
            entity.HasIndex(e => e.TransactionReference);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Withdrawals)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.PaymentMethod)
                  .WithMany(pm => pm.Withdrawals)
                  .HasForeignKey(e => e.PaymentMethodId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ReviewedByAdmin)
                  .WithMany()
                  .HasForeignKey(e => e.ReviewedByAdminId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ReservationWalletTransaction)
                  .WithMany()
                  .HasForeignKey(e => e.ReservationWalletTransactionId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.FinalWalletTransaction)
                  .WithMany()
                  .HasForeignKey(e => e.FinalWalletTransactionId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 10. Campaign Configuration
        modelBuilder.Entity<Campaign>(entity =>
        {
            entity.ToTable("Campaigns");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CampaignName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.AdvertiserName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.RewardPerCompletion).HasPrecision(18, 2);
            entity.Property(e => e.PlatformCommission).HasPrecision(18, 2);
            entity.Property(e => e.DailyBudget).HasPrecision(18, 2);
            entity.Property(e => e.TotalBudget).HasPrecision(18, 2);
            entity.Property(e => e.SpentBudget).HasPrecision(18, 2);
            entity.Property(e => e.TodaySpent).HasPrecision(18, 2);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30);

            entity.HasIndex(e => new { e.Status, e.StartDate, e.EndDate });
        });

        // 11. TaskItem Configuration
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("Tasks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
            entity.Property(e => e.VideoUrl).HasMaxLength(500);
            entity.Property(e => e.DestinationUrl).HasMaxLength(500);
            entity.Property(e => e.ThumbnailUrl).HasMaxLength(500);
            entity.Property(e => e.Reward).HasPrecision(18, 2);

            entity.HasIndex(e => e.CampaignId);
            entity.HasIndex(e => new { e.IsActive, e.StartDate, e.EndDate });

            entity.HasOne(e => e.Campaign)
                  .WithMany(c => c.Tasks)
                  .HasForeignKey(e => e.CampaignId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 12. TaskSession Configuration
        modelBuilder.Entity<TaskSession>(entity =>
        {
            entity.ToTable("TaskSessions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SessionNonce).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.UserAgent).HasMaxLength(300);

            entity.HasIndex(e => e.SessionNonce).IsUnique();
            entity.HasIndex(e => new { e.UserId, e.TaskId, e.StartedAt });

            entity.HasOne(e => e.User)
                  .WithMany(u => u.TaskSessions)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Task)
                  .WithMany(t => t.TaskSessions)
                  .HasForeignKey(e => e.TaskId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 13. TaskCompletion Configuration
        modelBuilder.Entity<TaskCompletion>(entity =>
        {
            entity.ToTable("TaskCompletions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RewardAmount).HasPrecision(18, 2);

            entity.HasIndex(e => e.TaskSessionId).IsUnique();
            entity.HasIndex(e => new { e.UserId, e.CompletedAt });
            entity.HasIndex(e => new { e.TaskId, e.CompletedAt });

            entity.HasOne(e => e.User)
                  .WithMany(u => u.TaskCompletions)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Task)
                  .WithMany(t => t.TaskCompletions)
                  .HasForeignKey(e => e.TaskId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.TaskSession)
                  .WithOne(ts => ts.TaskCompletion)
                  .HasForeignKey<TaskCompletion>(e => e.TaskSessionId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.WalletTransaction)
                  .WithMany()
                  .HasForeignKey(e => e.WalletTransactionId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 14. ReferralRelationship Configuration
        modelBuilder.Entity<ReferralRelationship>(entity =>
        {
            entity.ToTable("ReferralRelationships");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ReferralCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30);

            entity.HasIndex(e => e.ReferredUserId).IsUnique();
            entity.HasIndex(e => e.ReferrerUserId);

            entity.HasOne(e => e.ReferrerUser)
                  .WithMany(u => u.ReferralsGiven)
                  .HasForeignKey(e => e.ReferrerUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ReferredUser)
                  .WithOne(u => u.ReferralReceived)
                  .HasForeignKey<ReferralRelationship>(e => e.ReferredUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 15. ReferralCommission Configuration
        modelBuilder.Entity<ReferralCommission>(entity =>
        {
            entity.ToTable("ReferralCommissions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CommissionPercentage).HasPrecision(5, 2);
            entity.Property(e => e.CommissionAmount).HasPrecision(18, 2);

            entity.HasIndex(e => e.TaskCompletionId).IsUnique();
            entity.HasIndex(e => new { e.ReferrerUserId, e.CreatedAt });
            entity.HasIndex(e => e.ReferredUserId);

            entity.HasOne(e => e.ReferrerUser)
                  .WithMany(u => u.ReferralCommissionsEarned)
                  .HasForeignKey(e => e.ReferrerUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ReferredUser)
                  .WithMany(u => u.ReferralCommissionsGenerated)
                  .HasForeignKey(e => e.ReferredUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.TaskCompletion)
                  .WithOne(tc => tc.ReferralCommission)
                  .HasForeignKey<ReferralCommission>(e => e.TaskCompletionId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.WalletTransaction)
                  .WithMany()
                  .HasForeignKey(e => e.WalletTransactionId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 16. Notification Configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notifications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.ReferenceType).HasMaxLength(50);

            entity.HasIndex(e => new { e.UserId, e.IsRead, e.CreatedAt });

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Notifications)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 17. SupportTicket Configuration
        modelBuilder.Entity<SupportTicket>(entity =>
        {
            entity.ToTable("SupportTickets");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TicketNumber).IsRequired().HasMaxLength(30);
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Priority).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30);

            entity.HasIndex(e => e.TicketNumber).IsUnique();
            entity.HasIndex(e => new { e.UserId, e.CreatedAt });
            entity.HasIndex(e => new { e.Status, e.Priority });

            entity.HasOne(e => e.User)
                  .WithMany(u => u.SupportTickets)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 18. SupportMessage Configuration
        modelBuilder.Entity<SupportMessage>(entity =>
        {
            entity.ToTable("SupportMessages");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SenderRole).IsRequired().HasMaxLength(30);
            entity.Property(e => e.Message).IsRequired();
            entity.Property(e => e.AttachmentPath).HasMaxLength(300);

            entity.HasIndex(e => new { e.TicketId, e.CreatedAt });

            entity.HasOne(e => e.Ticket)
                  .WithMany(t => t.Messages)
                  .HasForeignKey(e => e.TicketId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Sender)
                  .WithMany(u => u.SupportMessages)
                  .HasForeignKey(e => e.SenderId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 19. FraudFlag Configuration
        modelBuilder.Entity<FraudFlag>(entity =>
        {
            entity.ToTable("FraudFlags");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FlagType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.RiskLevel).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Reason).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30);
            entity.Property(e => e.AdminNote).HasMaxLength(500);

            entity.HasIndex(e => new { e.UserId, e.Status });
            entity.HasIndex(e => new { e.RiskLevel, e.Status });

            entity.HasOne(e => e.User)
                  .WithMany(u => u.FraudFlags)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ReviewedByAdmin)
                  .WithMany()
                  .HasForeignKey(e => e.ReviewedByAdminId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 20. AuditLog Configuration
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EntityType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.EntityId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.IpAddress).HasMaxLength(45);

            entity.HasIndex(e => new { e.ActorAdminId, e.CreatedAt });
            entity.HasIndex(e => new { e.EntityType, e.EntityId });
            entity.HasIndex(e => new { e.Action, e.CreatedAt });

            entity.HasOne(e => e.ActorAdmin)
                  .WithMany()
                  .HasForeignKey(e => e.ActorAdminId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 21. AdminAdjustment Configuration
        modelBuilder.Entity<AdminAdjustment>(entity =>
        {
            entity.ToTable("AdminAdjustments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AdjustmentType).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Reason).IsRequired().HasMaxLength(500);
            entity.Property(e => e.BalanceBefore).HasPrecision(18, 2);
            entity.Property(e => e.BalanceAfter).HasPrecision(18, 2);

            entity.HasIndex(e => new { e.UserId, e.CreatedAt });
            entity.HasIndex(e => e.AdminId);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Admin)
                  .WithMany()
                  .HasForeignKey(e => e.AdminId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.WalletTransaction)
                  .WithMany()
                  .HasForeignKey(e => e.WalletTransactionId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 22. SystemSetting Configuration
        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.ToTable("SystemSettings");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Key).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Value).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);

            entity.HasIndex(e => e.Key).IsUnique();

            entity.HasOne(e => e.UpdatedByAdmin)
                  .WithMany()
                  .HasForeignKey(e => e.UpdatedByAdminId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
