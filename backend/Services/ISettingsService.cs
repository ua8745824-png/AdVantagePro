namespace Novyra.Backend.Services;

public interface ISettingsService
{
    Task<string> GetSettingValueAsync(string key, string defaultValue = "");
    Task<int> GetIntSettingAsync(string key, int defaultValue = 0);
    Task<decimal> GetDecimalSettingAsync(string key, decimal defaultValue = 0.00m);
    Task<bool> GetBoolSettingAsync(string key, bool defaultValue = false);
    Task UpdateSettingAsync(string key, string value, long? adminId = null);
}
