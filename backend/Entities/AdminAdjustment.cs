namespace Novyra.Backend.Entities;

public class AdminAdjustment
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long AdminId { get; set; }
    public string AdjustmentType { get; set; } = "Credit"; // Credit, Debit
    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public long WalletTransactionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public User Admin { get; set; } = null!;
    public WalletTransaction WalletTransaction { get; set; } = null!;
}
