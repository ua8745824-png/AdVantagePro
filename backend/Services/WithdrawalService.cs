using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public class WithdrawalService : IWithdrawalService
{
    private readonly NovyraDbContext _db;
    private readonly IWalletService _walletService;
    private readonly ISettingsService _settingsService;
    private readonly ILogger<WithdrawalService> _logger;

    public WithdrawalService(
        NovyraDbContext db,
        IWalletService walletService,
        ISettingsService settingsService,
        ILogger<WithdrawalService> logger)
    {
        _db = db;
        _walletService = walletService;
        _settingsService = settingsService;
        _logger = logger;
    }

    public async Task<ApiResponse<WithdrawalFeePreviewDto>> CalculateFeePreviewAsync(
        long userId, int paymentMethodId, decimal amount)
    {
        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        var availableBalance = wallet?.AvailableBalance ?? 0.00m;

        var method = await _db.PaymentMethods.FindAsync(paymentMethodId);
        if (method == null || !method.IsEnabled)
        {
            return ApiResponse<WithdrawalFeePreviewDto>.Fail("Selected payment method is unavailable.");
        }

        var fixedFee = await _settingsService.GetDecimalSettingAsync("WithdrawalFixedFeePKR", 0.00m);
        var percentageFeeRate = await _settingsService.GetDecimalSettingAsync("WithdrawalPercentageFee", 0.00m);

        var percentageFee = Math.Round(amount * (percentageFeeRate / 100.00m), 2);
        var totalFee = fixedFee + percentageFee;
        var netAmount = amount - totalFee;

        var isEligible = amount >= method.MinWithdrawal && amount <= method.MaxWithdrawal && availableBalance >= amount && netAmount > 0;

        return ApiResponse<WithdrawalFeePreviewDto>.Ok(new WithdrawalFeePreviewDto
        {
            RequestedAmount = amount,
            FixedFee = fixedFee,
            PercentageFee = percentageFee,
            TotalFee = totalFee,
            NetAmount = netAmount,
            AvailableBalance = availableBalance,
            IsEligible = isEligible
        });
    }

    public async Task<ApiResponse<WithdrawalDto>> RequestWithdrawalAsync(
        long userId, WithdrawalRequestDto request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.IsSuspended || !user.IsActive)
        {
            return ApiResponse<WithdrawalDto>.Fail("Account is inactive or suspended.");
        }

        var method = await _db.PaymentMethods.FindAsync(request.PaymentMethodId);
        if (method == null || !method.IsEnabled)
        {
            return ApiResponse<WithdrawalDto>.Fail("Selected payment method is currently disabled.");
        }

        var minSetting = await _settingsService.GetDecimalSettingAsync("MinWithdrawalAmountPKR", 500.00m);
        var effectiveMin = Math.Max(minSetting, method.MinWithdrawal);

        if (request.RequestedAmount < effectiveMin || request.RequestedAmount > method.MaxWithdrawal)
        {
            return ApiResponse<WithdrawalDto>.Fail($"Withdrawal amount must be between {effectiveMin:N0} and {method.MaxWithdrawal:N0} PKR.");
        }

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null || wallet.AvailableBalance < request.RequestedAmount)
        {
            return ApiResponse<WithdrawalDto>.Fail($"Insufficient available balance ({wallet?.AvailableBalance ?? 0.00m:N2} PKR).");
        }

        // Calculate fees
        var fixedFee = await _settingsService.GetDecimalSettingAsync("WithdrawalFixedFeePKR", 0.00m);
        var percentageFeeRate = await _settingsService.GetDecimalSettingAsync("WithdrawalPercentageFee", 0.00m);
        var percentageFee = Math.Round(request.RequestedAmount * (percentageFeeRate / 100.00m), 2);
        var totalFee = fixedFee + percentageFee;
        var netAmount = request.RequestedAmount - totalFee;

        if (netAmount <= 0)
        {
            return ApiResponse<WithdrawalDto>.Fail("Requested amount is too low after fee deductions.");
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var withdrawal = new Withdrawal
            {
                UserId = userId,
                PaymentMethodId = method.Id,
                RequestedAmount = request.RequestedAmount,
                FeeAmount = totalFee,
                NetAmount = netAmount,
                PayoutAccountTitle = request.PayoutAccountTitle.Trim(),
                PayoutAccountNumber = request.PayoutAccountNumber.Trim(),
                PayoutBankName = request.PayoutBankName?.Trim(),
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            await _db.Withdrawals.AddAsync(withdrawal);
            await _db.SaveChangesAsync();

            // Reserve funds in wallet atomically
            var reservationTx = await _walletService.ReserveFundsForWithdrawalAsync(
                userId,
                request.RequestedAmount,
                withdrawal.Id,
                $"WTH-REQ-{withdrawal.Id}"
            );

            withdrawal.ReservationWalletTransactionId = reservationTx.Id;

            // Notify User
            await _db.Notifications.AddAsync(new Notification
            {
                UserId = userId,
                Type = "WithdrawalUpdate",
                Title = "Withdrawal Request Submitted",
                Message = $"Your withdrawal request of {request.RequestedAmount:N2} PKR (Net: {netAmount:N2} PKR via {method.Name}) has been received and reserved.",
                IsRead = false,
                ReferenceType = "Withdrawal",
                ReferenceId = withdrawal.Id,
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return ApiResponse<WithdrawalDto>.Ok(new WithdrawalDto
            {
                Id = withdrawal.Id,
                UserId = userId,
                UserName = user.Username,
                UserEmail = user.Email,
                PaymentMethodId = method.Id,
                PaymentMethodName = method.Name,
                RequestedAmount = withdrawal.RequestedAmount,
                FeeAmount = withdrawal.FeeAmount,
                NetAmount = withdrawal.NetAmount,
                PayoutAccountTitle = withdrawal.PayoutAccountTitle,
                PayoutAccountNumber = withdrawal.PayoutAccountNumber,
                PayoutBankName = withdrawal.PayoutBankName,
                Status = withdrawal.Status,
                CreatedAt = withdrawal.CreatedAt
            }, "Withdrawal request submitted successfully. Funds have been reserved.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error processing withdrawal request for user {UserId}: {Message}", userId, ex.Message);
            return ApiResponse<WithdrawalDto>.Fail($"Withdrawal request failed: {ex.Message}");
        }
    }

    public async Task<ApiResponse<PagedResult<WithdrawalDto>>> GetUserWithdrawalsAsync(
        long userId, int page, int pageSize, string? status)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.Withdrawals
            .Include(w => w.PaymentMethod)
            .Include(w => w.User)
            .Where(w => w.UserId == userId);

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(w => w.Status == status);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(w => w.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(w => new WithdrawalDto
            {
                Id = w.Id,
                UserId = w.UserId,
                UserName = w.User.Username,
                UserEmail = w.User.Email,
                PaymentMethodId = w.PaymentMethodId,
                PaymentMethodName = w.PaymentMethod.Name,
                RequestedAmount = w.RequestedAmount,
                FeeAmount = w.FeeAmount,
                NetAmount = w.NetAmount,
                PayoutAccountTitle = w.PayoutAccountTitle,
                PayoutAccountNumber = w.PayoutAccountNumber,
                PayoutBankName = w.PayoutBankName,
                Status = w.Status,
                RejectionReason = w.RejectionReason,
                AdminNote = w.AdminNote,
                TransactionReference = w.TransactionReference,
                CreatedAt = w.CreatedAt,
                ReviewedAt = w.ReviewedAt,
                PaidAt = w.PaidAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<WithdrawalDto>>.Ok(new PagedResult<WithdrawalDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<PagedResult<WithdrawalDto>>> GetAdminWithdrawalsAsync(
        int page, int pageSize, string? status, string? search)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.Withdrawals
            .Include(w => w.PaymentMethod)
            .Include(w => w.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(w => w.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(w => w.User.Username.ToLower().Contains(s) ||
                                     w.User.Email.ToLower().Contains(s) ||
                                     w.PayoutAccountNumber.ToLower().Contains(s) ||
                                     (w.TransactionReference != null && w.TransactionReference.ToLower().Contains(s)));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(w => w.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(w => new WithdrawalDto
            {
                Id = w.Id,
                UserId = w.UserId,
                UserName = w.User.Username,
                UserEmail = w.User.Email,
                PaymentMethodId = w.PaymentMethodId,
                PaymentMethodName = w.PaymentMethod.Name,
                RequestedAmount = w.RequestedAmount,
                FeeAmount = w.FeeAmount,
                NetAmount = w.NetAmount,
                PayoutAccountTitle = w.PayoutAccountTitle,
                PayoutAccountNumber = w.PayoutAccountNumber,
                PayoutBankName = w.PayoutBankName,
                Status = w.Status,
                RejectionReason = w.RejectionReason,
                AdminNote = w.AdminNote,
                TransactionReference = w.TransactionReference,
                CreatedAt = w.CreatedAt,
                ReviewedAt = w.ReviewedAt,
                PaidAt = w.PaidAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<WithdrawalDto>>.Ok(new PagedResult<WithdrawalDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<WithdrawalDto>> ApproveWithdrawalAsync(
        long withdrawalId, long adminId, string? adminNote)
    {
        var withdrawal = await _db.Withdrawals.Include(w => w.User).Include(w => w.PaymentMethod).FirstOrDefaultAsync(w => w.Id == withdrawalId);
        if (withdrawal == null)
        {
            return ApiResponse<WithdrawalDto>.Fail("Withdrawal record not found.");
        }

        if (withdrawal.Status != "Pending")
        {
            return ApiResponse<WithdrawalDto>.Fail($"Withdrawal cannot be approved from status '{withdrawal.Status}'.");
        }

        withdrawal.Status = "Approved";
        withdrawal.AdminNote = adminNote;
        withdrawal.ReviewedByAdminId = adminId;
        withdrawal.ReviewedAt = DateTime.UtcNow;

        await _db.AuditLogs.AddAsync(new AuditLog
        {
            ActorAdminId = adminId,
            Action = "WithdrawalApproved",
            EntityType = "Withdrawal",
            EntityId = withdrawal.Id.ToString(),
            Reason = $"Approved withdrawal #{withdrawal.Id} ({withdrawal.RequestedAmount:N2} PKR)",
            BeforeDataJson = "{\"status\": \"Pending\"}",
            AfterDataJson = "{\"status\": \"Approved\"}",
            CreatedAt = DateTime.UtcNow
        });

        await _db.Notifications.AddAsync(new Notification
        {
            UserId = withdrawal.UserId,
            Type = "WithdrawalUpdate",
            Title = "Withdrawal Approved",
            Message = $"Your withdrawal #{withdrawal.Id} of {withdrawal.RequestedAmount:N2} PKR has been approved and queued for payout processing.",
            IsRead = false,
            ReferenceType = "Withdrawal",
            ReferenceId = withdrawal.Id,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return ApiResponse<WithdrawalDto>.Ok(MapToDto(withdrawal), "Withdrawal approved.");
    }

    public async Task<ApiResponse<WithdrawalDto>> MarkProcessingAsync(long withdrawalId, long adminId)
    {
        var withdrawal = await _db.Withdrawals.Include(w => w.User).Include(w => w.PaymentMethod).FirstOrDefaultAsync(w => w.Id == withdrawalId);
        if (withdrawal == null)
        {
            return ApiResponse<WithdrawalDto>.Fail("Withdrawal record not found.");
        }

        if (withdrawal.Status != "Pending" && withdrawal.Status != "Approved")
        {
            return ApiResponse<WithdrawalDto>.Fail($"Withdrawal cannot be marked processing from status '{withdrawal.Status}'.");
        }

        withdrawal.Status = "Processing";
        withdrawal.ReviewedByAdminId = adminId;
        withdrawal.ReviewedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ApiResponse<WithdrawalDto>.Ok(MapToDto(withdrawal), "Withdrawal marked as Processing.");
    }

    public async Task<ApiResponse<WithdrawalDto>> MarkPaidAsync(
        long withdrawalId, long adminId, string transactionReference)
    {
        if (string.IsNullOrWhiteSpace(transactionReference))
        {
            return ApiResponse<WithdrawalDto>.Fail("Transaction reference/TXID is required when marking a withdrawal as paid.");
        }

        var withdrawal = await _db.Withdrawals
            .Include(w => w.User)
            .Include(w => w.PaymentMethod)
            .FirstOrDefaultAsync(w => w.Id == withdrawalId);

        if (withdrawal == null)
        {
            return ApiResponse<WithdrawalDto>.Fail("Withdrawal record not found.");
        }

        if (withdrawal.Status == "Paid")
        {
            return ApiResponse<WithdrawalDto>.Fail("This withdrawal has already been marked as Paid.");
        }

        if (withdrawal.Status == "Rejected")
        {
            return ApiResponse<WithdrawalDto>.Fail("Cannot mark a rejected withdrawal as Paid.");
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            withdrawal.Status = "Paid";
            withdrawal.TransactionReference = transactionReference.Trim();
            withdrawal.PaidAt = DateTime.UtcNow;
            withdrawal.ReviewedByAdminId = adminId;
            withdrawal.ReviewedAt = DateTime.UtcNow;

            // Finalize reserved funds
            var finalTx = await _walletService.FinalizePaidWithdrawalAsync(
                withdrawal.UserId,
                withdrawal.RequestedAmount,
                withdrawal.Id,
                transactionReference.Trim(),
                adminId
            );

            withdrawal.FinalWalletTransactionId = finalTx.Id;

            // Audit Log
            await _db.AuditLogs.AddAsync(new AuditLog
            {
                ActorAdminId = adminId,
                Action = "WithdrawalPaid",
                EntityType = "Withdrawal",
                EntityId = withdrawal.Id.ToString(),
                Reason = $"Marked withdrawal #{withdrawal.Id} as Paid with Ref: {transactionReference}",
                BeforeDataJson = "{\"status\": \"Processing\"}",
                AfterDataJson = $"{{\"status\": \"Paid\", \"txRef\": \"{transactionReference}\"}}",
                CreatedAt = DateTime.UtcNow
            });

            // Notify User
            await _db.Notifications.AddAsync(new Notification
            {
                UserId = withdrawal.UserId,
                Type = "WithdrawalUpdate",
                Title = "Withdrawal Paid! 💸",
                Message = $"Your withdrawal of {withdrawal.NetAmount:N2} PKR via {withdrawal.PaymentMethod.Name} has been dispatched. Ref / TXID: {transactionReference}",
                IsRead = false,
                ReferenceType = "Withdrawal",
                ReferenceId = withdrawal.Id,
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return ApiResponse<WithdrawalDto>.Ok(MapToDto(withdrawal), "Withdrawal marked as Paid successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to mark withdrawal #{WithdrawalId} as paid: {Message}", withdrawalId, ex.Message);
            return ApiResponse<WithdrawalDto>.Fail($"Operation failed: {ex.Message}");
        }
    }

    public async Task<ApiResponse<WithdrawalDto>> RejectWithdrawalAsync(
        long withdrawalId, long adminId, string rejectionReason)
    {
        if (string.IsNullOrWhiteSpace(rejectionReason))
        {
            return ApiResponse<WithdrawalDto>.Fail("A clear rejection reason is mandatory.");
        }

        var withdrawal = await _db.Withdrawals
            .Include(w => w.User)
            .Include(w => w.PaymentMethod)
            .FirstOrDefaultAsync(w => w.Id == withdrawalId);

        if (withdrawal == null)
        {
            return ApiResponse<WithdrawalDto>.Fail("Withdrawal record not found.");
        }

        if (withdrawal.Status == "Paid")
        {
            return ApiResponse<WithdrawalDto>.Fail("Cannot reject a withdrawal that has already been paid.");
        }

        if (withdrawal.Status == "Rejected")
        {
            return ApiResponse<WithdrawalDto>.Fail("Withdrawal is already rejected.");
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            withdrawal.Status = "Rejected";
            withdrawal.RejectionReason = rejectionReason.Trim();
            withdrawal.ReviewedByAdminId = adminId;
            withdrawal.ReviewedAt = DateTime.UtcNow;

            // Refund reserved funds back to AvailableBalance
            await _walletService.RefundReservedFundsAsync(
                withdrawal.UserId,
                withdrawal.RequestedAmount,
                withdrawal.Id,
                rejectionReason.Trim(),
                adminId
            );

            // Audit Log
            await _db.AuditLogs.AddAsync(new AuditLog
            {
                ActorAdminId = adminId,
                Action = "WithdrawalRejected",
                EntityType = "Withdrawal",
                EntityId = withdrawal.Id.ToString(),
                Reason = $"Rejected withdrawal #{withdrawal.Id}: {rejectionReason}",
                BeforeDataJson = "{\"status\": \"Pending\"}",
                AfterDataJson = $"{{\"status\": \"Rejected\", \"reason\": \"{rejectionReason}\"}}",
                CreatedAt = DateTime.UtcNow
            });

            // Notify User
            await _db.Notifications.AddAsync(new Notification
            {
                UserId = withdrawal.UserId,
                Type = "WithdrawalUpdate",
                Title = "Withdrawal Request Rejected (Funds Refunded)",
                Message = $"Your withdrawal #{withdrawal.Id} of {withdrawal.RequestedAmount:N2} PKR was rejected and refunded to your available balance. Reason: {rejectionReason}",
                IsRead = false,
                ReferenceType = "Withdrawal",
                ReferenceId = withdrawal.Id,
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return ApiResponse<WithdrawalDto>.Ok(MapToDto(withdrawal), "Withdrawal rejected and reserved funds refunded successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to reject withdrawal #{WithdrawalId}: {Message}", withdrawalId, ex.Message);
            return ApiResponse<WithdrawalDto>.Fail($"Rejection failed: {ex.Message}");
        }
    }

    private static WithdrawalDto MapToDto(Withdrawal w)
    {
        return new WithdrawalDto
        {
            Id = w.Id,
            UserId = w.UserId,
            UserName = w.User.Username,
            UserEmail = w.User.Email,
            PaymentMethodId = w.PaymentMethodId,
            PaymentMethodName = w.PaymentMethod.Name,
            RequestedAmount = w.RequestedAmount,
            FeeAmount = w.FeeAmount,
            NetAmount = w.NetAmount,
            PayoutAccountTitle = w.PayoutAccountTitle,
            PayoutAccountNumber = w.PayoutAccountNumber,
            PayoutBankName = w.PayoutBankName,
            Status = w.Status,
            RejectionReason = w.RejectionReason,
            AdminNote = w.AdminNote,
            TransactionReference = w.TransactionReference,
            CreatedAt = w.CreatedAt,
            ReviewedAt = w.ReviewedAt,
            PaidAt = w.PaidAt
        };
    }
}
