using Novyra.Backend.DTOs;

namespace Novyra.Backend.Services;

public interface IWithdrawalService
{
    Task<ApiResponse<WithdrawalFeePreviewDto>> CalculateFeePreviewAsync(long userId, int paymentMethodId, decimal amount);
    Task<ApiResponse<WithdrawalDto>> RequestWithdrawalAsync(long userId, WithdrawalRequestDto request);
    Task<ApiResponse<PagedResult<WithdrawalDto>>> GetUserWithdrawalsAsync(long userId, int page, int pageSize, string? status);
    Task<ApiResponse<PagedResult<WithdrawalDto>>> GetAdminWithdrawalsAsync(int page, int pageSize, string? status, string? search);
    Task<ApiResponse<WithdrawalDto>> ApproveWithdrawalAsync(long withdrawalId, long adminId, string? adminNote);
    Task<ApiResponse<WithdrawalDto>> MarkProcessingAsync(long withdrawalId, long adminId);
    Task<ApiResponse<WithdrawalDto>> MarkPaidAsync(long withdrawalId, long adminId, string transactionReference);
    Task<ApiResponse<WithdrawalDto>> RejectWithdrawalAsync(long withdrawalId, long adminId, string rejectionReason);
}
