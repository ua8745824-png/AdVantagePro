using Novyra.Backend.DTOs;

namespace Novyra.Backend.Services;

public interface IAdminService
{
    Task<ApiResponse<AdminDashboardKpiDto>> GetDashboardKpisAsync();
    Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(int page, int pageSize, string? search, string? status, string? role);
    Task<ApiResponse<UserDto>> GetUserDetailsAsync(long userId);
    Task<ApiResponse> SuspendUserAsync(long userId, long adminId, string reason);
    Task<ApiResponse> ActivateUserAsync(long userId, long adminId);
    Task<ApiResponse<PagedResult<AuditLogDto>>> GetAuditLogsAsync(int page, int pageSize, string? action, string? entityType);
    Task<ApiResponse<List<SystemSettingDto>>> GetSystemSettingsAsync();
    Task<ApiResponse<SystemSettingDto>> UpdateSystemSettingAsync(string key, string value, long adminId);
}
