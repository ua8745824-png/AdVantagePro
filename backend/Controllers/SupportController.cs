using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Novyra.Backend.DTOs;
using Novyra.Backend.Services;

namespace Novyra.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SupportController : ControllerBase
{
    private readonly ISupportService _supportService;
    private readonly IFileUploadService _fileUploadService;

    public SupportController(ISupportService supportService, IFileUploadService fileUploadService)
    {
        _supportService = supportService;
        _fileUploadService = fileUploadService;
    }

    [HttpPost("tickets")]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketRequest request)
    {
        var userId = GetCurrentUserId();
        var response = await _supportService.CreateTicketAsync(userId, request);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpGet("tickets")]
    public async Task<IActionResult> GetTickets(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15,
        [FromQuery] string? status = null)
    {
        var userId = GetCurrentUserId();
        var response = await _supportService.GetUserTicketsAsync(userId, page, pageSize, status);
        return Ok(response);
    }

    [HttpGet("tickets/{id}")]
    public async Task<IActionResult> GetTicketDetails(long id)
    {
        var userId = GetCurrentUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin") || User.IsInRole("SupportAgent");
        var response = await _supportService.GetTicketDetailsAsync(id, userId, isAdmin);
        if (!response.Success)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpPost("tickets/{id}/reply")]
    public async Task<IActionResult> ReplyTicket(long id, [FromBody] TicketReplyRequest request)
    {
        var userId = GetCurrentUserId();
        var role = User.IsInRole("Admin") || User.IsInRole("SuperAdmin") ? "Admin" :
                   User.IsInRole("SupportAgent") ? "SupportAgent" : "User";

        var response = await _supportService.ReplyTicketAsync(id, userId, role, request);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("upload-attachment")]
    public async Task<IActionResult> UploadAttachment([FromForm] IFormFile file)
    {
        var result = await _fileUploadService.SaveUploadAsync(file, "support");
        if (!result.Success)
        {
            return BadRequest(ApiResponse<object>.Fail(result.ErrorMessage ?? "File upload failed."));
        }
        return Ok(ApiResponse<object>.Ok(new { filePath = result.FilePath }, "Attachment uploaded successfully."));
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return long.TryParse(userIdClaim, out var id) ? id : 0;
    }
}
