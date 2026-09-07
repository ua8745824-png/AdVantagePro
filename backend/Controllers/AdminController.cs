using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;
using Novyra.Backend.Entities;
using Novyra.Backend.Services;

namespace Novyra.Backend.Controllers;

[Authorize(Roles = "SuperAdmin,Admin,FinanceAdmin,SupportAgent")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly IWalletService _walletService;
    private readonly ITaskService _taskService;
    private readonly IDepositService _depositService;
    private readonly IWithdrawalService _withdrawalService;
    private readonly ISupportService _supportService;
    private readonly IAntiFraudService _antiFraudService;
    private readonly IFileUploadService _fileUploadService;
    private readonly NovyraDbContext _db;

    public AdminController(
        IAdminService adminService,
        IWalletService walletService,
        ITaskService taskService,
        IDepositService depositService,
        IWithdrawalService withdrawalService,
        ISupportService supportService,
        IAntiFraudService antiFraudService,
        IFileUploadService fileUploadService,
        NovyraDbContext db)
    {
        _adminService = adminService;
        _walletService = walletService;
        _taskService = taskService;
        _depositService = depositService;
        _withdrawalService = withdrawalService;
        _supportService = supportService;
        _antiFraudService = antiFraudService;
        _fileUploadService = fileUploadService;
        _db = db;
    }

    // 1. Dashboard KPIs
    [HttpGet("dashboard/kpis")]
    public async Task<IActionResult> GetDashboardKpis()
    {
        var response = await _adminService.GetDashboardKpisAsync();
        return Ok(response);
    }

    // 2. User Management
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] string? role = null)
    {
        var response = await _adminService.GetUsersAsync(page, pageSize, search, status, role);
        return Ok(response);
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUserDetails(long id)
    {
        var response = await _adminService.GetUserDetailsAsync(id);
        if (!response.Success)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpPost("users/{id}/suspend")]
    public async Task<IActionResult> SuspendUser(long id, [FromBody] string reason)
    {
        var adminId = GetCurrentAdminId();
        var response = await _adminService.SuspendUserAsync(id, adminId, reason);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("users/{id}/activate")]
    public async Task<IActionResult> ActivateUser(long id)
    {
        var adminId = GetCurrentAdminId();
        var response = await _adminService.ActivateUserAsync(id, adminId);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    // 3. Wallet Balance Adjustments
    [HttpPost("wallet/adjust")]
    public async Task<IActionResult> AdjustBalance([FromBody] AdminBalanceAdjustmentRequest request)
    {
        var adminId = GetCurrentAdminId();
        var response = await _walletService.AdminAdjustBalanceAsync(adminId, request);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    // 4. Campaigns Management
    [HttpGet("campaigns")]
    public async Task<IActionResult> GetCampaigns(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15,
        [FromQuery] string? status = null)
    {
        var response = await _taskService.GetCampaignsAdminAsync(page, pageSize, status);
        return Ok(response);
    }

    [HttpPost("campaigns")]
    public async Task<IActionResult> CreateCampaign([FromBody] CreateCampaignRequest request)
    {
        var response = await _taskService.CreateCampaignAsync(request);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPut("campaigns/{id}")]
    public async Task<IActionResult> UpdateCampaign(long id, [FromBody] CreateCampaignRequest request)
    {
        var response = await _taskService.UpdateCampaignAsync(id, request);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    // 5. Tasks Management
    [HttpGet("tasks")]
    public async Task<IActionResult> GetTasks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15,
        [FromQuery] long? campaignId = null)
    {
        var response = await _taskService.GetTasksAdminAsync(page, pageSize, campaignId);
        return Ok(response);
    }

    [HttpPost("tasks")]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        var response = await _taskService.CreateTaskAsync(request);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPut("tasks/{id}")]
    public async Task<IActionResult> UpdateTask(long id, [FromBody] CreateTaskRequest request)
    {
        var response = await _taskService.UpdateTaskAsync(id, request);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    // 6. Deposits Review
    [HttpGet("deposits")]
    public async Task<IActionResult> GetDeposits(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        var response = await _depositService.GetAdminDepositsAsync(page, pageSize, status, search);
        return Ok(response);
    }

    [HttpPost("deposits/{id}/approve")]
    public async Task<IActionResult> ApproveDeposit(long id, [FromBody] DepositReviewRequest? request)
    {
        var adminId = GetCurrentAdminId();
        var response = await _depositService.ApproveDepositAsync(id, adminId, request?.AdminNote);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("deposits/{id}/reject")]
    public async Task<IActionResult> RejectDeposit(long id, [FromBody] DepositReviewRequest request)
    {
        var adminId = GetCurrentAdminId();
        var response = await _depositService.RejectDepositAsync(id, adminId, request.RejectionReason);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    // 7. Withdrawals Review
    [HttpGet("withdrawals")]
    public async Task<IActionResult> GetWithdrawals(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        var response = await _withdrawalService.GetAdminWithdrawalsAsync(page, pageSize, status, search);
        return Ok(response);
    }

    [HttpPost("withdrawals/{id}/approve")]
    public async Task<IActionResult> ApproveWithdrawal(long id, [FromBody] WithdrawalReviewRequest? request)
    {
        var adminId = GetCurrentAdminId();
        var response = await _withdrawalService.ApproveWithdrawalAsync(id, adminId, request?.AdminNote);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("withdrawals/{id}/process")]
    public async Task<IActionResult> MarkWithdrawalProcessing(long id)
    {
        var adminId = GetCurrentAdminId();
        var response = await _withdrawalService.MarkProcessingAsync(id, adminId);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("withdrawals/{id}/pay")]
    public async Task<IActionResult> MarkWithdrawalPaid(long id, [FromBody] WithdrawalReviewRequest request)
    {
        var adminId = GetCurrentAdminId();
        var response = await _withdrawalService.MarkPaidAsync(id, adminId, request.TransactionReference ?? "TRX-MANUAL");
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("withdrawals/{id}/reject")]
    public async Task<IActionResult> RejectWithdrawal(long id, [FromBody] WithdrawalReviewRequest request)
    {
        var adminId = GetCurrentAdminId();
        var response = await _withdrawalService.RejectWithdrawalAsync(id, adminId, request.RejectionReason ?? "Payout details verification failed.");
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    // 8. Payment Methods & QR Management
    [HttpGet("payment-methods")]
    public async Task<IActionResult> GetAllPaymentMethods()
    {
        var methods = await _db.PaymentMethods
            .OrderBy(pm => pm.DisplayOrder)
            .Select(pm => new PaymentMethodDto
            {
                Id = pm.Id,
                Name = pm.Name,
                Type = pm.Type,
                QrCodePath = pm.QrCodePath,
                AccountTitle = pm.AccountTitle,
                AccountNumber = pm.AccountNumber,
                BankName = pm.BankName,
                Iban = pm.Iban,
                Instructions = pm.Instructions,
                MinDeposit = pm.MinDeposit,
                MaxDeposit = pm.MaxDeposit,
                MinWithdrawal = pm.MinWithdrawal,
                MaxWithdrawal = pm.MaxWithdrawal,
                IsEnabled = pm.IsEnabled,
                DisplayOrder = pm.DisplayOrder
            })
            .ToListAsync();

        return Ok(ApiResponse<List<PaymentMethodDto>>.Ok(methods));
    }

    [HttpPut("payment-methods/{id}")]
    public async Task<IActionResult> UpdatePaymentMethod(int id, [FromBody] PaymentMethodDto dto)
    {
        var method = await _db.PaymentMethods.FindAsync(id);
        if (method == null)
        {
            return NotFound(ApiResponse.Fail("Payment method not found."));
        }

        method.Name = dto.Name;
        method.Type = dto.Type;
        method.QrCodePath = dto.QrCodePath;
        method.AccountTitle = dto.AccountTitle;
        method.AccountNumber = dto.AccountNumber;
        method.BankName = dto.BankName;
        method.Iban = dto.Iban;
        method.Instructions = dto.Instructions;
        method.MinDeposit = dto.MinDeposit;
        method.MaxDeposit = dto.MaxDeposit;
        method.MinWithdrawal = dto.MinWithdrawal;
        method.MaxWithdrawal = dto.MaxWithdrawal;
        method.IsEnabled = dto.IsEnabled;
        method.DisplayOrder = dto.DisplayOrder;
        method.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Payment method updated successfully."));
    }

    [HttpPost("payment-methods")]
    public async Task<IActionResult> CreatePaymentMethod([FromBody] PaymentMethodDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Type))
        {
            return BadRequest(ApiResponse.Fail("Payment method name and type are required."));
        }

        var method = new PaymentMethod
        {
            Name = dto.Name,
            Type = dto.Type,
            QrCodePath = dto.QrCodePath,
            AccountTitle = dto.AccountTitle,
            AccountNumber = dto.AccountNumber,
            BankName = dto.BankName,
            Iban = dto.Iban,
            Instructions = dto.Instructions,
            MinDeposit = dto.MinDeposit > 0 ? dto.MinDeposit : 100.00m,
            MaxDeposit = dto.MaxDeposit > 0 ? dto.MaxDeposit : 500000.00m,
            MinWithdrawal = dto.MinWithdrawal > 0 ? dto.MinWithdrawal : 500.00m,
            MaxWithdrawal = dto.MaxWithdrawal > 0 ? dto.MaxWithdrawal : 100000.00m,
            IsEnabled = dto.IsEnabled,
            DisplayOrder = dto.DisplayOrder,
            CreatedAt = DateTime.UtcNow
        };

        await _db.PaymentMethods.AddAsync(method);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<PaymentMethodDto>.Ok(new PaymentMethodDto
        {
            Id = method.Id,
            Name = method.Name,
            Type = method.Type,
            QrCodePath = method.QrCodePath,
            AccountTitle = method.AccountTitle,
            AccountNumber = method.AccountNumber,
            BankName = method.BankName,
            Iban = method.Iban,
            Instructions = method.Instructions,
            MinDeposit = method.MinDeposit,
            MaxDeposit = method.MaxDeposit,
            MinWithdrawal = method.MinWithdrawal,
            MaxWithdrawal = method.MaxWithdrawal,
            IsEnabled = method.IsEnabled,
            DisplayOrder = method.DisplayOrder
        }, "Payment method created successfully."));
    }

    [HttpDelete("payment-methods/{id}")]
    public async Task<IActionResult> DeletePaymentMethod(int id)
    {
        var method = await _db.PaymentMethods.FindAsync(id);
        if (method == null)
        {
            return NotFound(ApiResponse.Fail("Payment method not found."));
        }

        // Check if referenced by deposits or withdrawals
        var hasDeposits = await _db.Deposits.AnyAsync(d => d.PaymentMethodId == id);
        var hasWithdrawals = await _db.Withdrawals.AnyAsync(w => w.PaymentMethodId == id);

        if (hasDeposits || hasWithdrawals)
        {
            // Soft-disable if referenced
            method.IsEnabled = false;
            method.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return Ok(ApiResponse.Ok("Payment method has existing transaction history and was deactivated instead of permanently deleted."));
        }

        _db.PaymentMethods.Remove(method);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Payment method deleted successfully."));
    }

    [HttpPost("payment-methods/upload-qr")]
    public async Task<IActionResult> UploadQrCode([FromForm] IFormFile file)
    {
        var result = await _fileUploadService.SaveUploadAsync(file, "qr");
        if (!result.Success)
        {
            return BadRequest(ApiResponse.Fail(result.ErrorMessage ?? "QR upload failed."));
        }
        return Ok(ApiResponse<object>.Ok(new { qrPath = result.FilePath }, "QR code uploaded successfully."));
    }

    // 9. Support Management
    [HttpGet("support/tickets")]
    public async Task<IActionResult> GetAdminTickets(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15,
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] string? category = null)
    {
        var response = await _supportService.GetAdminTicketsAsync(page, pageSize, status, priority, category);
        return Ok(response);
    }

    [HttpPut("support/tickets/{id}/status")]
    public async Task<IActionResult> UpdateTicketStatus(long id, [FromQuery] string status, [FromQuery] string? priority = null)
    {
        var adminId = GetCurrentAdminId();
        var response = await _supportService.UpdateTicketStatusAsync(id, adminId, status, priority);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    // 10. Fraud Flags Management
    [HttpGet("fraud/flags")]
    public async Task<IActionResult> GetFraudFlags(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15,
        [FromQuery] string? status = null,
        [FromQuery] string? riskLevel = null)
    {
        var response = await _antiFraudService.GetFraudFlagsAsync(page, pageSize, status, riskLevel);
        return Ok(response);
    }

    [HttpPost("fraud/flags/{id}/review")]
    public async Task<IActionResult> ReviewFraudFlag(long id, [FromQuery] string status, [FromBody] string? adminNote = null)
    {
        var adminId = GetCurrentAdminId();
        var response = await _antiFraudService.ReviewFraudFlagAsync(id, adminId, status, adminNote);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    // 11. Audit Logs Query
    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? action = null,
        [FromQuery] string? entityType = null)
    {
        var response = await _adminService.GetAuditLogsAsync(page, pageSize, action, entityType);
        return Ok(response);
    }

    // 12. System Settings Management
    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        var response = await _adminService.GetSystemSettingsAsync();
        return Ok(response);
    }

    [HttpPut("settings/{key}")]
    public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSystemSettingRequest request)
    {
        var adminId = GetCurrentAdminId();
        var response = await _adminService.UpdateSystemSettingAsync(key, request.Value, adminId);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    private long GetCurrentAdminId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return long.TryParse(userIdClaim, out var id) ? id : 0;
    }
}
