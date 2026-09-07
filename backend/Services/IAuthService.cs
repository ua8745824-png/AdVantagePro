using Novyra.Backend.DTOs;

namespace Novyra.Backend.Services;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request, string? ipAddress);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, string? ipAddress);
    Task<ApiResponse<AuthResponse>> LoginWithGoogleAsync(GoogleLoginRequest request, string? ipAddress);
    Task<ApiResponse<AuthResponse>> LoginWithTelegramAsync(TelegramLoginRequest request, string? ipAddress);
    Task<ApiResponse<AuthResponse>> RefreshTokenAsync(RefreshTokenRequest request, string? ipAddress);
    Task<ApiResponse> RevokeTokenAsync(RevokeTokenRequest request, long currentUserId, bool isAdmin);
    Task<ApiResponse> LogoutAsync(string refreshToken);
    Task<ApiResponse<UserDto>> GetCurrentUserAsync(long userId);
    Task<ApiResponse> ChangePasswordAsync(long userId, ChangePasswordRequest request);
    Task<ApiResponse<UserDto>> UpdateProfileAsync(long userId, UpdateProfileRequest request);
}
