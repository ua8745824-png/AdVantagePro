namespace Novyra.Backend.Entities;

public class ReferralRelationship
{
    public long Id { get; set; }
    public long ReferrerUserId { get; set; }
    public long ReferredUserId { get; set; }
    public string ReferralCode { get; set; } = string.Empty;
    public string Status { get; set; } = "Active"; // Active, Suspended
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User ReferrerUser { get; set; } = null!;
    public User ReferredUser { get; set; } = null!;
}
