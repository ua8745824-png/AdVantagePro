using Microsoft.Extensions.Options;
using Novyra.Backend.Configuration;

namespace Novyra.Backend.Services;

public class FileUploadService : IFileUploadService
{
    private readonly FileStorageSettings _settings;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<FileUploadService> _logger;

    public FileUploadService(
        IOptions<FileStorageSettings> options,
        IWebHostEnvironment env,
        ILogger<FileUploadService> logger)
    {
        _settings = options.Value;
        _env = env;
        _logger = logger;
    }

    public async Task<(bool Success, string? FilePath, string? ErrorMessage)> SaveUploadAsync(
        IFormFile file, string subDirectory)
    {
        if (file == null || file.Length == 0)
        {
            return (false, null, "No file provided or file is empty.");
        }

        // 1. Validate File Size
        if (file.Length > _settings.MaxFileSizeBytes)
        {
            return (false, null, $"File size exceeds the allowed limit of {_settings.MaxFileSizeBytes / (1024 * 1024)} MB.");
        }

        // 2. Validate File Extension
        var rawExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_settings.AllowedExtensions.Contains(rawExtension))
        {
            return (false, null, $"File format '{rawExtension}' is not permitted.");
        }

        // 3. Validate MIME Type
        var mime = file.ContentType.ToLowerInvariant();
        if (!_settings.AllowedMimeTypes.Contains(mime))
        {
            return (false, null, $"MIME type '{mime}' is not supported.");
        }

        try
        {
            // 4. Sanitize subDirectory and generate safe GUID filename
            var sanitizedSubDir = subDirectory.Replace("..", "").Replace("/", Path.DirectorySeparatorChar.ToString()).TrimStart(Path.DirectorySeparatorChar);
            var uploadsRoot = Path.Combine(_env.ContentRootPath, _settings.UploadDirectory, sanitizedSubDir);

            if (!Directory.Exists(uploadsRoot))
            {
                Directory.CreateDirectory(uploadsRoot);
            }

            var uniqueFileName = $"{Guid.NewGuid():N}{rawExtension}";
            var physicalPath = Path.Combine(uploadsRoot, uniqueFileName);

            await using (var stream = new FileStream(physicalPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Relative storage path stored in DB
            var relativePath = $"/{_settings.UploadDirectory}/{sanitizedSubDir.Replace(Path.DirectorySeparatorChar, '/')}/{uniqueFileName}";
            return (true, relativePath, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while saving file upload: {Message}", ex.Message);
            return (false, null, "Internal server error occurred while saving the file.");
        }
    }

    public async Task<byte[]?> GetFileBytesAsync(string relativePath)
    {
        try
        {
            var cleaned = relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var physicalPath = Path.Combine(_env.ContentRootPath, cleaned);

            if (!File.Exists(physicalPath))
            {
                return null;
            }

            return await File.ReadAllBytesAsync(physicalPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read file {Path}: {Message}", relativePath, ex.Message);
            return null;
        }
    }

    public bool DeleteFile(string relativePath)
    {
        try
        {
            var cleaned = relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var physicalPath = Path.Combine(_env.ContentRootPath, cleaned);

            if (File.Exists(physicalPath))
            {
                File.Delete(physicalPath);
                return true;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete file {Path}: {Message}", relativePath, ex.Message);
        }
        return false;
    }
}
