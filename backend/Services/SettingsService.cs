using Microsoft.EntityFrameworkCore;
using Novyra.Backend.Data;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public class SettingsService : ISettingsService
{
    private readonly NovyraDbContext _db;

    public SettingsService(NovyraDbContext db)
    {
        _db = db;
    }

    public async Task<string> GetSettingValueAsync(string key, string defaultValue = "")
    {
        var setting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
        return setting?.Value ?? defaultValue;
    }

    public async Task<int> GetIntSettingAsync(string key, int defaultValue = 0)
    {
        var value = await GetSettingValueAsync(key);
        return int.TryParse(value, out var result) ? result : defaultValue;
    }

    public async Task<decimal> GetDecimalSettingAsync(string key, decimal defaultValue = 0.00m)
    {
        var value = await GetSettingValueAsync(key);
        return decimal.TryParse(value, out var result) ? result : defaultValue;
    }

    public async Task<bool> GetBoolSettingAsync(string key, bool defaultValue = false)
    {
        var value = await GetSettingValueAsync(key);
        return bool.TryParse(value, out var result) ? result : defaultValue;
    }

    public async Task UpdateSettingAsync(string key, string value, long? adminId = null)
    {
        var setting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
        if (setting == null)
        {
            setting = new SystemSetting
            {
                Key = key,
                Value = value,
                UpdatedAt = DateTime.UtcNow,
                UpdatedByAdminId = adminId
            };
            await _db.SystemSettings.AddAsync(setting);
        }
        else
        {
            setting.Value = value;
            setting.UpdatedAt = DateTime.UtcNow;
            setting.UpdatedByAdminId = adminId;
        }

        await _db.SaveChangesAsync();
    }
}
