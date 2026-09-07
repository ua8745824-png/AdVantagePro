namespace Novyra.Backend.Entities;

public class TaskItem
{
    public long Id { get; set; }
    public long CampaignId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "Video"; // Video, Social, Visit, Survey
    public string? VideoUrl { get; set; }
    public string? DestinationUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public decimal Reward { get; set; }
    public int RequiredDurationSeconds { get; set; } = 30;
    public int DailyLimitPerUser { get; set; } = 1;
    public int TotalCompletionLimit { get; set; } = 1000;
    public int CurrentCompletionCount { get; set; } = 0;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Campaign Campaign { get; set; } = null!;
    public ICollection<TaskSession> TaskSessions { get; set; } = new List<TaskSession>();
    public ICollection<TaskCompletion> TaskCompletions { get; set; } = new List<TaskCompletion>();
}
