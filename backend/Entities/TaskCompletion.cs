namespace Novyra.Backend.Entities;

public class TaskCompletion
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long TaskId { get; set; }
    public long TaskSessionId { get; set; }
    public decimal RewardAmount { get; set; }
    public long WalletTransactionId { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public TaskItem Task { get; set; } = null!;
    public TaskSession TaskSession { get; set; } = null!;
    public WalletTransaction WalletTransaction { get; set; } = null!;
    public ReferralCommission? ReferralCommission { get; set; }
}
