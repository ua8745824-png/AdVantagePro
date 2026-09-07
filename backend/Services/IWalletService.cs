using Novyra.Backend.DTOs;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public interface IWalletService
{
    Task<ApiResponse<WalletSummaryDto>> GetWalletSummaryAsync(long userId);
    Task<ApiResponse<PagedResult<WalletTransactionDto>>> GetTransactionsAsync(long userId, int page, int pageSize, string? type, DateTime? fromDate, DateTime? toDate);
    Task<WalletTransaction> CreditAsync(long userId, decimal amount, string transactionType, string? referenceType, long? referenceId, string description, string? idempotencyKey, long? adminId = null);
    Task<WalletTransaction> DebitAsync(long userId, decimal amount, string transactionType, string? referenceType, long? referenceId, string description, string? idempotencyKey, long? adminId = null);
    Task<WalletTransaction> ReserveFundsForWithdrawalAsync(long userId, decimal amount, long withdrawalId, string? idempotencyKey);
    Task<WalletTransaction> RefundReservedFundsAsync(long userId, decimal amount, long withdrawalId, string reason, long? adminId = null);
    Task<WalletTransaction> FinalizePaidWithdrawalAsync(long userId, decimal amount, long withdrawalId, string? transactionReference, long? adminId = null);
    Task<ApiResponse<WalletTransactionDto>> AdminAdjustBalanceAsync(long adminId, AdminBalanceAdjustmentRequest request);
}
