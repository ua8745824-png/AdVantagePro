namespace Novyra.Backend.Entities;

public class PaymentMethod
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Easypaisa, JazzCash, Bank Transfer, USDT TRC20
    public string Type { get; set; } = string.Empty; // MobileWallet, Bank, Crypto
    public string? QrCodePath { get; set; }
    public string? AccountTitle { get; set; }
    public string? AccountNumber { get; set; }
    public string? BankName { get; set; }
    public string? Iban { get; set; }
    public string? Instructions { get; set; }
    public decimal MinDeposit { get; set; } = 100.00m;
    public decimal MaxDeposit { get; set; } = 500000.00m;
    public decimal MinWithdrawal { get; set; } = 500.00m;
    public decimal MaxWithdrawal { get; set; } = 100000.00m;
    public bool IsEnabled { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Deposit> Deposits { get; set; } = new List<Deposit>();
    public ICollection<Withdrawal> Withdrawals { get; set; } = new List<Withdrawal>();
}
