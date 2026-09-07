using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public class SupportService : ISupportService
{
    private readonly NovyraDbContext _db;
    private readonly ILogger<SupportService> _logger;

    public SupportService(NovyraDbContext db, ILogger<SupportService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<ApiResponse<SupportTicketDto>> CreateTicketAsync(long userId, CreateTicketRequest request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            return ApiResponse<SupportTicketDto>.Fail("User not found.");
        }

        string ticketNumber;
        do
        {
            ticketNumber = "NOV-" + RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        } while (await _db.SupportTickets.AnyAsync(t => t.TicketNumber == ticketNumber));

        var ticket = new SupportTicket
        {
            UserId = userId,
            TicketNumber = ticketNumber,
            Subject = request.Subject.Trim(),
            Category = request.Category.Trim(),
            Priority = request.Priority,
            Status = "Open",
            CreatedAt = DateTime.UtcNow
        };

        await _db.SupportTickets.AddAsync(ticket);
        await _db.SaveChangesAsync();

        var initialMessage = new SupportMessage
        {
            TicketId = ticket.Id,
            SenderId = userId,
            SenderRole = "User",
            Message = request.InitialMessage.Trim(),
            AttachmentPath = request.AttachmentPath,
            CreatedAt = DateTime.UtcNow
        };

        await _db.SupportMessages.AddAsync(initialMessage);
        await _db.SaveChangesAsync();

        return ApiResponse<SupportTicketDto>.Ok(new SupportTicketDto
        {
            Id = ticket.Id,
            UserId = userId,
            UserName = user.Username,
            UserEmail = user.Email,
            TicketNumber = ticket.TicketNumber,
            Subject = ticket.Subject,
            Category = ticket.Category,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            Messages = new List<SupportMessageDto>
            {
                new()
                {
                    Id = initialMessage.Id,
                    SenderId = userId,
                    SenderName = user.FullName,
                    SenderRole = "User",
                    Message = initialMessage.Message,
                    AttachmentPath = initialMessage.AttachmentPath,
                    CreatedAt = initialMessage.CreatedAt
                }
            }
        }, "Support ticket submitted successfully.");
    }

    public async Task<ApiResponse<PagedResult<SupportTicketDto>>> GetUserTicketsAsync(
        long userId, int page, int pageSize, string? status)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.SupportTickets.Include(t => t.User).Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(t => t.Status == status);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new SupportTicketDto
            {
                Id = t.Id,
                UserId = t.UserId,
                UserName = t.User.Username,
                UserEmail = t.User.Email,
                TicketNumber = t.TicketNumber,
                Subject = t.Subject,
                Category = t.Category,
                Priority = t.Priority,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                ResolvedAt = t.ResolvedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<SupportTicketDto>>.Ok(new PagedResult<SupportTicketDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<SupportTicketDto>> GetTicketDetailsAsync(long ticketId, long userId, bool isAdmin)
    {
        var ticket = await _db.SupportTickets
            .Include(t => t.User)
            .Include(t => t.Messages)
            .ThenInclude(m => m.Sender)
            .FirstOrDefaultAsync(t => t.Id == ticketId);

        if (ticket == null)
        {
            return ApiResponse<SupportTicketDto>.Fail("Ticket not found.");
        }

        if (ticket.UserId != userId && !isAdmin)
        {
            return ApiResponse<SupportTicketDto>.Fail("Forbidden: Cannot view tickets belonging to other users.");
        }

        return ApiResponse<SupportTicketDto>.Ok(new SupportTicketDto
        {
            Id = ticket.Id,
            UserId = ticket.UserId,
            UserName = ticket.User.Username,
            UserEmail = ticket.User.Email,
            TicketNumber = ticket.TicketNumber,
            Subject = ticket.Subject,
            Category = ticket.Category,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt,
            ResolvedAt = ticket.ResolvedAt,
            Messages = ticket.Messages.OrderBy(m => m.CreatedAt).Select(m => new SupportMessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = m.Sender.FullName,
                SenderRole = m.SenderRole,
                Message = m.Message,
                AttachmentPath = m.AttachmentPath,
                CreatedAt = m.CreatedAt
            }).ToList()
        });
    }

    public async Task<ApiResponse<SupportMessageDto>> ReplyTicketAsync(
        long ticketId, long senderId, string senderRole, TicketReplyRequest request)
    {
        var ticket = await _db.SupportTickets.Include(t => t.User).FirstOrDefaultAsync(t => t.Id == ticketId);
        if (ticket == null)
        {
            return ApiResponse<SupportMessageDto>.Fail("Ticket not found.");
        }

        var sender = await _db.Users.FindAsync(senderId);
        if (sender == null)
        {
            return ApiResponse<SupportMessageDto>.Fail("Sender not found.");
        }

        var message = new SupportMessage
        {
            TicketId = ticketId,
            SenderId = senderId,
            SenderRole = senderRole,
            Message = request.Message.Trim(),
            AttachmentPath = request.AttachmentPath,
            CreatedAt = DateTime.UtcNow
        };

        ticket.UpdatedAt = DateTime.UtcNow;
        if (senderRole == "Admin" || senderRole == "SupportAgent")
        {
            ticket.Status = "AwaitingUser";

            // Notify User
            await _db.Notifications.AddAsync(new Notification
            {
                UserId = ticket.UserId,
                Type = "SupportUpdate",
                Title = $"Support Reply on Ticket {ticket.TicketNumber}",
                Message = $"A support representative replied to your ticket '{ticket.Subject}'.",
                IsRead = false,
                ReferenceType = "SupportTicket",
                ReferenceId = ticket.Id,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            ticket.Status = "AwaitingAdmin";
        }

        await _db.SupportMessages.AddAsync(message);
        await _db.SaveChangesAsync();

        return ApiResponse<SupportMessageDto>.Ok(new SupportMessageDto
        {
            Id = message.Id,
            SenderId = senderId,
            SenderName = sender.FullName,
            SenderRole = senderRole,
            Message = message.Message,
            AttachmentPath = message.AttachmentPath,
            CreatedAt = message.CreatedAt
        }, "Reply posted successfully.");
    }

    public async Task<ApiResponse<PagedResult<SupportTicketDto>>> GetAdminTicketsAsync(
        int page, int pageSize, string? status, string? priority, string? category)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 || pageSize > 100 ? 15 : pageSize;

        var query = _db.SupportTickets.Include(t => t.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(t => t.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(priority) && priority != "All")
        {
            query = query.Where(t => t.Priority == priority);
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            query = query.Where(t => t.Category == category);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new SupportTicketDto
            {
                Id = t.Id,
                UserId = t.UserId,
                UserName = t.User.Username,
                UserEmail = t.User.Email,
                TicketNumber = t.TicketNumber,
                Subject = t.Subject,
                Category = t.Category,
                Priority = t.Priority,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                ResolvedAt = t.ResolvedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<SupportTicketDto>>.Ok(new PagedResult<SupportTicketDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<SupportTicketDto>> UpdateTicketStatusAsync(
        long ticketId, long adminId, string status, string? priority)
    {
        var ticket = await _db.SupportTickets.Include(t => t.User).FirstOrDefaultAsync(t => t.Id == ticketId);
        if (ticket == null)
        {
            return ApiResponse<SupportTicketDto>.Fail("Ticket not found.");
        }

        ticket.Status = status;
        if (!string.IsNullOrWhiteSpace(priority))
        {
            ticket.Priority = priority;
        }

        if (status == "Resolved" || status == "Closed")
        {
            ticket.ResolvedAt = DateTime.UtcNow;
        }

        ticket.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return ApiResponse<SupportTicketDto>.Ok(new SupportTicketDto
        {
            Id = ticket.Id,
            UserId = ticket.UserId,
            UserName = ticket.User.Username,
            UserEmail = ticket.User.Email,
            TicketNumber = ticket.TicketNumber,
            Subject = ticket.Subject,
            Category = ticket.Category,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt,
            ResolvedAt = ticket.ResolvedAt
        }, $"Ticket status updated to '{status}'.");
    }
}
