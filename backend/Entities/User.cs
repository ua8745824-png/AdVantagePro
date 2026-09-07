namespace Novyra.Backend.Entities;

public class User
{
    public long Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string ReferralCode { get; set; } = string.Empty;
    public long? ReferredByUserId { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsSuspended { get; set; } = false;
    public string? SuspensionReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public User? ReferredByUser { get; set; }
    public ICollection<User> ReferredUsers { get; set; } = new List<User>();
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public Wallet? Wallet { get; set; }
    public ICollection<WalletTransaction> WalletTransactions { get; set; } = new List<WalletTransaction>();
    public ICollection<Deposit> Deposits { get; set; } = new List<Deposit>();
    public ICollection<Withdrawal> Withdrawals { get; set; } = new List<Withdrawal>();
    public ICollection<TaskSession> TaskSessions { get; set; } = new List<TaskSession>();
    public ICollection<TaskCompletion> TaskCompletions { get; set; } = new List<TaskCompletion>();
    public ICollection<ReferralRelationship> ReferralsGiven { get; set; } = new List<ReferralRelationship>();
    public ReferralRelationship? ReferralReceived { get; set; }
    public ICollection<ReferralCommission> ReferralCommissionsEarned { get; set; } = new List<ReferralCommission>();
    public ICollection<ReferralCommission> ReferralCommissionsGenerated { get; set; } = new List<ReferralCommission>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<SupportTicket> SupportTickets { get; set; } = new List<SupportTicket>();
    public ICollection<SupportMessage> SupportMessages { get; set; } = new List<SupportMessage>();
    public ICollection<FraudFlag> FraudFlags { get; set; } = new List<FraudFlag>();
}
