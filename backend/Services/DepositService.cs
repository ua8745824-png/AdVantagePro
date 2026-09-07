using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public class DepositService : IDepositService
{
    private readonly NovyraDbContext _db;
    private readonly IWalletService _walletService;
    private readonly ILogger<DepositService> _logger;

    public DepositService(
        NovyraDbContext db,
        IWalletService walletService,
        ILogger<DepositService> logger)
    {
        _db = db;
        _walletService = walletService;
        _logger = logger;
    }

    public async Task<ApiResponse<DepositDto>> SubmitDepositAsync(long userId, DepositRequestDto request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.IsSuspended || !user.IsActive)
        {
            return ApiResponse<DepositDto>.Fail("Account is inactive or suspended.");
        }

        var method = await _db.PaymentMethods.FindAsync(request.PaymentMethodId);
        if (method == null || !method.IsEnabled)
        {
            return ApiResponse<DepositDto>.Fail("Selected payment method is unavailable.");
        }

        if (request.Amount < method.MinDeposit || request.Amount > method.MaxDeposit)
        {
            return ApiResponse<DepositDto>.Fail($"Deposit amount must be between {method.MinDeposit:N0} and {method.MaxDeposit:N0} PKR for {method.Name}.");
        }

        var deposit = new Deposit
        {
            UserId = userId,
            PaymentMethodId = request.PaymentMethodId,
            Amount = request.Amount,
            TransactionReference = request.TransactionReference.Trim(),
            ProofFilePath = request.ProofFilePath.Trim(),
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _db.Deposits.AddAsync(deposit);

        // Notify User of submission
        await _db.Notifications.AddAsync(new Notification
        {
            UserId = userId,
            Type = "SystemAnnouncement",
            Title = "Deposit Request Submitted",
            Message = $"Your deposit request of {request.Amount:N2} PKR via {method.Name} has been submitted for administrative review.",
            IsRead = false,
            ReferenceType = "Deposit",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return ApiResponse<DepositDto>.Ok(new DepositDto
        {
            Id = deposit.Id,
            UserId = userId,
            UserName = user.Username,
            UserEmail = user.Email,
            PaymentMethodId = method.Id,
            PaymentMethodName = method.Name,
            Amount = deposit.Amount,
            TransactionReference = deposit.TransactionReference,
            ProofFilePath = deposit.ProofFilePath,
            Status = deposit.Status,
            CreatedAt = deposit.CreatedAt
        }, "Deposit request submitted successfully. It will be verified shortly.");
    }

    public async Task<ApiResponse<PagedResult<DepositDto>>> GetUserDepositsAsync(
        long userId, int page, int pageSize, string? status)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.Deposits
            .Include(d => d.PaymentMethod)
            .Include(d => d.User)
            .Where(d => d.UserId == userId);

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(d => d.Status == status);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DepositDto
            {
                Id = d.Id,
                UserId = d.UserId,
                UserName = d.User.Username,
                UserEmail = d.User.Email,
                PaymentMethodId = d.PaymentMethodId,
                PaymentMethodName = d.PaymentMethod.Name,
                Amount = d.Amount,
                TransactionReference = d.TransactionReference,
                ProofFilePath = d.ProofFilePath,
                Status = d.Status,
                AdminNote = d.AdminNote,
                RejectionReason = d.RejectionReason,
                CreatedAt = d.CreatedAt,
                ReviewedAt = d.ReviewedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<DepositDto>>.Ok(new PagedResult<DepositDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<PagedResult<DepositDto>>> GetAdminDepositsAsync(
        int page, int pageSize, string? status, string? search)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.Deposits
            .Include(d => d.PaymentMethod)
            .Include(d => d.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(d => d.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(d => d.User.Username.ToLower().Contains(s) ||
                                     d.User.Email.ToLower().Contains(s) ||
                                     d.TransactionReference.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DepositDto
            {
                Id = d.Id,
                UserId = d.UserId,
                UserName = d.User.Username,
                UserEmail = d.User.Email,
                PaymentMethodId = d.PaymentMethodId,
                PaymentMethodName = d.PaymentMethod.Name,
                Amount = d.Amount,
                TransactionReference = d.TransactionReference,
                ProofFilePath = d.ProofFilePath,
                Status = d.Status,
                AdminNote = d.AdminNote,
                RejectionReason = d.RejectionReason,
                CreatedAt = d.CreatedAt,
                ReviewedAt = d.ReviewedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<DepositDto>>.Ok(new PagedResult<DepositDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<DepositDto>> ApproveDepositAsync(long depositId, long adminId, string? adminNote)
    {
        var deposit = await _db.Deposits
            .Include(d => d.User)
            .Include(d => d.PaymentMethod)
            .FirstOrDefaultAsync(d => d.Id == depositId);

        if (deposit == null)
        {
            return ApiResponse<DepositDto>.Fail("Deposit record not found.");
        }

        if (deposit.Status != "Pending")
        {
            return ApiResponse<DepositDto>.Fail($"Deposit cannot be approved because current status is '{deposit.Status}'.");
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            deposit.Status = "Approved";
            deposit.AdminNote = adminNote;
            deposit.ReviewedByAdminId = adminId;
            deposit.ReviewedAt = DateTime.UtcNow;

            // Credit wallet atomically
            var walletTx = await _walletService.CreditAsync(
                deposit.UserId,
                deposit.Amount,
                "Deposit",
                "Deposit",
                deposit.Id,
                $"Approved manual deposit via {deposit.PaymentMethod.Name} (Ref: {deposit.TransactionReference})",
                $"DEP-APP-{deposit.Id}",
                adminId
            );

            deposit.WalletTransactionId = walletTx.Id;

            // Audit Log
            await _db.AuditLogs.AddAsync(new AuditLog
            {
                ActorAdminId = adminId,
                Action = "DepositApproved",
                EntityType = "Deposit",
                EntityId = deposit.Id.ToString(),
                Reason = $"Approved deposit #{deposit.Id} of {deposit.Amount:N2} PKR for @{deposit.User.Username}",
                BeforeDataJson = "{\"status\": \"Pending\"}",
                AfterDataJson = $"{{\"status\": \"Approved\", \"amount\": {deposit.Amount}}}",
                CreatedAt = DateTime.UtcNow
            });

            // Notify User
            await _db.Notifications.AddAsync(new Notification
            {
                UserId = deposit.UserId,
                Type = "DepositApproved",
                Title = "Deposit Approved! 💳",
                Message = $"Your deposit of {deposit.Amount:N2} PKR has been verified and credited to your available balance.",
                IsRead = false,
                ReferenceType = "Deposit",
                ReferenceId = deposit.Id,
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return ApiResponse<DepositDto>.Ok(new DepositDto
            {
                Id = deposit.Id,
                UserId = deposit.UserId,
                UserName = deposit.User.Username,
                UserEmail = deposit.User.Email,
                PaymentMethodId = deposit.PaymentMethodId,
                PaymentMethodName = deposit.PaymentMethod.Name,
                Amount = deposit.Amount,
                TransactionReference = deposit.TransactionReference,
                ProofFilePath = deposit.ProofFilePath,
                Status = deposit.Status,
                AdminNote = deposit.AdminNote,
                CreatedAt = deposit.CreatedAt,
                ReviewedAt = deposit.ReviewedAt
            }, "Deposit approved and user wallet credited successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to approve deposit #{DepositId}: {Message}", depositId, ex.Message);
            return ApiResponse<DepositDto>.Fail($"Approval failed: {ex.Message}");
        }
    }

    public async Task<ApiResponse<DepositDto>> RejectDepositAsync(long depositId, long adminId, string? rejectionReason)
    {
        var deposit = await _db.Deposits
            .Include(d => d.User)
            .Include(d => d.PaymentMethod)
            .FirstOrDefaultAsync(d => d.Id == depositId);

        if (deposit == null)
        {
            return ApiResponse<DepositDto>.Fail("Deposit record not found.");
        }

        if (deposit.Status != "Pending")
        {
            return ApiResponse<DepositDto>.Fail($"Deposit cannot be rejected because current status is '{deposit.Status}'.");
        }

        deposit.Status = "Rejected";
        deposit.RejectionReason = rejectionReason ?? "Proof or transaction reference verification failed.";
        deposit.ReviewedByAdminId = adminId;
        deposit.ReviewedAt = DateTime.UtcNow;

        // Audit Log
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            ActorAdminId = adminId,
            Action = "DepositRejected",
            EntityType = "Deposit",
            EntityId = deposit.Id.ToString(),
            Reason = $"Rejected deposit #{deposit.Id}: {deposit.RejectionReason}",
            BeforeDataJson = "{\"status\": \"Pending\"}",
            AfterDataJson = $"{{\"status\": \"Rejected\", \"reason\": \"{deposit.RejectionReason}\"}}",
            CreatedAt = DateTime.UtcNow
        });

        // Notify User
        await _db.Notifications.AddAsync(new Notification
        {
            UserId = deposit.UserId,
            Type = "DepositRejected",
            Title = "Deposit Request Rejected",
            Message = $"Your deposit request of {deposit.Amount:N2} PKR was rejected. Reason: {deposit.RejectionReason}",
            IsRead = false,
            ReferenceType = "Deposit",
            ReferenceId = deposit.Id,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return ApiResponse<DepositDto>.Ok(new DepositDto
        {
            Id = deposit.Id,
            UserId = deposit.UserId,
            UserName = deposit.User.Username,
            UserEmail = deposit.User.Email,
            PaymentMethodId = deposit.PaymentMethodId,
            PaymentMethodName = deposit.PaymentMethod.Name,
            Amount = deposit.Amount,
            TransactionReference = deposit.TransactionReference,
            ProofFilePath = deposit.ProofFilePath,
            Status = deposit.Status,
            RejectionReason = deposit.RejectionReason,
            CreatedAt = deposit.CreatedAt,
            ReviewedAt = deposit.ReviewedAt
        }, "Deposit request rejected.");
    }
}
