using Novyra.Backend.DTOs;

namespace Novyra.Backend.Services;

public interface IAntiFraudService
{
    Task<bool> EvaluateTaskCompletionTimingAsync(long userId, long taskId, int requiredSeconds, double actualElapsedSeconds, string? ipAddress);
    Task FlagSuspiciousActivityAsync(long userId, string flagType, string riskLevel, string reason, string? metadataJson = null);
    Task<ApiResponse<PagedResult<FraudFlagDto>>> GetFraudFlagsAsync(int page, int pageSize, string? status, string? riskLevel);
    Task<ApiResponse> ReviewFraudFlagAsync(long flagId, long adminId, string newStatus, string? adminNote);
}
