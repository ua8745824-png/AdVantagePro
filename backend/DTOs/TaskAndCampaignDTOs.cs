using System.ComponentModel.DataAnnotations;

namespace Novyra.Backend.DTOs;

public class TaskUserViewDto
{
    public long Id { get; set; }
    public long CampaignId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public string? DestinationUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public decimal Reward { get; set; }
    public int RequiredDurationSeconds { get; set; }
    public int DailyLimitPerUser { get; set; }
    public int TodayCompletedCount { get; set; }
    public bool CanStart { get; set; }
    public string? StatusMessage { get; set; }
}

public class StartTaskSessionResponse
{
    public long SessionId { get; set; }
    public string SessionNonce { get; set; } = string.Empty;
    public long TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public string? DestinationUrl { get; set; }
    public decimal Reward { get; set; }
    public int RequiredDurationSeconds { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
}

public class CompleteTaskSessionRequest
{
    [Required]
    public string SessionNonce { get; set; } = string.Empty;
}

public class CompleteTaskSessionResponse
{
    public long TaskCompletionId { get; set; }
    public decimal RewardAmount { get; set; }
    public decimal NewAvailableBalance { get; set; }
    public DateTime CompletedAt { get; set; }
}

public class CampaignAdminDto
{
    public long Id { get; set; }
    public string CampaignName { get; set; } = string.Empty;
    public string AdvertiserName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal RewardPerCompletion { get; set; }
    public decimal PlatformCommission { get; set; }
    public decimal DailyBudget { get; set; }
    public decimal TotalBudget { get; set; }
    public decimal SpentBudget { get; set; }
    public decimal TodaySpent { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TasksCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateCampaignRequest
{
    [Required, StringLength(150)]
    public string CampaignName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string AdvertiserName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required, Range(0.50, 5000.00)]
    public decimal RewardPerCompletion { get; set; }

    [Range(0.00, 5000.00)]
    public decimal PlatformCommission { get; set; } = 0.00m;

    [Required, Range(10.00, 1000000.00)]
    public decimal DailyBudget { get; set; }

    [Required, Range(50.00, 10000000.00)]
    public decimal TotalBudget { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public string Status { get; set; } = "Active";
}

public class TaskAdminDto
{
    public long Id { get; set; }
    public long CampaignId { get; set; }
    public string CampaignName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public string? DestinationUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public decimal Reward { get; set; }
    public int RequiredDurationSeconds { get; set; }
    public int DailyLimitPerUser { get; set; }
    public int TotalCompletionLimit { get; set; }
    public int CurrentCompletionCount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTaskRequest
{
    [Required]
    public long CampaignId { get; set; }

    [Required, StringLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Category { get; set; } = "Video";

    [StringLength(500)]
    public string? VideoUrl { get; set; }

    [StringLength(500)]
    public string? DestinationUrl { get; set; }

    [StringLength(500)]
    public string? ThumbnailUrl { get; set; }

    [Required, Range(0.50, 5000.00)]
    public decimal Reward { get; set; }

    [Required, Range(5, 600)]
    public int RequiredDurationSeconds { get; set; } = 30;

    [Required, Range(1, 100)]
    public int DailyLimitPerUser { get; set; } = 1;

    [Required, Range(1, 1000000)]
    public int TotalCompletionLimit { get; set; } = 1000;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; } = true;
}
