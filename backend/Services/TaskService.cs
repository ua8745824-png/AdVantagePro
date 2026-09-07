using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public class TaskService : ITaskService
{
    private readonly NovyraDbContext _db;
    private readonly IWalletService _walletService;
    private readonly IReferralService _referralService;
    private readonly ISettingsService _settingsService;
    private readonly IAntiFraudService _antiFraudService;
    private readonly ILogger<TaskService> _logger;

    public TaskService(
        NovyraDbContext db,
        IWalletService walletService,
        IReferralService referralService,
        ISettingsService settingsService,
        IAntiFraudService antiFraudService,
        ILogger<TaskService> logger)
    {
        _db = db;
        _walletService = walletService;
        _referralService = referralService;
        _settingsService = settingsService;
        _antiFraudService = antiFraudService;
        _logger = logger;
    }

    public async Task<ApiResponse<List<TaskUserViewDto>>> GetActiveTasksForUserAsync(long userId, string? category)
    {
        var now = DateTime.UtcNow;
        var todayUtc = now.Date;

        var tasksQuery = _db.Tasks
            .Include(t => t.Campaign)
            .Where(t => t.IsActive && t.StartDate <= now && t.EndDate >= now &&
                        t.Campaign.Status == "Active" && t.Campaign.StartDate <= now && t.Campaign.EndDate >= now &&
                        t.Campaign.SpentBudget < t.Campaign.TotalBudget);

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            tasksQuery = tasksQuery.Where(t => t.Category == category);
        }

        var tasks = await tasksQuery.OrderByDescending(t => t.Reward).ToListAsync();

        // Get today's completions for user
        var userCompletionsToday = await _db.TaskCompletions
            .Where(tc => tc.UserId == userId && tc.CompletedAt >= todayUtc)
            .ToListAsync();

        var globalDailyTaskLimit = await _settingsService.GetIntSettingAsync("DailyTaskLimitPerUser", 15);
        var globalDailyEarningLimit = await _settingsService.GetDecimalSettingAsync("DailyEarningLimitPKR", 500.00m);

        var totalTasksDoneToday = userCompletionsToday.Count;
        var totalEarnedToday = userCompletionsToday.Sum(tc => tc.RewardAmount);

        var userTaskViews = new List<TaskUserViewDto>();
        foreach (var task in tasks)
        {
            var taskDoneTodayCount = userCompletionsToday.Count(tc => tc.TaskId == task.Id);
            bool canStart = true;
            string? statusMessage = null;

            if (totalTasksDoneToday >= globalDailyTaskLimit)
            {
                canStart = false;
                statusMessage = $"Daily task limit reached ({globalDailyTaskLimit}/{globalDailyTaskLimit}).";
            }
            else if (totalEarnedToday + task.Reward > globalDailyEarningLimit)
            {
                canStart = false;
                statusMessage = $"Daily earning limit reached ({globalDailyEarningLimit:N0} PKR max).";
            }
            else if (taskDoneTodayCount >= task.DailyLimitPerUser)
            {
                canStart = false;
                statusMessage = $"Completed for today ({taskDoneTodayCount}/{task.DailyLimitPerUser}).";
            }
            else if (task.CurrentCompletionCount >= task.TotalCompletionLimit)
            {
                canStart = false;
                statusMessage = "Campaign completion limit reached.";
            }

            userTaskViews.Add(new TaskUserViewDto
            {
                Id = task.Id,
                CampaignId = task.CampaignId,
                Title = task.Title,
                Description = task.Description,
                Category = task.Category,
                VideoUrl = task.VideoUrl,
                DestinationUrl = task.DestinationUrl,
                ThumbnailUrl = task.ThumbnailUrl,
                Reward = task.Reward,
                RequiredDurationSeconds = task.RequiredDurationSeconds,
                DailyLimitPerUser = task.DailyLimitPerUser,
                TodayCompletedCount = taskDoneTodayCount,
                CanStart = canStart,
                StatusMessage = statusMessage
            });
        }

        return ApiResponse<List<TaskUserViewDto>>.Ok(userTaskViews);
    }

    public async Task<ApiResponse<StartTaskSessionResponse>> StartTaskSessionAsync(
        long userId, long taskId, string? ipAddress, string? userAgent)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.IsSuspended || !user.IsActive)
        {
            return ApiResponse<StartTaskSessionResponse>.Fail("Account is suspended or invalid.");
        }

        var now = DateTime.UtcNow;
        var todayUtc = now.Date;

        var task = await _db.Tasks
            .Include(t => t.Campaign)
            .FirstOrDefaultAsync(t => t.Id == taskId && t.IsActive);

        if (task == null || task.StartDate > now || task.EndDate < now)
        {
            return ApiResponse<StartTaskSessionResponse>.Fail("The selected task is currently inactive or expired.");
        }

        if (task.Campaign.Status != "Active" || task.Campaign.StartDate > now || task.Campaign.EndDate < now)
        {
            return ApiResponse<StartTaskSessionResponse>.Fail("The sponsor campaign for this task is inactive.");
        }

        if (task.Campaign.SpentBudget >= task.Campaign.TotalBudget)
        {
            return ApiResponse<StartTaskSessionResponse>.Fail("This campaign's total budget has been fully allocated.");
        }

        // Check global daily limits
        var globalDailyTaskLimit = await _settingsService.GetIntSettingAsync("DailyTaskLimitPerUser", 15);
        var globalDailyEarningLimit = await _settingsService.GetDecimalSettingAsync("DailyEarningLimitPKR", 500.00m);

        var todayCompletions = await _db.TaskCompletions
            .Where(tc => tc.UserId == userId && tc.CompletedAt >= todayUtc)
            .ToListAsync();

        if (todayCompletions.Count >= globalDailyTaskLimit)
        {
            return ApiResponse<StartTaskSessionResponse>.Fail($"Daily task limit reached ({globalDailyTaskLimit} tasks per day). Please check back tomorrow.");
        }

        var todayEarnings = todayCompletions.Sum(tc => tc.RewardAmount);
        if (todayEarnings + task.Reward > globalDailyEarningLimit)
        {
            return ApiResponse<StartTaskSessionResponse>.Fail($"Daily earning limit reached ({globalDailyEarningLimit:N0} PKR per day).");
        }

        // Check task-specific daily limit
        var taskCompletedToday = todayCompletions.Count(tc => tc.TaskId == taskId);
        if (taskCompletedToday >= task.DailyLimitPerUser)
        {
            return ApiResponse<StartTaskSessionResponse>.Fail("You have already completed the maximum allowed attempts for this task today.");
        }

        // Check if there is already an active unfinished session
        var activeSession = await _db.TaskSessions
            .FirstOrDefaultAsync(ts => ts.UserId == userId && ts.TaskId == taskId && ts.Status == "Active" && ts.ExpiresAt > now);

        if (activeSession != null)
        {
            // Return existing active session
            return ApiResponse<StartTaskSessionResponse>.Ok(new StartTaskSessionResponse
            {
                SessionId = activeSession.Id,
                SessionNonce = activeSession.SessionNonce,
                TaskId = task.Id,
                Title = task.Title,
                VideoUrl = task.VideoUrl,
                DestinationUrl = task.DestinationUrl,
                Reward = task.Reward,
                RequiredDurationSeconds = task.RequiredDurationSeconds,
                StartedAt = activeSession.StartedAt,
                ExpiresAt = activeSession.ExpiresAt
            }, "Active task session resumed.");
        }

        // Generate Cryptographic Nonce
        var sessionNonce = "TS-" + Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant();
        var expiresAt = now.AddSeconds(task.RequiredDurationSeconds + 300); // 5 minutes grace buffer

        var session = new TaskSession
        {
            UserId = userId,
            TaskId = taskId,
            SessionNonce = sessionNonce,
            StartedAt = now,
            ExpiresAt = expiresAt,
            Status = "Active",
            IpAddress = ipAddress,
            UserAgent = userAgent
        };

        await _db.TaskSessions.AddAsync(session);
        await _db.SaveChangesAsync();

        return ApiResponse<StartTaskSessionResponse>.Ok(new StartTaskSessionResponse
        {
            SessionId = session.Id,
            SessionNonce = session.SessionNonce,
            TaskId = task.Id,
            Title = task.Title,
            VideoUrl = task.VideoUrl,
            DestinationUrl = task.DestinationUrl,
            Reward = task.Reward,
            RequiredDurationSeconds = task.RequiredDurationSeconds,
            StartedAt = session.StartedAt,
            ExpiresAt = session.ExpiresAt
        }, "Task session started. Complete the required duration to receive reward.");
    }

    public async Task<ApiResponse<CompleteTaskSessionResponse>> CompleteTaskSessionAsync(
        long userId, string sessionNonce, string? ipAddress)
    {
        var now = DateTime.UtcNow;

        var session = await _db.TaskSessions
            .Include(ts => ts.Task)
            .ThenInclude(t => t.Campaign)
            .FirstOrDefaultAsync(ts => ts.SessionNonce == sessionNonce && ts.UserId == userId);

        if (session == null)
        {
            return ApiResponse<CompleteTaskSessionResponse>.Fail("Invalid task session identifier.");
        }

        if (session.Status == "Completed")
        {
            return ApiResponse<CompleteTaskSessionResponse>.Fail("This task session has already been claimed.");
        }

        if (session.ExpiresAt < now)
        {
            session.Status = "Expired";
            await _db.SaveChangesAsync();
            return ApiResponse<CompleteTaskSessionResponse>.Fail("Task session expired. Please start a new session.");
        }

        var task = session.Task;
        var elapsedSeconds = (now - session.StartedAt).TotalSeconds;

        // 1. Anti-fraud duration validation
        var isValidTiming = await _antiFraudService.EvaluateTaskCompletionTimingAsync(
            userId, task.Id, task.RequiredDurationSeconds, elapsedSeconds, ipAddress);

        if (!isValidTiming)
        {
            session.Status = "Aborted";
            await _db.SaveChangesAsync();
            return ApiResponse<CompleteTaskSessionResponse>.Fail("Task completion rejected: Required watch duration was not met.");
        }

        // 2. Atomic Verification & Reward Credit
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // Re-verify campaign budget inside transaction
            var campaign = await _db.Campaigns.FindAsync(task.CampaignId);
            if (campaign == null || campaign.Status != "Active" || campaign.SpentBudget + task.Reward > campaign.TotalBudget)
            {
                await transaction.RollbackAsync();
                return ApiResponse<CompleteTaskSessionResponse>.Fail("Campaign budget cap reached.");
            }

            // Update session status
            session.Status = "Completed";
            session.CompletedAt = now;

            // Update Task and Campaign metrics
            task.CurrentCompletionCount += 1;
            campaign.SpentBudget += task.Reward + campaign.PlatformCommission;
            campaign.TodaySpent += task.Reward + campaign.PlatformCommission;

            // Credit User Wallet
            var walletTx = await _walletService.CreditAsync(
                userId,
                task.Reward,
                "TaskReward",
                "TaskCompletion",
                session.Id,
                $"Reward for completing task: {task.Title}",
                $"TASK-CLAIM-{session.SessionNonce}"
            );

            // Record Task Completion
            var completion = new TaskCompletion
            {
                UserId = userId,
                TaskId = task.Id,
                TaskSessionId = session.Id,
                RewardAmount = task.Reward,
                WalletTransactionId = walletTx.Id,
                CompletedAt = now
            };

            await _db.TaskCompletions.AddAsync(completion);

            // Create User Notification
            await _db.Notifications.AddAsync(new Notification
            {
                UserId = userId,
                Type = "TaskReward",
                Title = "Task Reward Credited! 💰",
                Message = $"You earned {task.Reward:N2} PKR for completing '{task.Title}'.",
                IsRead = false,
                ReferenceType = "TaskCompletion",
                ReferenceId = completion.Id,
                CreatedAt = now
            });

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            // 3. Trigger Referral Commission
            try
            {
                await _referralService.ProcessTaskReferralCommissionAsync(completion.Id, userId, task.Reward);
            }
            catch (Exception refEx)
            {
                _logger.LogError(refEx, "Referral commission execution error: {Message}", refEx.Message);
            }

            return ApiResponse<CompleteTaskSessionResponse>.Ok(new CompleteTaskSessionResponse
            {
                TaskCompletionId = completion.Id,
                RewardAmount = task.Reward,
                NewAvailableBalance = walletTx.BalanceAfter,
                CompletedAt = now
            }, $"Congratulations! You earned {task.Reward:N2} PKR.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to complete task session #{SessionId}: {Message}", session.Id, ex.Message);
            return ApiResponse<CompleteTaskSessionResponse>.Fail("Failed to process reward claim. Please try again.");
        }
    }

    public async Task<ApiResponse<PagedResult<CampaignAdminDto>>> GetCampaignsAdminAsync(
        int page, int pageSize, string? status)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.Campaigns.Include(c => c.Tasks).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(c => c.Status == status);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CampaignAdminDto
            {
                Id = c.Id,
                CampaignName = c.CampaignName,
                AdvertiserName = c.AdvertiserName,
                Description = c.Description,
                RewardPerCompletion = c.RewardPerCompletion,
                PlatformCommission = c.PlatformCommission,
                DailyBudget = c.DailyBudget,
                TotalBudget = c.TotalBudget,
                SpentBudget = c.SpentBudget,
                TodaySpent = c.TodaySpent,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                Status = c.Status,
                TasksCount = c.Tasks.Count,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<CampaignAdminDto>>.Ok(new PagedResult<CampaignAdminDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<CampaignAdminDto>> CreateCampaignAsync(CreateCampaignRequest request)
    {
        var campaign = new Campaign
        {
            CampaignName = request.CampaignName.Trim(),
            AdvertiserName = request.AdvertiserName.Trim(),
            Description = request.Description?.Trim(),
            RewardPerCompletion = request.RewardPerCompletion,
            PlatformCommission = request.PlatformCommission,
            DailyBudget = request.DailyBudget,
            TotalBudget = request.TotalBudget,
            SpentBudget = 0.00m,
            TodaySpent = 0.00m,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow
        };

        await _db.Campaigns.AddAsync(campaign);
        await _db.SaveChangesAsync();

        return ApiResponse<CampaignAdminDto>.Ok(new CampaignAdminDto
        {
            Id = campaign.Id,
            CampaignName = campaign.CampaignName,
            AdvertiserName = campaign.AdvertiserName,
            Description = campaign.Description,
            RewardPerCompletion = campaign.RewardPerCompletion,
            PlatformCommission = campaign.PlatformCommission,
            DailyBudget = campaign.DailyBudget,
            TotalBudget = campaign.TotalBudget,
            SpentBudget = campaign.SpentBudget,
            TodaySpent = campaign.TodaySpent,
            StartDate = campaign.StartDate,
            EndDate = campaign.EndDate,
            Status = campaign.Status,
            TasksCount = 0,
            CreatedAt = campaign.CreatedAt
        }, "Campaign created successfully.");
    }

    public async Task<ApiResponse<CampaignAdminDto>> UpdateCampaignAsync(long id, CreateCampaignRequest request)
    {
        var campaign = await _db.Campaigns.Include(c => c.Tasks).FirstOrDefaultAsync(c => c.Id == id);
        if (campaign == null)
        {
            return ApiResponse<CampaignAdminDto>.Fail("Campaign not found.");
        }

        campaign.CampaignName = request.CampaignName.Trim();
        campaign.AdvertiserName = request.AdvertiserName.Trim();
        campaign.Description = request.Description?.Trim();
        campaign.RewardPerCompletion = request.RewardPerCompletion;
        campaign.PlatformCommission = request.PlatformCommission;
        campaign.DailyBudget = request.DailyBudget;
        campaign.TotalBudget = request.TotalBudget;
        campaign.StartDate = request.StartDate;
        campaign.EndDate = request.EndDate;
        campaign.Status = request.Status;
        campaign.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return ApiResponse<CampaignAdminDto>.Ok(new CampaignAdminDto
        {
            Id = campaign.Id,
            CampaignName = campaign.CampaignName,
            AdvertiserName = campaign.AdvertiserName,
            Description = campaign.Description,
            RewardPerCompletion = campaign.RewardPerCompletion,
            PlatformCommission = campaign.PlatformCommission,
            DailyBudget = campaign.DailyBudget,
            TotalBudget = campaign.TotalBudget,
            SpentBudget = campaign.SpentBudget,
            TodaySpent = campaign.TodaySpent,
            StartDate = campaign.StartDate,
            EndDate = campaign.EndDate,
            Status = campaign.Status,
            TasksCount = campaign.Tasks.Count,
            CreatedAt = campaign.CreatedAt
        }, "Campaign updated successfully.");
    }

    public async Task<ApiResponse<PagedResult<TaskAdminDto>>> GetTasksAdminAsync(int page, int pageSize, long? campaignId)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.Tasks.Include(t => t.Campaign).AsQueryable();

        if (campaignId.HasValue)
        {
            query = query.Where(t => t.CampaignId == campaignId.Value);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TaskAdminDto
            {
                Id = t.Id,
                CampaignId = t.CampaignId,
                CampaignName = t.Campaign.CampaignName,
                Title = t.Title,
                Description = t.Description,
                Category = t.Category,
                VideoUrl = t.VideoUrl,
                DestinationUrl = t.DestinationUrl,
                ThumbnailUrl = t.ThumbnailUrl,
                Reward = t.Reward,
                RequiredDurationSeconds = t.RequiredDurationSeconds,
                DailyLimitPerUser = t.DailyLimitPerUser,
                TotalCompletionLimit = t.TotalCompletionLimit,
                CurrentCompletionCount = t.CurrentCompletionCount,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                IsActive = t.IsActive,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<TaskAdminDto>>.Ok(new PagedResult<TaskAdminDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<TaskAdminDto>> CreateTaskAsync(CreateTaskRequest request)
    {
        var campaign = await _db.Campaigns.FindAsync(request.CampaignId);
        if (campaign == null)
        {
            return ApiResponse<TaskAdminDto>.Fail("Target campaign not found.");
        }

        var task = new TaskItem
        {
            CampaignId = request.CampaignId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Category = request.Category.Trim(),
            VideoUrl = request.VideoUrl?.Trim(),
            DestinationUrl = request.DestinationUrl?.Trim(),
            ThumbnailUrl = request.ThumbnailUrl?.Trim(),
            Reward = request.Reward,
            RequiredDurationSeconds = request.RequiredDurationSeconds,
            DailyLimitPerUser = request.DailyLimitPerUser,
            TotalCompletionLimit = request.TotalCompletionLimit,
            CurrentCompletionCount = 0,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await _db.Tasks.AddAsync(task);
        await _db.SaveChangesAsync();

        return ApiResponse<TaskAdminDto>.Ok(new TaskAdminDto
        {
            Id = task.Id,
            CampaignId = task.CampaignId,
            CampaignName = campaign.CampaignName,
            Title = task.Title,
            Description = task.Description,
            Category = task.Category,
            VideoUrl = task.VideoUrl,
            DestinationUrl = task.DestinationUrl,
            ThumbnailUrl = task.ThumbnailUrl,
            Reward = task.Reward,
            RequiredDurationSeconds = task.RequiredDurationSeconds,
            DailyLimitPerUser = task.DailyLimitPerUser,
            TotalCompletionLimit = task.TotalCompletionLimit,
            CurrentCompletionCount = task.CurrentCompletionCount,
            StartDate = task.StartDate,
            EndDate = task.EndDate,
            IsActive = task.IsActive,
            CreatedAt = task.CreatedAt
        }, "Task created successfully.");
    }

    public async Task<ApiResponse<TaskAdminDto>> UpdateTaskAsync(long id, CreateTaskRequest request)
    {
        var task = await _db.Tasks.Include(t => t.Campaign).FirstOrDefaultAsync(t => t.Id == id);
        if (task == null)
        {
            return ApiResponse<TaskAdminDto>.Fail("Task not found.");
        }

        var campaign = await _db.Campaigns.FindAsync(request.CampaignId);
        if (campaign == null)
        {
            return ApiResponse<TaskAdminDto>.Fail("Campaign not found.");
        }

        task.CampaignId = request.CampaignId;
        task.Title = request.Title.Trim();
        task.Description = request.Description.Trim();
        task.Category = request.Category.Trim();
        task.VideoUrl = request.VideoUrl?.Trim();
        task.DestinationUrl = request.DestinationUrl?.Trim();
        task.ThumbnailUrl = request.ThumbnailUrl?.Trim();
        task.Reward = request.Reward;
        task.RequiredDurationSeconds = request.RequiredDurationSeconds;
        task.DailyLimitPerUser = request.DailyLimitPerUser;
        task.TotalCompletionLimit = request.TotalCompletionLimit;
        task.StartDate = request.StartDate;
        task.EndDate = request.EndDate;
        task.IsActive = request.IsActive;
        task.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return ApiResponse<TaskAdminDto>.Ok(new TaskAdminDto
        {
            Id = task.Id,
            CampaignId = task.CampaignId,
            CampaignName = campaign.CampaignName,
            Title = task.Title,
            Description = task.Description,
            Category = task.Category,
            VideoUrl = task.VideoUrl,
            DestinationUrl = task.DestinationUrl,
            ThumbnailUrl = task.ThumbnailUrl,
            Reward = task.Reward,
            RequiredDurationSeconds = task.RequiredDurationSeconds,
            DailyLimitPerUser = task.DailyLimitPerUser,
            TotalCompletionLimit = task.TotalCompletionLimit,
            CurrentCompletionCount = task.CurrentCompletionCount,
            StartDate = task.StartDate,
            EndDate = task.EndDate,
            IsActive = task.IsActive,
            CreatedAt = task.CreatedAt
        }, "Task updated successfully.");
    }
}
