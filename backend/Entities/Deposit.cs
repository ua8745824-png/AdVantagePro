namespace Novyra.Backend.Entities;

public class Deposit
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public int PaymentMethodId { get; set; }
    public decimal Amount { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public string ProofFilePath { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? AdminNote { get; set; }
    public string? RejectionReason { get; set; }
    public long? ReviewedByAdminId { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public long? WalletTransactionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public PaymentMethod PaymentMethod { get; set; } = null!;
    public User? ReviewedByAdmin { get; set; }
    public WalletTransaction? WalletTransaction { get; set; }
}
