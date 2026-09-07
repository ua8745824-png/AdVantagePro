using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Novyra.Backend.DTOs;
using Novyra.Backend.Services;

namespace Novyra.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WithdrawalsController : ControllerBase
{
    private readonly IWithdrawalService _withdrawalService;

    public WithdrawalsController(IWithdrawalService withdrawalService)
    {
        _withdrawalService = withdrawalService;
    }

    [HttpGet("fee-preview")]
    public async Task<IActionResult> GetFeePreview(
        [FromQuery] int paymentMethodId,
        [FromQuery] decimal amount)
    {
        var userId = GetCurrentUserId();
        var response = await _withdrawalService.CalculateFeePreviewAsync(userId, paymentMethodId, amount);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> RequestWithdrawal([FromBody] WithdrawalRequestDto request)
    {
        var userId = GetCurrentUserId();
        var response = await _withdrawalService.RequestWithdrawalAsync(userId, request);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetUserWithdrawals(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15,
        [FromQuery] string? status = null)
    {
        var userId = GetCurrentUserId();
        var response = await _withdrawalService.GetUserWithdrawalsAsync(userId, page, pageSize, status);
        return Ok(response);
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return long.TryParse(userIdClaim, out var id) ? id : 0;
    }
}
