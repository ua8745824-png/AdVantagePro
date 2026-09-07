using Novyra.Backend.DTOs;

namespace Novyra.Backend.Services;

public interface ITaskService
{
    Task<ApiResponse<List<TaskUserViewDto>>> GetActiveTasksForUserAsync(long userId, string? category);
    Task<ApiResponse<StartTaskSessionResponse>> StartTaskSessionAsync(long userId, long taskId, string? ipAddress, string? userAgent);
    Task<ApiResponse<CompleteTaskSessionResponse>> CompleteTaskSessionAsync(long userId, string sessionNonce, string? ipAddress);
    
    // Admin Management
    Task<ApiResponse<PagedResult<CampaignAdminDto>>> GetCampaignsAdminAsync(int page, int pageSize, string? status);
    Task<ApiResponse<CampaignAdminDto>> CreateCampaignAsync(CreateCampaignRequest request);
    Task<ApiResponse<CampaignAdminDto>> UpdateCampaignAsync(long id, CreateCampaignRequest request);
    Task<ApiResponse<PagedResult<TaskAdminDto>>> GetTasksAdminAsync(int page, int pageSize, long? campaignId);
    Task<ApiResponse<TaskAdminDto>> CreateTaskAsync(CreateTaskRequest request);
    Task<ApiResponse<TaskAdminDto>> UpdateTaskAsync(long id, CreateTaskRequest request);
}
