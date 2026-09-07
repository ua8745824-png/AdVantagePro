using System.ComponentModel.DataAnnotations;

namespace Novyra.Backend.DTOs;

public class WalletSummaryDto
{
    public long UserId { get; set; }
    public decimal AvailableBalance { get; set; }
    public decimal ReservedBalance { get; set; }
    public decimal TotalEarned { get; set; }
    public decimal TotalWithdrawn { get; set; }
    public decimal ReferralEarnings { get; set; }
    public decimal TodayEarnings { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class WalletTransactionDto
{
    public long Id { get; set; }
    public string TransactionType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? ReferenceType { get; set; }
    public long? ReferenceId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AdminBalanceAdjustmentRequest
{
    [Required]
    public long UserId { get; set; }

    [Required]
    [RegularExpression("^(Credit|Debit)$", ErrorMessage = "Adjustment type must be either 'Credit' or 'Debit'.")]
    public string AdjustmentType { get; set; } = "Credit";

    [Required]
    [Range(1.00, 1000000.00, ErrorMessage = "Amount must be between 1.00 and 1,000,000.00 PKR.")]
    public decimal Amount { get; set; }

    [Required, StringLength(500, MinimumLength = 5)]
    public string Reason { get; set; } = string.Empty;
}

public class DepositRequestDto
{
    [Required]
    public int PaymentMethodId { get; set; }

    [Required]
    [Range(100.00, 1000000.00, ErrorMessage = "Deposit amount must be between 100.00 and 1,000,000.00 PKR.")]
    public decimal Amount { get; set; }

    [Required, StringLength(100, MinimumLength = 3)]
    public string TransactionReference { get; set; } = string.Empty;

    [Required, StringLength(300)]
    public string ProofFilePath { get; set; } = string.Empty;
}

public class DepositDto
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int PaymentMethodId { get; set; }
    public string PaymentMethodName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public string ProofFilePath { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}

public class DepositReviewRequest
{
    public string? AdminNote { get; set; }
    public string? RejectionReason { get; set; }
}

public class WithdrawalRequestDto
{
    [Required]
    public int PaymentMethodId { get; set; }

    [Required]
    [Range(500.00, 500000.00, ErrorMessage = "Withdrawal amount must be between 500.00 and 500,000.00 PKR.")]
    public decimal RequestedAmount { get; set; }

    [Required, StringLength(100, MinimumLength = 2)]
    public string PayoutAccountTitle { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 5)]
    public string PayoutAccountNumber { get; set; } = string.Empty;

    public string? PayoutBankName { get; set; }
}

public class WithdrawalFeePreviewDto
{
    public decimal RequestedAmount { get; set; }
    public decimal FixedFee { get; set; }
    public decimal PercentageFee { get; set; }
    public decimal TotalFee { get; set; }
    public decimal NetAmount { get; set; }
    public decimal AvailableBalance { get; set; }
    public bool IsEligible { get; set; }
}

public class WithdrawalDto
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int PaymentMethodId { get; set; }
    public string PaymentMethodName { get; set; } = string.Empty;
    public decimal RequestedAmount { get; set; }
    public decimal FeeAmount { get; set; }
    public decimal NetAmount { get; set; }
    public string PayoutAccountTitle { get; set; } = string.Empty;
    public string PayoutAccountNumber { get; set; } = string.Empty;
    public string? PayoutBankName { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
    public string? AdminNote { get; set; }
    public string? TransactionReference { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime? PaidAt { get; set; }
}

public class WithdrawalReviewRequest
{
    public string? AdminNote { get; set; }
    public string? RejectionReason { get; set; }
    public string? TransactionReference { get; set; }
}

public class PaymentMethodDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? QrCodePath { get; set; }
    public string? AccountTitle { get; set; }
    public string? AccountNumber { get; set; }
    public string? BankName { get; set; }
    public string? Iban { get; set; }
    public string? Instructions { get; set; }
    public decimal MinDeposit { get; set; }
    public decimal MaxDeposit { get; set; }
    public decimal MinWithdrawal { get; set; }
    public decimal MaxWithdrawal { get; set; }
    public bool IsEnabled { get; set; }
    public int DisplayOrder { get; set; }
}
