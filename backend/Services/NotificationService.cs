using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public class NotificationService : INotificationService
{
    private readonly NovyraDbContext _db;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(NovyraDbContext db, ILogger<NotificationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<ApiResponse<PagedResult<NotificationDto>>> GetUserNotificationsAsync(
        long userId, int page, int pageSize, bool unreadOnly)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 20 : pageSize;

        var query = _db.Notifications.Where(n => n.UserId == userId);

        if (unreadOnly)
        {
            query = query.Where(n => !n.IsRead);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type,
                Title = n.Title,
                Message = n.Message,
                IsRead = n.IsRead,
                ReferenceType = n.ReferenceType,
                ReferenceId = n.ReferenceId,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<NotificationDto>>.Ok(new PagedResult<NotificationDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<int>> GetUnreadCountAsync(long userId)
    {
        var count = await _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
        return ApiResponse<int>.Ok(count);
    }

    public async Task<ApiResponse> MarkAsReadAsync(long userId, long notificationId)
    {
        var notification = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
        if (notification != null && !notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
        return ApiResponse.Ok("Notification marked as read.");
    }

    public async Task<ApiResponse> MarkAllAsReadAsync(long userId)
    {
        var unread = await _db.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
        var now = DateTime.UtcNow;
        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAt = now;
        }
        await _db.SaveChangesAsync();
        return ApiResponse.Ok("All notifications marked as read.");
    }

    public async Task CreateNotificationAsync(
        long userId, string type, string title, string message, string? refType = null, long? refId = null)
    {
        try
        {
            var notification = new Notification
            {
                UserId = userId,
                Type = type,
                Title = title,
                Message = message,
                ReferenceType = refType,
                ReferenceId = refId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            await _db.Notifications.AddAsync(notification);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to persist notification for user {UserId}: {Message}", userId, ex.Message);
        }
    }

    public async Task SendSystemBroadcastAsync(string title, string message)
    {
        try
        {
            var userIds = await _db.Users.Where(u => u.IsActive && !u.IsSuspended).Select(u => u.Id).ToListAsync();
            var notifications = userIds.Select(uid => new Notification
            {
                UserId = uid,
                Type = "SystemAnnouncement",
                Title = title,
                Message = message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            await _db.Notifications.AddRangeAsync(notifications);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send system broadcast: {Message}", ex.Message);
        }
    }
}
