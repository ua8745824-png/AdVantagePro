namespace Novyra.Backend.Services;

public interface IFileUploadService
{
    Task<(bool Success, string? FilePath, string? ErrorMessage)> SaveUploadAsync(IFormFile file, string subDirectory);
    Task<byte[]?> GetFileBytesAsync(string relativePath);
    bool DeleteFile(string relativePath);
}
