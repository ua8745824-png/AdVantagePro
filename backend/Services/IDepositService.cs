using Novyra.Backend.DTOs;

namespace Novyra.Backend.Services;

public interface IDepositService
{
    Task<ApiResponse<DepositDto>> SubmitDepositAsync(long userId, DepositRequestDto request);
    Task<ApiResponse<PagedResult<DepositDto>>> GetUserDepositsAsync(long userId, int page, int pageSize, string? status);
    Task<ApiResponse<PagedResult<DepositDto>>> GetAdminDepositsAsync(int page, int pageSize, string? status, string? search);
    Task<ApiResponse<DepositDto>> ApproveDepositAsync(long depositId, long adminId, string? adminNote);
    Task<ApiResponse<DepositDto>> RejectDepositAsync(long depositId, long adminId, string? rejectionReason);
}
