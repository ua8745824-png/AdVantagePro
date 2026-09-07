namespace Novyra.Backend.Entities;

public class Wallet
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public decimal AvailableBalance { get; set; } = 0.00m;
    public decimal ReservedBalance { get; set; } = 0.00m;
    public decimal TotalEarned { get; set; } = 0.00m;
    public decimal TotalWithdrawn { get; set; } = 0.00m;
    public decimal ReferralEarnings { get; set; } = 0.00m;
    public byte[] RowVersion { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<WalletTransaction> Transactions { get; set; } = new List<WalletTransaction>();
}
