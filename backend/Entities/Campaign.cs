namespace Novyra.Backend.Entities;

public class Campaign
{
    public long Id { get; set; }
    public string CampaignName { get; set; } = string.Empty;
    public string AdvertiserName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal RewardPerCompletion { get; set; }
    public decimal PlatformCommission { get; set; } = 0.00m;
    public decimal DailyBudget { get; set; }
    public decimal TotalBudget { get; set; }
    public decimal SpentBudget { get; set; } = 0.00m;
    public decimal TodaySpent { get; set; } = 0.00m;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Active"; // Draft, Active, Paused, Completed, Cancelled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
