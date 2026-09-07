using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Novyra.Backend.Services;

namespace Novyra.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReferralsController : ControllerBase
{
    private readonly IReferralService _referralService;

    public ReferralsController(IReferralService referralService)
    {
        _referralService = referralService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var userId = GetCurrentUserId();
        var response = await _referralService.GetReferralSummaryAsync(userId);
        return Ok(response);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetReferredUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        var userId = GetCurrentUserId();
        var response = await _referralService.GetReferredUsersAsync(userId, page, pageSize);
        return Ok(response);
    }

    [HttpGet("commissions")]
    public async Task<IActionResult> GetCommissions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        var userId = GetCurrentUserId();
        var response = await _referralService.GetCommissionHistoryAsync(userId, page, pageSize);
        return Ok(response);
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return long.TryParse(userIdClaim, out var id) ? id : 0;
    }
}
