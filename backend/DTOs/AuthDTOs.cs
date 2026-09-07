using System.ComponentModel.DataAnnotations;

namespace Novyra.Backend.DTOs;

public class RegisterRequest
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required, StringLength(50, MinimumLength = 3)]
    [RegularExpression(@"^[a-zA-Z0-9_.]+$", ErrorMessage = "Username can only contain alphanumeric characters, underscores, and periods.")]
    public string Username { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(30)]
    [RegularExpression(@"^(\+92|0|0092)?3[0-9]{9}$", ErrorMessage = "Please enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567).")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    public string? ReferralCode { get; set; }
}

public class LoginRequest
{
    [Required]
    public string UsernameOrEmail { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class GoogleLoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? FullName { get; set; }

    public string? GoogleId { get; set; }

    public string? AvatarUrl { get; set; }

    public string? IdToken { get; set; }

    public string? ReferralCode { get; set; }
}

public class TelegramLoginRequest
{
    [Required]
    public string TelegramId { get; set; } = string.Empty;

    public string? Username { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? PhotoUrl { get; set; }

    public long? AuthDate { get; set; }

    public string? Hash { get; set; }

    public string? ReferralCode { get; set; }
}

public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class RevokeTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 8)]
    public string NewPassword { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required, StringLength(30)]
    [RegularExpression(@"^(\+92|0|0092)?3[0-9]{9}$", ErrorMessage = "Please enter a valid Pakistani mobile number.")]
    public string PhoneNumber { get; set; } = string.Empty;
}

public class UserDto
{
    public long Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string ReferralCode { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public bool IsActive { get; set; }
    public bool IsSuspended { get; set; }
    public string? SuspensionReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiresAt { get; set; }
    public UserDto User { get; set; } = null!;
}
