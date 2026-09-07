using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;

namespace Novyra.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly NovyraDbContext _dbContext;

    public HealthController(IWebHostEnvironment environment, NovyraDbContext dbContext)
    {
        _environment = environment;
        _dbContext = dbContext;
    }

    [HttpGet]
    public IActionResult Check()
    {
        return Ok(ApiResponse<object>.Ok(new
        {
            service = "NOVYRA Backend API",
            status = "Healthy",
            tagline = "Watch. Complete. Earn.",
            version = "1.0.0",
            environment = _environment.EnvironmentName,
            timestamp = DateTime.UtcNow
        }, "NOVYRA API is running normally."));
    }

    [HttpGet("db-status")]
    public async Task<IActionResult> GetDbStatus()
    {
        var canConnect = await _dbContext.Database.CanConnectAsync();
        var rolesCount = await _dbContext.Roles.CountAsync();
        var usersCount = await _dbContext.Users.CountAsync();
        var walletsCount = await _dbContext.Wallets.CountAsync();
        var settingsCount = await _dbContext.SystemSettings.CountAsync();
        var paymentMethodsCount = await _dbContext.PaymentMethods.CountAsync();
        var campaignsCount = await _dbContext.Campaigns.CountAsync();
        var tasksCount = await _dbContext.Tasks.CountAsync();

        var entityTypes = _dbContext.Model.GetEntityTypes()
            .Select(t => t.GetTableName())
            .Where(t => t != null)
            .Distinct()
            .OrderBy(t => t)
            .ToList();

        return Ok(ApiResponse<object>.Ok(new
        {
            connected = canConnect,
            tableCount = entityTypes.Count,
            tables = entityTypes,
            seededData = new
            {
                roles = rolesCount,
                users = usersCount,
                wallets = walletsCount,
                settings = settingsCount,
                paymentMethods = paymentMethodsCount,
                campaigns = campaignsCount,
                tasks = tasksCount
            }
        }, "Database status verified successfully."));
    }
}
