using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public class AntiFraudService : IAntiFraudService
{
    private readonly NovyraDbContext _db;
    private readonly ILogger<AntiFraudService> _logger;

    public AntiFraudService(NovyraDbContext db, ILogger<AntiFraudService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<bool> EvaluateTaskCompletionTimingAsync(
        long userId, long taskId, int requiredSeconds, double actualElapsedSeconds, string? ipAddress)
    {
        // If actual duration is significantly less than required duration (e.g. < 90% of required), flag it!
        var minPermissibleDuration = requiredSeconds * 0.90;
        if (actualElapsedSeconds < minPermissibleDuration)
        {
            await FlagSuspiciousActivityAsync(
                userId,
                "RapidTaskCompletion",
                "High",
                $"User submitted task completion in {actualElapsedSeconds:F1}s when {requiredSeconds}s was required.",
                $"{{\"taskId\": {taskId}, \"requiredSeconds\": {requiredSeconds}, \"actualSeconds\": {actualElapsedSeconds}, \"ipAddress\": \"{ipAddress}\"}}"
            );
            return false; // Timing violation detected
        }

        // Check if user completed more than 5 tasks in the last 2 minutes (velocity anomaly)
        var recentCutoff = DateTime.UtcNow.AddMinutes(-2);
        var rapidCount = await _db.TaskCompletions
            .CountAsync(tc => tc.UserId == userId && tc.CompletedAt >= recentCutoff);

        if (rapidCount >= 5)
        {
            await FlagSuspiciousActivityAsync(
                userId,
                "VelocityAnomaly",
                "Critical",
                $"Abnormal task completion velocity: {rapidCount} tasks completed within 2 minutes.",
                $"{{\"recentTaskCount\": {rapidCount}, \"ipAddress\": \"{ipAddress}\"}}"
            );
        }

        return true;
    }

    public async Task FlagSuspiciousActivityAsync(
        long userId, string flagType, string riskLevel, string reason, string? metadataJson = null)
    {
        try
        {
            var flag = new FraudFlag
            {
                UserId = userId,
                FlagType = flagType,
                RiskLevel = riskLevel,
                Reason = reason,
                MetadataJson = metadataJson,
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            };

            await _db.FraudFlags.AddAsync(flag);
            await _db.SaveChangesAsync();

            _logger.LogWarning("FRAUD ALERT: User #{UserId} flagged with {FlagType} [{RiskLevel}]: {Reason}",
                userId, flagType, riskLevel, reason);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to persist fraud flag for user {UserId}: {Message}", userId, ex.Message);
        }
    }

    public async Task<ApiResponse<PagedResult<FraudFlagDto>>> GetFraudFlagsAsync(
        int page, int pageSize, string? status, string? riskLevel)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.FraudFlags.Include(f => f.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(f => f.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(riskLevel) && riskLevel != "All")
        {
            query = query.Where(f => f.RiskLevel == riskLevel);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new FraudFlagDto
            {
                Id = f.Id,
                UserId = f.UserId,
                Username = f.User.Username,
                Email = f.User.Email,
                FlagType = f.FlagType,
                RiskLevel = f.RiskLevel,
                Reason = f.Reason,
                MetadataJson = f.MetadataJson,
                Status = f.Status,
                AdminNote = f.AdminNote,
                CreatedAt = f.CreatedAt,
                ReviewedAt = f.ReviewedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<FraudFlagDto>>.Ok(new PagedResult<FraudFlagDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse> ReviewFraudFlagAsync(
        long flagId, long adminId, string newStatus, string? adminNote)
    {
        var flag = await _db.FraudFlags.FindAsync(flagId);
        if (flag == null)
        {
            return ApiResponse.Fail("Fraud flag record not found.");
        }

        flag.Status = newStatus;
        flag.AdminNote = adminNote;
        flag.ReviewedByAdminId = adminId;
        flag.ReviewedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ApiResponse.Ok($"Fraud flag marked as {newStatus}.");
    }
}
