namespace Novyra.Backend.Entities;

public class ReferralCommission
{
    public long Id { get; set; }
    public long ReferrerUserId { get; set; }
    public long ReferredUserId { get; set; }
    public long TaskCompletionId { get; set; }
    public decimal CommissionPercentage { get; set; } = 10.00m;
    public decimal CommissionAmount { get; set; }
    public long WalletTransactionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User ReferrerUser { get; set; } = null!;
    public User ReferredUser { get; set; } = null!;
    public TaskCompletion TaskCompletion { get; set; } = null!;
    public WalletTransaction WalletTransaction { get; set; } = null!;
}
