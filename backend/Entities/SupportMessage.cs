namespace Novyra.Backend.Entities;

public class SupportMessage
{
    public long Id { get; set; }
    public long TicketId { get; set; }
    public long SenderId { get; set; }
    public string SenderRole { get; set; } = "User"; // User, Admin, SupportAgent
    public string Message { get; set; } = string.Empty;
    public string? AttachmentPath { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public SupportTicket Ticket { get; set; } = null!;
    public User Sender { get; set; } = null!;
}
