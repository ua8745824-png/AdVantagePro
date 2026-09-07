namespace Novyra.Backend.Entities;

public class SystemSetting
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "General"; // Limits, Finance, Referrals, Tasks, System
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public long? UpdatedByAdminId { get; set; }

    // Navigation property
    public User? UpdatedByAdmin { get; set; }
}
