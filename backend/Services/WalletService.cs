using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public class WalletService : IWalletService
{
    private readonly NovyraDbContext _db;
    private readonly ILogger<WalletService> _logger;

    public WalletService(NovyraDbContext db, ILogger<WalletService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<ApiResponse<WalletSummaryDto>> GetWalletSummaryAsync(long userId)
    {
        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null)
        {
            // Initialize if missing
            wallet = new Wallet
            {
                UserId = userId,
                AvailableBalance = 0.00m,
                ReservedBalance = 0.00m,
                TotalEarned = 0.00m,
                TotalWithdrawn = 0.00m,
                ReferralEarnings = 0.00m,
                CreatedAt = DateTime.UtcNow
            };
            await _db.Wallets.AddAsync(wallet);
            await _db.SaveChangesAsync();
        }

        var todayUtc = DateTime.UtcNow.Date;
        var todayEarnings = await _db.WalletTransactions
            .Where(t => t.UserId == userId && t.CreatedAt >= todayUtc &&
                       (t.TransactionType == "TaskReward" || t.TransactionType == "ReferralCommission"))
            .SumAsync(t => (decimal?)t.Amount) ?? 0.00m;

        return ApiResponse<WalletSummaryDto>.Ok(new WalletSummaryDto
        {
            UserId = userId,
            AvailableBalance = wallet.AvailableBalance,
            ReservedBalance = wallet.ReservedBalance,
            TotalEarned = wallet.TotalEarned,
            TotalWithdrawn = wallet.TotalWithdrawn,
            ReferralEarnings = wallet.ReferralEarnings,
            TodayEarnings = todayEarnings,
            UpdatedAt = wallet.UpdatedAt ?? wallet.CreatedAt
        });
    }

    public async Task<ApiResponse<PagedResult<WalletTransactionDto>>> GetTransactionsAsync(
        long userId, int page, int pageSize, string? type, DateTime? fromDate, DateTime? toDate)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.WalletTransactions.Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(type) && type != "All")
        {
            query = query.Where(t => t.TransactionType == type);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(t => t.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(t => t.CreatedAt <= toDate.Value);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new WalletTransactionDto
            {
                Id = t.Id,
                TransactionType = t.TransactionType,
                Amount = t.Amount,
                BalanceBefore = t.BalanceBefore,
                BalanceAfter = t.BalanceAfter,
                ReferenceType = t.ReferenceType,
                ReferenceId = t.ReferenceId,
                Description = t.Description,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<WalletTransactionDto>>.Ok(new PagedResult<WalletTransactionDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<WalletTransaction> CreditAsync(
        long userId, decimal amount, string transactionType, string? referenceType,
        long? referenceId, string description, string? idempotencyKey, long? adminId = null)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Credit amount must be strictly positive.", nameof(amount));
        }

        // Check Idempotency Key
        if (!string.IsNullOrEmpty(idempotencyKey))
        {
            var existingTx = await _db.WalletTransactions
                .FirstOrDefaultAsync(t => t.IdempotencyKey == idempotencyKey);
            if (existingTx != null)
            {
                _logger.LogWarning("Duplicate credit prevented by idempotency key: {Key}", idempotencyKey);
                return existingTx;
            }
        }

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null)
        {
            wallet = new Wallet
            {
                UserId = userId,
                AvailableBalance = 0.00m,
                ReservedBalance = 0.00m,
                TotalEarned = 0.00m,
                TotalWithdrawn = 0.00m,
                ReferralEarnings = 0.00m,
                CreatedAt = DateTime.UtcNow
            };
            await _db.Wallets.AddAsync(wallet);
            await _db.SaveChangesAsync();
        }

        var balanceBefore = wallet.AvailableBalance;
        wallet.AvailableBalance += amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        if (transactionType == "TaskReward")
        {
            wallet.TotalEarned += amount;
        }
        else if (transactionType == "ReferralCommission")
        {
            wallet.TotalEarned += amount;
            wallet.ReferralEarnings += amount;
        }

        var balanceAfter = wallet.AvailableBalance;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            UserId = userId,
            TransactionType = transactionType,
            Amount = amount,
            BalanceBefore = balanceBefore,
            BalanceAfter = balanceAfter,
            ReferenceType = referenceType,
            ReferenceId = referenceId,
            IdempotencyKey = idempotencyKey,
            Description = description,
            CreatedByAdminId = adminId,
            CreatedAt = DateTime.UtcNow
        };

        await _db.WalletTransactions.AddAsync(transaction);
        await _db.SaveChangesAsync();

        return transaction;
    }

    public async Task<WalletTransaction> DebitAsync(
        long userId, decimal amount, string transactionType, string? referenceType,
        long? referenceId, string description, string? idempotencyKey, long? adminId = null)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Debit amount must be strictly positive.", nameof(amount));
        }

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null || wallet.AvailableBalance < amount)
        {
            throw new InvalidOperationException($"Insufficient balance to perform debit. Available: {wallet?.AvailableBalance ?? 0.00m}, Required: {amount}");
        }

        var balanceBefore = wallet.AvailableBalance;
        wallet.AvailableBalance -= amount;
        wallet.UpdatedAt = DateTime.UtcNow;
        var balanceAfter = wallet.AvailableBalance;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            UserId = userId,
            TransactionType = transactionType,
            Amount = amount,
            BalanceBefore = balanceBefore,
            BalanceAfter = balanceAfter,
            ReferenceType = referenceType,
            ReferenceId = referenceId,
            IdempotencyKey = idempotencyKey,
            Description = description,
            CreatedByAdminId = adminId,
            CreatedAt = DateTime.UtcNow
        };

        await _db.WalletTransactions.AddAsync(transaction);
        await _db.SaveChangesAsync();

        return transaction;
    }

    public async Task<WalletTransaction> ReserveFundsForWithdrawalAsync(
        long userId, decimal amount, long withdrawalId, string? idempotencyKey)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Reservation amount must be strictly positive.", nameof(amount));
        }

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null || wallet.AvailableBalance < amount)
        {
            throw new InvalidOperationException($"Insufficient available balance for withdrawal reservation. Available: {wallet?.AvailableBalance ?? 0.00m}, Requested: {amount}");
        }

        var balanceBefore = wallet.AvailableBalance;
        wallet.AvailableBalance -= amount;
        wallet.ReservedBalance += amount;
        wallet.UpdatedAt = DateTime.UtcNow;
        var balanceAfter = wallet.AvailableBalance;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            UserId = userId,
            TransactionType = "WithdrawalReservation",
            Amount = amount,
            BalanceBefore = balanceBefore,
            BalanceAfter = balanceAfter,
            ReferenceType = "Withdrawal",
            ReferenceId = withdrawalId,
            IdempotencyKey = idempotencyKey,
            Description = $"Funds reserved for Withdrawal #{withdrawalId}",
            CreatedAt = DateTime.UtcNow
        };

        await _db.WalletTransactions.AddAsync(transaction);
        await _db.SaveChangesAsync();

        return transaction;
    }

    public async Task<WalletTransaction> RefundReservedFundsAsync(
        long userId, decimal amount, long withdrawalId, string reason, long? adminId = null)
    {
        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null || wallet.ReservedBalance < amount)
        {
            throw new InvalidOperationException($"Cannot refund withdrawal #{withdrawalId}. Reserved balance ({wallet?.ReservedBalance ?? 0.00m}) is less than refund amount ({amount}).");
        }

        var balanceBefore = wallet.AvailableBalance;
        wallet.ReservedBalance -= amount;
        wallet.AvailableBalance += amount;
        wallet.UpdatedAt = DateTime.UtcNow;
        var balanceAfter = wallet.AvailableBalance;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            UserId = userId,
            TransactionType = "WithdrawalRefund",
            Amount = amount,
            BalanceBefore = balanceBefore,
            BalanceAfter = balanceAfter,
            ReferenceType = "Withdrawal",
            ReferenceId = withdrawalId,
            Description = $"Refund of reserved funds for rejected Withdrawal #{withdrawalId}: {reason}",
            CreatedByAdminId = adminId,
            CreatedAt = DateTime.UtcNow
        };

        await _db.WalletTransactions.AddAsync(transaction);
        await _db.SaveChangesAsync();

        return transaction;
    }

    public async Task<WalletTransaction> FinalizePaidWithdrawalAsync(
        long userId, decimal amount, long withdrawalId, string? transactionReference, long? adminId = null)
    {
        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null || wallet.ReservedBalance < amount)
        {
            throw new InvalidOperationException($"Cannot finalize withdrawal #{withdrawalId}. Reserved balance ({wallet?.ReservedBalance ?? 0.00m}) is less than withdrawal amount ({amount}).");
        }

        var balanceBefore = wallet.AvailableBalance;
        wallet.ReservedBalance -= amount;
        wallet.TotalWithdrawn += amount;
        wallet.UpdatedAt = DateTime.UtcNow;
        var balanceAfter = wallet.AvailableBalance;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            UserId = userId,
            TransactionType = "WithdrawalPaid",
            Amount = amount,
            BalanceBefore = balanceBefore,
            BalanceAfter = balanceAfter,
            ReferenceType = "Withdrawal",
            ReferenceId = withdrawalId,
            Description = $"Payout finalized for Withdrawal #{withdrawalId} (Ref: {transactionReference ?? "N/A"})",
            CreatedByAdminId = adminId,
            CreatedAt = DateTime.UtcNow
        };

        await _db.WalletTransactions.AddAsync(transaction);
        await _db.SaveChangesAsync();

        return transaction;
    }

    public async Task<ApiResponse<WalletTransactionDto>> AdminAdjustBalanceAsync(
        long adminId, AdminBalanceAdjustmentRequest request)
    {
        var user = await _db.Users.FindAsync(request.UserId);
        if (user == null)
        {
            return ApiResponse<WalletTransactionDto>.Fail("Target user not found.");
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            WalletTransaction walletTx;
            if (request.AdjustmentType == "Credit")
            {
                walletTx = await CreditAsync(
                    request.UserId,
                    request.Amount,
                    "AdminCredit",
                    "AdminAdjustment",
                    null,
                    $"Administrative credit: {request.Reason}",
                    null,
                    adminId
                );
            }
            else
            {
                walletTx = await DebitAsync(
                    request.UserId,
                    request.Amount,
                    "AdminDebit",
                    "AdminAdjustment",
                    null,
                    $"Administrative debit: {request.Reason}",
                    null,
                    adminId
                );
            }

            var adminAdjustment = new AdminAdjustment
            {
                UserId = request.UserId,
                AdminId = adminId,
                AdjustmentType = request.AdjustmentType,
                Amount = request.Amount,
                Reason = request.Reason,
                BalanceBefore = walletTx.BalanceBefore,
                BalanceAfter = walletTx.BalanceAfter,
                WalletTransactionId = walletTx.Id,
                CreatedAt = DateTime.UtcNow
            };

            await _db.AdminAdjustments.AddAsync(adminAdjustment);

            // Audit Log
            await _db.AuditLogs.AddAsync(new AuditLog
            {
                ActorAdminId = adminId,
                Action = "WalletAdjustment",
                EntityType = "Wallet",
                EntityId = request.UserId.ToString(),
                Reason = $"Admin adjusted user balance ({request.AdjustmentType} {request.Amount} PKR): {request.Reason}",
                BeforeDataJson = $"{{\"balanceBefore\": {walletTx.BalanceBefore}}}",
                AfterDataJson = $"{{\"balanceAfter\": {walletTx.BalanceAfter}, \"type\": \"{request.AdjustmentType}\"}}",
                CreatedAt = DateTime.UtcNow
            });

            // Notify User
            await _db.Notifications.AddAsync(new Notification
            {
                UserId = request.UserId,
                Type = "SecurityAlert",
                Title = $"Account Balance Adjustment ({request.AdjustmentType})",
                Message = $"An administrator adjusted your wallet balance by {request.Amount:N2} PKR. Reason: {request.Reason}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return ApiResponse<WalletTransactionDto>.Ok(new WalletTransactionDto
            {
                Id = walletTx.Id,
                TransactionType = walletTx.TransactionType,
                Amount = walletTx.Amount,
                BalanceBefore = walletTx.BalanceBefore,
                BalanceAfter = walletTx.BalanceAfter,
                Description = walletTx.Description,
                CreatedAt = walletTx.CreatedAt
            }, "Wallet balance adjusted successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to perform admin balance adjustment: {Message}", ex.Message);
            return ApiResponse<WalletTransactionDto>.Fail($"Adjustment failed: {ex.Message}");
        }
    }
}
