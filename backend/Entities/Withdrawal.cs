namespace Novyra.Backend.Entities;

public class Withdrawal
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public int PaymentMethodId { get; set; }
    public decimal RequestedAmount { get; set; }
    public decimal FeeAmount { get; set; } = 0.00m;
    public decimal NetAmount { get; set; }
    public string PayoutAccountTitle { get; set; } = string.Empty;
    public string PayoutAccountNumber { get; set; } = string.Empty; // Account # / IBAN / Crypto Address
    public string? PayoutBankName { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Processing, Approved, Paid, Rejected
    public string? RejectionReason { get; set; }
    public string? AdminNote { get; set; }
    public string? TransactionReference { get; set; }
    public long? ReviewedByAdminId { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public long? ReservationWalletTransactionId { get; set; }
    public long? FinalWalletTransactionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public PaymentMethod PaymentMethod { get; set; } = null!;
    public User? ReviewedByAdmin { get; set; }
    public WalletTransaction? ReservationWalletTransaction { get; set; }
    public WalletTransaction? FinalWalletTransaction { get; set; }
}
