namespace Novyra.Backend.Entities;

public class AuditLog
{
    public long Id { get; set; }
    public long? ActorAdminId { get; set; }
    public string Action { get; set; } = string.Empty; // UserSuspended, UserActivated, DepositApproved, DepositRejected, WithdrawalApproved, WithdrawalPaid, WithdrawalRejected, WalletAdjustment, SettingUpdated, QrUpdated
    public string EntityType { get; set; } = string.Empty; // User, Deposit, Withdrawal, Wallet, SystemSetting, PaymentMethod
    public string EntityId { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? BeforeDataJson { get; set; }
    public string? AfterDataJson { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User? ActorAdmin { get; set; }
}
