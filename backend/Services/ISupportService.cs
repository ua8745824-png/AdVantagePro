using Novyra.Backend.DTOs;

namespace Novyra.Backend.Services;

public interface ISupportService
{
    Task<ApiResponse<SupportTicketDto>> CreateTicketAsync(long userId, CreateTicketRequest request);
    Task<ApiResponse<PagedResult<SupportTicketDto>>> GetUserTicketsAsync(long userId, int page, int pageSize, string? status);
    Task<ApiResponse<SupportTicketDto>> GetTicketDetailsAsync(long ticketId, long userId, bool isAdmin);
    Task<ApiResponse<SupportMessageDto>> ReplyTicketAsync(long ticketId, long senderId, string senderRole, TicketReplyRequest request);
    Task<ApiResponse<PagedResult<SupportTicketDto>>> GetAdminTicketsAsync(int page, int pageSize, string? status, string? priority, string? category);
    Task<ApiResponse<SupportTicketDto>> UpdateTicketStatusAsync(long ticketId, long adminId, string status, string? priority);
}
