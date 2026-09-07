using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public class ReferralService : IReferralService
{
    private readonly NovyraDbContext _db;
    private readonly IWalletService _walletService;
    private readonly ISettingsService _settingsService;
    private readonly ILogger<ReferralService> _logger;

    public ReferralService(
        NovyraDbContext db,
        IWalletService walletService,
        ISettingsService settingsService,
        ILogger<ReferralService> logger)
    {
        _db = db;
        _walletService = walletService;
        _settingsService = settingsService;
        _logger = logger;
    }

    public async Task<ApiResponse<ReferralSummaryDto>> GetReferralSummaryAsync(long userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            return ApiResponse<ReferralSummaryDto>.Fail("User not found.");
        }

        var totalReferrals = await _db.ReferralRelationships
            .CountAsync(r => r.ReferrerUserId == userId);

        var activeReferrals = await _db.ReferralRelationships
            .Include(r => r.ReferredUser)
            .CountAsync(r => r.ReferrerUserId == userId && r.ReferredUser.IsActive && !r.ReferredUser.IsSuspended);

        var totalCommissionEarned = await _db.ReferralCommissions
            .Where(rc => rc.ReferrerUserId == userId)
            .SumAsync(rc => (decimal?)rc.CommissionAmount) ?? 0.00m;

        var commissionRate = await _settingsService.GetDecimalSettingAsync("ReferralCommissionPercentage", 10.00m);

        return ApiResponse<ReferralSummaryDto>.Ok(new ReferralSummaryDto
        {
            ReferralCode = user.ReferralCode,
            ReferralLink = $"/register?ref={user.ReferralCode}",
            TotalReferrals = totalReferrals,
            ActiveReferrals = activeReferrals,
            TotalCommissionEarned = totalCommissionEarned,
            CommissionPercentage = commissionRate
        });
    }

    public async Task<ApiResponse<PagedResult<ReferredUserDto>>> GetReferredUsersAsync(long userId, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.ReferralRelationships
            .Include(r => r.ReferredUser)
            .Where(r => r.ReferrerUserId == userId);

        var totalCount = await query.CountAsync();
        var relationships = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = new List<ReferredUserDto>();
        foreach (var r in relationships)
        {
            var generatedCommission = await _db.ReferralCommissions
                .Where(rc => rc.ReferrerUserId == userId && rc.ReferredUserId == r.ReferredUserId)
                .SumAsync(rc => (decimal?)rc.CommissionAmount) ?? 0.00m;

            items.Add(new ReferredUserDto
            {
                UserId = r.ReferredUserId,
                Username = r.ReferredUser.Username,
                FullName = r.ReferredUser.FullName,
                JoinedAt = r.CreatedAt,
                TotalGeneratedCommission = generatedCommission,
                Status = r.ReferredUser.IsSuspended ? "Suspended" : (r.ReferredUser.IsActive ? "Active" : "Inactive")
            });
        }

        return ApiResponse<PagedResult<ReferredUserDto>>.Ok(new PagedResult<ReferredUserDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<PagedResult<ReferralCommissionDto>>> GetCommissionHistoryAsync(long userId, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.ReferralCommissions
            .Include(rc => rc.ReferredUser)
            .Include(rc => rc.TaskCompletion)
            .Where(rc => rc.ReferrerUserId == userId);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(rc => rc.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(rc => new ReferralCommissionDto
            {
                Id = rc.Id,
                ReferredUsername = rc.ReferredUser.Username,
                TaskRewardAmount = rc.TaskCompletion.RewardAmount,
                CommissionPercentage = rc.CommissionPercentage,
                CommissionAmount = rc.CommissionAmount,
                CreatedAt = rc.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<ReferralCommissionDto>>.Ok(new PagedResult<ReferralCommissionDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task ProcessTaskReferralCommissionAsync(long taskCompletionId, long completedUserId, decimal taskRewardAmount)
    {
        try
        {
            // 1. Check if user was referred by someone
            var relationship = await _db.ReferralRelationships
                .Include(r => r.ReferrerUser)
                .FirstOrDefaultAsync(r => r.ReferredUserId == completedUserId && r.Status == "Active");

            if (relationship == null || !relationship.ReferrerUser.IsActive || relationship.ReferrerUser.IsSuspended)
            {
                return; // No eligible active referrer
            }

            // 2. Prevent duplicate commission on the same task completion
            if (await _db.ReferralCommissions.AnyAsync(rc => rc.TaskCompletionId == taskCompletionId))
            {
                _logger.LogWarning("Duplicate referral commission prevented for TaskCompletion #{CompletionId}", taskCompletionId);
                return;
            }

            // 3. Calculate commission percentage (default 10%)
            var commissionPercentage = await _settingsService.GetDecimalSettingAsync("ReferralCommissionPercentage", 10.00m);
            var commissionAmount = Math.Round(taskRewardAmount * (commissionPercentage / 100.00m), 2);

            if (commissionAmount <= 0)
            {
                return;
            }

            var referrerId = relationship.ReferrerUserId;

            // 4. Credit Referrer Wallet atomically
            var walletTx = await _walletService.CreditAsync(
                referrerId,
                commissionAmount,
                "ReferralCommission",
                "ReferralCommission",
                taskCompletionId,
                $"Referral commission ({commissionPercentage:N0}%) from task completed by @{relationship.ReferredUser?.Username ?? "user"}",
                $"REF-COMM-{taskCompletionId}"
            );

            // 5. Create ReferralCommission record
            var commission = new ReferralCommission
            {
                ReferrerUserId = referrerId,
                ReferredUserId = completedUserId,
                TaskCompletionId = taskCompletionId,
                CommissionPercentage = commissionPercentage,
                CommissionAmount = commissionAmount,
                WalletTransactionId = walletTx.Id,
                CreatedAt = DateTime.UtcNow
            };

            await _db.ReferralCommissions.AddAsync(commission);

            // 6. Notify Referrer
            await _db.Notifications.AddAsync(new Notification
            {
                UserId = referrerId,
                Type = "ReferralCommission",
                Title = "Referral Commission Earned! 🎉",
                Message = $"You earned {commissionAmount:N2} PKR ({commissionPercentage:N0}%) referral commission from an active referral task completion.",
                IsRead = false,
                ReferenceType = "ReferralCommission",
                ReferenceId = commission.Id,
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process referral commission for TaskCompletion #{CompletionId}: {Message}", taskCompletionId, ex.Message);
        }
    }
}
