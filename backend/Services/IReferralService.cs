using Novyra.Backend.DTOs;

namespace Novyra.Backend.Services;

public interface IReferralService
{
    Task<ApiResponse<ReferralSummaryDto>> GetReferralSummaryAsync(long userId);
    Task<ApiResponse<PagedResult<ReferredUserDto>>> GetReferredUsersAsync(long userId, int page, int pageSize);
    Task<ApiResponse<PagedResult<ReferralCommissionDto>>> GetCommissionHistoryAsync(long userId, int page, int pageSize);
    Task ProcessTaskReferralCommissionAsync(long taskCompletionId, long completedUserId, decimal taskRewardAmount);
}
