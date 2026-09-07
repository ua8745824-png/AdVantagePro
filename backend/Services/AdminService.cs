using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public class AdminService : IAdminService
{
    private readonly NovyraDbContext _db;
    private readonly ISettingsService _settingsService;
    private readonly ILogger<AdminService> _logger;

    public AdminService(
        NovyraDbContext db,
        ISettingsService settingsService,
        ILogger<AdminService> logger)
    {
        _db = db;
        _settingsService = settingsService;
        _logger = logger;
    }

    public async Task<ApiResponse<AdminDashboardKpiDto>> GetDashboardKpisAsync()
    {
        var totalUsers = await _db.Users.CountAsync();
        var activeUsers = await _db.Users.CountAsync(u => u.IsActive && !u.IsSuspended);

        var pendingDeposits = await _db.Deposits.CountAsync(d => d.Status == "Pending");
        var pendingDepositsAmount = await _db.Deposits
            .Where(d => d.Status == "Pending")
            .SumAsync(d => (decimal?)d.Amount) ?? 0.00m;

        var pendingWithdrawals = await _db.Withdrawals.CountAsync(w => w.Status == "Pending" || w.Status == "Processing");
        var pendingWithdrawalsAmount = await _db.Withdrawals
            .Where(w => w.Status == "Pending" || w.Status == "Processing")
            .SumAsync(w => (decimal?)w.RequestedAmount) ?? 0.00m;

        var totalDepositsApproved = await _db.Deposits
            .Where(d => d.Status == "Approved")
            .SumAsync(d => (decimal?)d.Amount) ?? 0.00m;

        var totalWithdrawalsPaid = await _db.Withdrawals
            .Where(w => w.Status == "Paid")
            .SumAsync(w => (decimal?)w.NetAmount) ?? 0.00m;

        var totalTaskRewards = await _db.TaskCompletions
            .SumAsync(tc => (decimal?)tc.RewardAmount) ?? 0.00m;

        var totalReferralCommissions = await _db.ReferralCommissions
            .SumAsync(rc => (decimal?)rc.CommissionAmount) ?? 0.00m;

        var openFraudFlags = await _db.FraudFlags.CountAsync(f => f.Status == "Open" || f.Status == "UnderReview");
        var openTickets = await _db.SupportTickets.CountAsync(t => t.Status == "Open" || t.Status == "AwaitingAdmin");

        var now = DateTime.UtcNow;
        var activeCampaigns = await _db.Campaigns.CountAsync(c => c.Status == "Active" && c.StartDate <= now && c.EndDate >= now);
        var activeTasks = await _db.Tasks.CountAsync(t => t.IsActive && t.StartDate <= now && t.EndDate >= now);

        return ApiResponse<AdminDashboardKpiDto>.Ok(new AdminDashboardKpiDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            PendingDeposits = pendingDeposits,
            PendingDepositsAmount = pendingDepositsAmount,
            PendingWithdrawals = pendingWithdrawals,
            PendingWithdrawalsAmount = pendingWithdrawalsAmount,
            TotalDepositsApproved = totalDepositsApproved,
            TotalWithdrawalsPaid = totalWithdrawalsPaid,
            TotalTaskRewardsDistributed = totalTaskRewards,
            TotalReferralCommissionsDistributed = totalReferralCommissions,
            OpenFraudFlags = openFraudFlags,
            OpenSupportTickets = openTickets,
            ActiveCampaigns = activeCampaigns,
            ActiveTasks = activeTasks
        });
    }

    public async Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(
        int page, int pageSize, string? search, string? status, string? role)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(u => u.Username.ToLower().Contains(s) ||
                                     u.Email.ToLower().Contains(s) ||
                                     u.FullName.ToLower().Contains(s) ||
                                     u.PhoneNumber.Contains(s) ||
                                     u.ReferralCode.Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            if (status == "Suspended")
            {
                query = query.Where(u => u.IsSuspended);
            }
            else if (status == "Active")
            {
                query = query.Where(u => u.IsActive && !u.IsSuspended);
            }
            else if (status == "Inactive")
            {
                query = query.Where(u => !u.IsActive);
            }
        }

        if (!string.IsNullOrWhiteSpace(role) && role != "All")
        {
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name == role));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Username = u.Username,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                ReferralCode = u.ReferralCode,
                Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList(),
                IsActive = u.IsActive,
                IsSuspended = u.IsSuspended,
                SuspensionReason = u.SuspensionReason,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<UserDto>>.Ok(new PagedResult<UserDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<UserDto>> GetUserDetailsAsync(long userId)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("User not found.");
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        return ApiResponse<UserDto>.Ok(new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Username = user.Username,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            ReferralCode = user.ReferralCode,
            Roles = roles,
            IsActive = user.IsActive,
            IsSuspended = user.IsSuspended,
            SuspensionReason = user.SuspensionReason,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        });
    }

    public async Task<ApiResponse> SuspendUserAsync(long userId, long adminId, string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
        {
            return ApiResponse.Fail("A suspension reason is required.");
        }

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            return ApiResponse.Fail("User not found.");
        }

        user.IsSuspended = true;
        user.SuspensionReason = reason.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        // Revoke all active refresh tokens
        var tokens = await _db.RefreshTokens.Where(t => t.UserId == userId && !t.IsRevoked).ToListAsync();
        foreach (var t in tokens)
        {
            t.IsRevoked = true;
            t.RevokedAt = DateTime.UtcNow;
        }

        // Audit Log
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            ActorAdminId = adminId,
            Action = "UserSuspended",
            EntityType = "User",
            EntityId = userId.ToString(),
            Reason = $"Suspended @{user.Username}: {reason}",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return ApiResponse.Ok($"User @{user.Username} suspended successfully.");
    }

    public async Task<ApiResponse> ActivateUserAsync(long userId, long adminId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            return ApiResponse.Fail("User not found.");
        }

        user.IsSuspended = false;
        user.IsActive = true;
        user.SuspensionReason = null;
        user.UpdatedAt = DateTime.UtcNow;

        // Audit Log
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            ActorAdminId = adminId,
            Action = "UserActivated",
            EntityType = "User",
            EntityId = userId.ToString(),
            Reason = $"Activated/Un-suspended @{user.Username}",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return ApiResponse.Ok($"User @{user.Username} activated successfully.");
    }

    public async Task<ApiResponse<PagedResult<AuditLogDto>>> GetAuditLogsAsync(
        int page, int pageSize, string? action, string? entityType)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 20 : pageSize;

        var query = _db.AuditLogs.Include(a => a.ActorAdmin).AsQueryable();

        if (!string.IsNullOrWhiteSpace(action) && action != "All")
        {
            query = query.Where(a => a.Action == action);
        }

        if (!string.IsNullOrWhiteSpace(entityType) && entityType != "All")
        {
            query = query.Where(a => a.EntityType == entityType);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                ActorAdminId = a.ActorAdminId,
                ActorUsername = a.ActorAdmin != null ? a.ActorAdmin.Username : "System",
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                Reason = a.Reason,
                BeforeDataJson = a.BeforeDataJson,
                AfterDataJson = a.AfterDataJson,
                IpAddress = a.IpAddress,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<AuditLogDto>>.Ok(new PagedResult<AuditLogDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<List<SystemSettingDto>>> GetSystemSettingsAsync()
    {
        var settings = await _db.SystemSettings
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Key)
            .Select(s => new SystemSettingDto
            {
                Id = s.Id,
                Key = s.Key,
                Value = s.Value,
                Description = s.Description,
                Category = s.Category,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync();

        return ApiResponse<List<SystemSettingDto>>.Ok(settings);
    }

    public async Task<ApiResponse<SystemSettingDto>> UpdateSystemSettingAsync(
        string key, string value, long adminId)
    {
        var setting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
        if (setting == null)
        {
            return ApiResponse<SystemSettingDto>.Fail("Setting key not found.");
        }

        var beforeValue = setting.Value;
        setting.Value = value.Trim();
        setting.UpdatedAt = DateTime.UtcNow;
        setting.UpdatedByAdminId = adminId;

        // Audit Log
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            ActorAdminId = adminId,
            Action = "SettingUpdated",
            EntityType = "SystemSetting",
            EntityId = key,
            Reason = $"Updated setting '{key}' from '{beforeValue}' to '{value}'",
            BeforeDataJson = $"{{\"value\": \"{beforeValue}\"}}",
            AfterDataJson = $"{{\"value\": \"{value}\"}}",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return ApiResponse<SystemSettingDto>.Ok(new SystemSettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            Description = setting.Description,
            Category = setting.Category,
            UpdatedAt = setting.UpdatedAt
        }, "Setting updated successfully.");
    }
}
