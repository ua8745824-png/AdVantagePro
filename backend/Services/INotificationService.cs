using Novyra.Backend.DTOs;

namespace Novyra.Backend.Services;

public interface INotificationService
{
    Task<ApiResponse<PagedResult<NotificationDto>>> GetUserNotificationsAsync(long userId, int page, int pageSize, bool unreadOnly);
    Task<ApiResponse<int>> GetUnreadCountAsync(long userId);
    Task<ApiResponse> MarkAsReadAsync(long userId, long notificationId);
    Task<ApiResponse> MarkAllAsReadAsync(long userId);
    Task CreateNotificationAsync(long userId, string type, string title, string message, string? refType = null, long? refId = null);
    Task SendSystemBroadcastAsync(string title, string message);
}
