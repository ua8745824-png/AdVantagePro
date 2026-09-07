using System.ComponentModel.DataAnnotations;

namespace Novyra.Backend.DTOs;

public class ReferralSummaryDto
{
    public string ReferralCode { get; set; } = string.Empty;
    public string ReferralLink { get; set; } = string.Empty;
    public int TotalReferrals { get; set; }
    public int ActiveReferrals { get; set; }
    public decimal TotalCommissionEarned { get; set; }
    public decimal CommissionPercentage { get; set; }
}

public class ReferredUserDto
{
    public long UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
    public decimal TotalGeneratedCommission { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class ReferralCommissionDto
{
    public long Id { get; set; }
    public string ReferredUsername { get; set; } = string.Empty;
    public decimal TaskRewardAmount { get; set; }
    public decimal CommissionPercentage { get; set; }
    public decimal CommissionAmount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class NotificationDto
{
    public long Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public string? ReferenceType { get; set; }
    public long? ReferenceId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTicketRequest
{
    [Required, StringLength(200, MinimumLength = 5)]
    public string Subject { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Category { get; set; } = "General"; // Account, Deposit, Withdrawal, TaskReward, Technical, General

    [Required]
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Urgent

    [Required, StringLength(5000, MinimumLength = 10)]
    public string InitialMessage { get; set; } = string.Empty;

    public string? AttachmentPath { get; set; }
}

public class TicketReplyRequest
{
    [Required, StringLength(5000, MinimumLength = 2)]
    public string Message { get; set; } = string.Empty;

    public string? AttachmentPath { get; set; }
}

public class SupportTicketDto
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string TicketNumber { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public List<SupportMessageDto> Messages { get; set; } = new();
}

public class SupportMessageDto
{
    public long Id { get; set; }
    public long SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderRole { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? AttachmentPath { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminDashboardKpiDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int PendingDeposits { get; set; }
    public decimal PendingDepositsAmount { get; set; }
    public int PendingWithdrawals { get; set; }
    public decimal PendingWithdrawalsAmount { get; set; }
    public decimal TotalDepositsApproved { get; set; }
    public decimal TotalWithdrawalsPaid { get; set; }
    public decimal TotalTaskRewardsDistributed { get; set; }
    public decimal TotalReferralCommissionsDistributed { get; set; }
    public int OpenFraudFlags { get; set; }
    public int OpenSupportTickets { get; set; }
    public int ActiveCampaigns { get; set; }
    public int ActiveTasks { get; set; }
}

public class FraudFlagDto
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FlagType { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string? MetadataJson { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}

public class AuditLogDto
{
    public long Id { get; set; }
    public long? ActorAdminId { get; set; }
    public string? ActorUsername { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? BeforeDataJson { get; set; }
    public string? AfterDataJson { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SystemSettingDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}

public class UpdateSystemSettingRequest
{
    [Required]
    public string Value { get; set; } = string.Empty;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / (PageSize > 0 ? PageSize : 10));
}
