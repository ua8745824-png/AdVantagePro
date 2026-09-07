namespace Novyra.Backend.Entities;

public class TaskSession
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long TaskId { get; set; }
    public string SessionNonce { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string Status { get; set; } = "Active"; // Active, Completed, Expired, Aborted
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public TaskItem Task { get; set; } = null!;
    public TaskCompletion? TaskCompletion { get; set; }
}
