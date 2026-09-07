namespace Novyra.Backend.Entities;

public class WalletTransaction
{
    public long Id { get; set; }
    public long WalletId { get; set; }
    public long UserId { get; set; }
    public string TransactionType { get; set; } = string.Empty; // Deposit, TaskReward, ReferralCommission, WithdrawalReservation, WithdrawalRefund, WithdrawalPaid, AdminCredit, AdminDebit
    public decimal Amount { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? ReferenceType { get; set; } // Deposit, TaskCompletion, ReferralCommission, Withdrawal, AdminAdjustment
    public long? ReferenceId { get; set; }
    public string? IdempotencyKey { get; set; }
    public string Description { get; set; } = string.Empty;
    public long? CreatedByAdminId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Wallet Wallet { get; set; } = null!;
    public User User { get; set; } = null!;
    public User? CreatedByAdmin { get; set; }
}
