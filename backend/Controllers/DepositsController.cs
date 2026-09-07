using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Novyra.Backend.DTOs;
using Novyra.Backend.Services;

namespace Novyra.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DepositsController : ControllerBase
{
    private readonly IDepositService _depositService;
    private readonly IFileUploadService _fileUploadService;

    public DepositsController(IDepositService depositService, IFileUploadService fileUploadService)
    {
        _depositService = depositService;
        _fileUploadService = fileUploadService;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitDeposit([FromBody] DepositRequestDto request)
    {
        var userId = GetCurrentUserId();
        var response = await _depositService.SubmitDepositAsync(userId, request);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("upload-proof")]
    public async Task<IActionResult> UploadProof([FromForm] IFormFile file)
    {
        var result = await _fileUploadService.SaveUploadAsync(file, "deposits");
        if (!result.Success)
        {
            return BadRequest(ApiResponse<object>.Fail(result.ErrorMessage ?? "File upload failed."));
        }
        return Ok(ApiResponse<object>.Ok(new { filePath = result.FilePath }, "Payment proof uploaded successfully."));
    }

    [HttpGet]
    public async Task<IActionResult> GetUserDeposits(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15,
        [FromQuery] string? status = null)
    {
        var userId = GetCurrentUserId();
        var response = await _depositService.GetUserDepositsAsync(userId, page, pageSize, status);
        return Ok(response);
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return long.TryParse(userIdClaim, out var id) ? id : 0;
    }
}
