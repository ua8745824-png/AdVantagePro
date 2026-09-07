using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;

namespace Novyra.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentMethodsController : ControllerBase
{
    private readonly NovyraDbContext _db;

    public PaymentMethodsController(NovyraDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetActivePaymentMethods()
    {
        var methods = await _db.PaymentMethods
            .Where(pm => pm.IsEnabled)
            .OrderBy(pm => pm.DisplayOrder)
            .Select(pm => new PaymentMethodDto
            {
                Id = pm.Id,
                Name = pm.Name,
                Type = pm.Type,
                QrCodePath = pm.QrCodePath,
                AccountTitle = pm.AccountTitle,
                AccountNumber = pm.Type == "MobileWallet" ? null : pm.AccountNumber, // Mask raw account numbers for QR-first mobile wallets
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
}
