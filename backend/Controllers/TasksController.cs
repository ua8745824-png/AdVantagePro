using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Novyra.Backend.DTOs;
using Novyra.Backend.Services;

namespace Novyra.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<IActionResult> GetActiveTasks([FromQuery] string? category = null)
    {
        var userId = GetCurrentUserId();
        var response = await _taskService.GetActiveTasksForUserAsync(userId, category);
        return Ok(response);
    }

    [HttpPost("{id}/start-session")]
    public async Task<IActionResult> StartSession(long id)
    {
        var userId = GetCurrentUserId();
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var response = await _taskService.StartTaskSessionAsync(userId, id, ip, userAgent);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("complete-session")]
    public async Task<IActionResult> CompleteSession([FromBody] CompleteTaskSessionRequest request)
    {
        var userId = GetCurrentUserId();
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        var response = await _taskService.CompleteTaskSessionAsync(userId, request.SessionNonce, ip);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return long.TryParse(userIdClaim, out var id) ? id : 0;
    }
}
