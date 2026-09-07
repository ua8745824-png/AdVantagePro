namespace Novyra.Backend.Entities;

public class FraudFlag
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string FlagType { get; set; } = string.Empty; // VelocityAnomaly, RapidTaskCompletion, MultipleAccountsIp, SuspiciousWithdrawal, RepeatedAuthFailure
    public string RiskLevel { get; set; } = "Medium"; // Low, Medium, High, Critical
    public string Reason { get; set; } = string.Empty;
    public string? MetadataJson { get; set; }
    public string Status { get; set; } = "Open"; // Open, UnderReview, Cleared, Confirmed
    public long? ReviewedByAdminId { get; set; }
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public User? ReviewedByAdmin { get; set; }
}
