namespace Novyra.Backend.Configuration;

public class FileStorageSettings
{
    public string UploadDirectory { get; set; } = "uploads";
    public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024; // 5 MB
    public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    public string[] AllowedMimeTypes { get; set; } = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
}
