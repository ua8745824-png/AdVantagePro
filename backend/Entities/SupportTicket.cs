namespace Novyra.Backend.Entities;

public class SupportTicket
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string TicketNumber { get; set; } = string.Empty; // E.g. 'NOV-849201'
    public string Subject { get; set; } = string.Empty;
    public string Category { get; set; } = "General"; // Account, Deposit, Withdrawal, TaskReward, Technical, General
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Urgent
    public string Status { get; set; } = "Open"; // Open, AwaitingUser, AwaitingAdmin, Resolved, Closed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<SupportMessage> Messages { get; set; } = new List<SupportMessage>();
}
