namespace Novyra.Backend.Entities;

public class Notification
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string Type { get; set; } = string.Empty; // TaskReward, DepositApproved, DepositRejected, WithdrawalUpdate, ReferralCommission, SupportUpdate, SystemAnnouncement, SecurityAlert
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public string? ReferenceType { get; set; }
    public long? ReferenceId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }

    // Navigation property
    public User User { get; set; } = null!;
}
