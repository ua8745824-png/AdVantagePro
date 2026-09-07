using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Novyra.Backend.Configuration;
using Novyra.Backend.Data;
using Novyra.Backend.DTOs;
using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public class AuthService : IAuthService
{
    private readonly NovyraDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        NovyraDbContext db,
        ITokenService tokenService,
        IOptions<JwtSettings> jwtOptions,
        ILogger<AuthService> logger)
    {
        _db = db;
        _tokenService = tokenService;
        _jwtSettings = jwtOptions.Value;
        _logger = logger;
    }

    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request, string? ipAddress)
    {
        var username = request.Username.Trim().ToLowerInvariant();
        var email = request.Email.Trim().ToLowerInvariant();

        // 1. Uniqueness checks
        if (await _db.Users.AnyAsync(u => u.Username.ToLower() == username))
        {
            return ApiResponse<AuthResponse>.Fail("Username is already taken. Please choose another username.");
        }

        if (await _db.Users.AnyAsync(u => u.Email.ToLower() == email))
        {
            return ApiResponse<AuthResponse>.Fail("Email address is already registered.");
        }

        if (await _db.Users.AnyAsync(u => u.PhoneNumber == request.PhoneNumber.Trim()))
        {
            return ApiResponse<AuthResponse>.Fail("Phone number is already associated with an account.");
        }

        // 2. Validate Referral Code if supplied
        User? referrerUser = null;
        if (!string.IsNullOrWhiteSpace(request.ReferralCode))
        {
            var code = request.ReferralCode.Trim().ToUpperInvariant();
            referrerUser = await _db.Users.FirstOrDefaultAsync(u => u.ReferralCode == code && u.IsActive && !u.IsSuspended);
            if (referrerUser == null)
            {
                return ApiResponse<AuthResponse>.Fail("The provided referral code is invalid or inactive.");
            }
        }

        // 3. Generate unique Referral Code for new user
        string newReferralCode;
        do
        {
            newReferralCode = "NOV-" + RandomNumberGenerator.GetString("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
        } while (await _db.Users.AnyAsync(u => u.ReferralCode == newReferralCode));

        // 4. Hash password with BCrypt
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 11);

        // 5. Get standard 'User' role
        var userRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "User");
        if (userRole == null)
        {
            userRole = new Role { Name = "User", Description = "Standard user role" };
            await _db.Roles.AddAsync(userRole);
            await _db.SaveChangesAsync();
        }

        // 6. Execute atomic user creation
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var user = new User
            {
                FullName = request.FullName.Trim(),
                Username = username,
                Email = email,
                PhoneNumber = request.PhoneNumber.Trim(),
                PasswordHash = passwordHash,
                ReferralCode = newReferralCode,
                ReferredByUserId = referrerUser?.Id,
                IsActive = true,
                IsSuspended = false,
                CreatedAt = DateTime.UtcNow
            };

            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();

            // Assign User Role
            await _db.UserRoles.AddAsync(new UserRole
            {
                UserId = user.Id,
                RoleId = userRole.Id,
                AssignedAt = DateTime.UtcNow
            });

            // Initialize Wallet
            var wallet = new Wallet
            {
                UserId = user.Id,
                AvailableBalance = 0.00m,
                ReservedBalance = 0.00m,
                TotalEarned = 0.00m,
                TotalWithdrawn = 0.00m,
                ReferralEarnings = 0.00m,
                CreatedAt = DateTime.UtcNow
            };
            await _db.Wallets.AddAsync(wallet);

            // Record Referral Relationship
            if (referrerUser != null)
            {
                await _db.ReferralRelationships.AddAsync(new ReferralRelationship
                {
                    ReferrerUserId = referrerUser.Id,
                    ReferredUserId = user.Id,
                    ReferralCode = referrerUser.ReferralCode,
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Create initial Welcome Notification
            await _db.Notifications.AddAsync(new Notification
            {
                UserId = user.Id,
                Type = "SystemAnnouncement",
                Title = "Welcome to NOVYRA!",
                Message = "Your account has been created successfully. Explore sponsored tasks, watch verified content, and start earning rewards.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            // Generate Tokens
            var rolesList = new List<string> { userRole.Name };
            var rawRefreshToken = _tokenService.GenerateRefreshToken();
            var tokenHash = _tokenService.HashToken(rawRefreshToken);
            var refreshTokenDays = _jwtSettings.RefreshTokenExpiryDays > 0 ? _jwtSettings.RefreshTokenExpiryDays : 7;
            var refreshExpires = DateTime.UtcNow.AddDays(refreshTokenDays);

            await _db.RefreshTokens.AddAsync(new RefreshToken
            {
                UserId = user.Id,
                TokenHash = tokenHash,
                ExpiresAt = refreshExpires,
                IsRevoked = false,
                CreatedByIp = ipAddress,
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            var accessToken = _tokenService.GenerateAccessToken(user, rolesList);
            var accessExpiryMinutes = _jwtSettings.AccessTokenExpiryMinutes > 0 ? _jwtSettings.AccessTokenExpiryMinutes : 15;

            var userDto = MapToUserDto(user, rolesList);
            return ApiResponse<AuthResponse>.Ok(new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = rawRefreshToken,
                AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(accessExpiryMinutes),
                User = userDto
            }, "Registration successful. Welcome to NOVYRA.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error occurred during user registration: {Message}", ex.Message);
            return ApiResponse<AuthResponse>.Fail("Registration failed due to a server error. Please try again.");
        }
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, string? ipAddress)
    {
        var identifier = request.UsernameOrEmail.Trim().ToLowerInvariant();

        var user = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == identifier || u.Email.ToLower() == identifier);

        if (user == null)
        {
            return ApiResponse<AuthResponse>.Fail("Invalid username/email or password.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return ApiResponse<AuthResponse>.Fail("Invalid username/email or password.");
        }

        if (user.IsSuspended)
        {
            return ApiResponse<AuthResponse>.Fail($"Account is suspended. Reason: {user.SuspensionReason ?? "Violation of platform terms."}");
        }

        if (!user.IsActive)
        {
            return ApiResponse<AuthResponse>.Fail("Account is inactive. Please contact support.");
        }

        // Update Last Login
        user.LastLoginAt = DateTime.UtcNow;

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var accessToken = _tokenService.GenerateAccessToken(user, roles);

        var rawRefreshToken = _tokenService.GenerateRefreshToken();
        var tokenHash = _tokenService.HashToken(rawRefreshToken);
        var refreshTokenDays = _jwtSettings.RefreshTokenExpiryDays > 0 ? _jwtSettings.RefreshTokenExpiryDays : 7;

        await _db.RefreshTokens.AddAsync(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenDays),
            IsRevoked = false,
            CreatedByIp = ipAddress,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        var accessExpiryMinutes = _jwtSettings.AccessTokenExpiryMinutes > 0 ? _jwtSettings.AccessTokenExpiryMinutes : 15;
        var userDto = MapToUserDto(user, roles);

        return ApiResponse<AuthResponse>.Ok(new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = rawRefreshToken,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(accessExpiryMinutes),
            User = userDto
        }, "Login successful.");
    }

    public async Task<ApiResponse<AuthResponse>> LoginWithGoogleAsync(GoogleLoginRequest request, string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return ApiResponse<AuthResponse>.Fail("Google account email is required.");
        }

        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (user != null)
        {
            if (user.IsSuspended)
            {
                return ApiResponse<AuthResponse>.Fail($"Account is suspended. Reason: {user.SuspensionReason ?? "Violation of platform terms."}");
            }

            if (!user.IsActive)
            {
                return ApiResponse<AuthResponse>.Fail("Account is inactive. Please contact support.");
            }

            user.LastLoginAt = DateTime.UtcNow;
            var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
            return await GenerateAuthResponseAsync(user, roles, ipAddress, "Google sign-in successful.");
        }

        // Provision a new user for Google Sign-In
        var baseUsername = email.Split('@')[0].Replace(".", "_");
        var sanitizedUsername = new string(baseUsername.Where(char.IsLetterOrDigit).ToArray());
        if (string.IsNullOrWhiteSpace(sanitizedUsername) || sanitizedUsername.Length < 3)
        {
            sanitizedUsername = "user" + RandomNumberGenerator.GetString("0123456789", 4);
        }

        var username = sanitizedUsername.ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Username.ToLower() == username))
        {
            username = $"{username}_{RandomNumberGenerator.GetString("123456789", 4)}";
        }

        var fullName = !string.IsNullOrWhiteSpace(request.FullName) ? request.FullName.Trim() : sanitizedUsername;

        // Referral Code validation
        User? referrerUser = null;
        if (!string.IsNullOrWhiteSpace(request.ReferralCode))
        {
            var code = request.ReferralCode.Trim().ToUpperInvariant();
            referrerUser = await _db.Users.FirstOrDefaultAsync(u => u.ReferralCode == code && u.IsActive && !u.IsSuspended);
        }

        // Generate unique Referral Code
        string newReferralCode;
        do
        {
            newReferralCode = "NOV-" + RandomNumberGenerator.GetString("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
        } while (await _db.Users.AnyAsync(u => u.ReferralCode == newReferralCode));

        var randomPass = "Ggl_" + Guid.NewGuid().ToString("N")[..12];
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(randomPass, workFactor: 11);

        var userRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "User");
        if (userRole == null)
        {
            userRole = new Role { Name = "User", Description = "Standard user role" };
            await _db.Roles.AddAsync(userRole);
            await _db.SaveChangesAsync();
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var newUser = new User
            {
                FullName = fullName,
                Username = username,
                Email = email,
                PhoneNumber = "0300" + RandomNumberGenerator.GetString("0123456789", 7),
                PasswordHash = passwordHash,
                ReferralCode = newReferralCode,
                ReferredByUserId = referrerUser?.Id,
                IsActive = true,
                IsSuspended = false,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            await _db.Users.AddAsync(newUser);
            await _db.SaveChangesAsync();

            await _db.UserRoles.AddAsync(new UserRole
            {
                UserId = newUser.Id,
                RoleId = userRole.Id,
                AssignedAt = DateTime.UtcNow
            });

            var wallet = new Wallet
            {
                UserId = newUser.Id,
                AvailableBalance = 0.00m,
                ReservedBalance = 0.00m,
                TotalEarned = 0.00m,
                TotalWithdrawn = 0.00m,
                ReferralEarnings = 0.00m,
                CreatedAt = DateTime.UtcNow
            };
            await _db.Wallets.AddAsync(wallet);

            if (referrerUser != null)
            {
                await _db.ReferralRelationships.AddAsync(new ReferralRelationship
                {
                    ReferrerUserId = referrerUser.Id,
                    ReferredUserId = newUser.Id,
                    ReferralCode = referrerUser.ReferralCode,
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _db.Notifications.AddAsync(new Notification
            {
                UserId = newUser.Id,
                Type = "SystemAnnouncement",
                Title = "Welcome to NOVYRA via Google!",
                Message = "Your Google account is now linked. Explore tasks, earn verified rewards, and manage your wallet.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            var rolesList = new List<string> { userRole.Name };
            return await GenerateAuthResponseAsync(newUser, rolesList, ipAddress, "Google sign-in and account setup successful.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error occurred during Google user creation: {Message}", ex.Message);
            return ApiResponse<AuthResponse>.Fail("Google sign-in failed due to a server error. Please try again.");
        }
    }

    public async Task<ApiResponse<AuthResponse>> LoginWithTelegramAsync(TelegramLoginRequest request, string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(request.TelegramId))
        {
            return ApiResponse<AuthResponse>.Fail("Telegram ID is required.");
        }

        var tgId = request.TelegramId.Trim();
        var syntheticEmail = $"tg_{tgId}@telegram.novyra.com".ToLowerInvariant();

        var user = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == syntheticEmail);

        if (user != null)
        {
            if (user.IsSuspended)
            {
                return ApiResponse<AuthResponse>.Fail($"Account is suspended. Reason: {user.SuspensionReason ?? "Violation of platform terms."}");
            }

            if (!user.IsActive)
            {
                return ApiResponse<AuthResponse>.Fail("Account is inactive. Please contact support.");
            }

            user.LastLoginAt = DateTime.UtcNow;
            var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
            return await GenerateAuthResponseAsync(user, roles, ipAddress, "Telegram sign-in successful.");
        }

        // Provision a new user for Telegram Sign-In
        var rawUsername = !string.IsNullOrWhiteSpace(request.Username) 
            ? request.Username.Trim().Replace("@", "") 
            : $"tg_{tgId}";

        var sanitizedUsername = new string(rawUsername.Where(char.IsLetterOrDigit).ToArray());
        if (string.IsNullOrWhiteSpace(sanitizedUsername) || sanitizedUsername.Length < 3)
        {
            sanitizedUsername = "tguser" + RandomNumberGenerator.GetString("0123456789", 4);
        }

        var username = sanitizedUsername.ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Username.ToLower() == username))
        {
            username = $"{username}_{RandomNumberGenerator.GetString("123456789", 4)}";
        }

        var nameParts = new List<string>();
        if (!string.IsNullOrWhiteSpace(request.FirstName)) nameParts.Add(request.FirstName.Trim());
        if (!string.IsNullOrWhiteSpace(request.LastName)) nameParts.Add(request.LastName.Trim());
        var fullName = nameParts.Count > 0 ? string.Join(" ", nameParts) : (!string.IsNullOrWhiteSpace(request.Username) ? request.Username : $"Telegram User {tgId}");

        // Referral Code validation
        User? referrerUser = null;
        if (!string.IsNullOrWhiteSpace(request.ReferralCode))
        {
            var code = request.ReferralCode.Trim().ToUpperInvariant();
            referrerUser = await _db.Users.FirstOrDefaultAsync(u => u.ReferralCode == code && u.IsActive && !u.IsSuspended);
        }

        // Generate unique Referral Code
        string newReferralCode;
        do
        {
            newReferralCode = "NOV-" + RandomNumberGenerator.GetString("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
        } while (await _db.Users.AnyAsync(u => u.ReferralCode == newReferralCode));

        var randomPass = "Tg_" + Guid.NewGuid().ToString("N")[..12];
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(randomPass, workFactor: 11);

        var userRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "User");
        if (userRole == null)
        {
            userRole = new Role { Name = "User", Description = "Standard user role" };
            await _db.Roles.AddAsync(userRole);
            await _db.SaveChangesAsync();
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var newUser = new User
            {
                FullName = fullName,
                Username = username,
                Email = syntheticEmail,
                PhoneNumber = "0300" + RandomNumberGenerator.GetString("0123456789", 7),
                PasswordHash = passwordHash,
                ReferralCode = newReferralCode,
                ReferredByUserId = referrerUser?.Id,
                IsActive = true,
                IsSuspended = false,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            await _db.Users.AddAsync(newUser);
            await _db.SaveChangesAsync();

            await _db.UserRoles.AddAsync(new UserRole
            {
                UserId = newUser.Id,
                RoleId = userRole.Id,
                AssignedAt = DateTime.UtcNow
            });

            var wallet = new Wallet
            {
                UserId = newUser.Id,
                AvailableBalance = 0.00m,
                ReservedBalance = 0.00m,
                TotalEarned = 0.00m,
                TotalWithdrawn = 0.00m,
                ReferralEarnings = 0.00m,
                CreatedAt = DateTime.UtcNow
            };
            await _db.Wallets.AddAsync(wallet);

            if (referrerUser != null)
            {
                await _db.ReferralRelationships.AddAsync(new ReferralRelationship
                {
                    ReferrerUserId = referrerUser.Id,
                    ReferredUserId = newUser.Id,
                    ReferralCode = referrerUser.ReferralCode,
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _db.Notifications.AddAsync(new Notification
            {
                UserId = newUser.Id,
                Type = "SystemAnnouncement",
                Title = "Welcome to NOVYRA via Telegram!",
                Message = "Your Telegram account is now connected. Start completing tasks and receiving earnings.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            var rolesList = new List<string> { userRole.Name };
            return await GenerateAuthResponseAsync(newUser, rolesList, ipAddress, "Telegram sign-in and account setup successful.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error occurred during Telegram user creation: {Message}", ex.Message);
            return ApiResponse<AuthResponse>.Fail("Telegram sign-in failed due to a server error. Please try again.");
        }
    }

    private async Task<ApiResponse<AuthResponse>> GenerateAuthResponseAsync(User user, List<string> roles, string? ipAddress, string message)
    {
        var accessToken = _tokenService.GenerateAccessToken(user, roles);

        var rawRefreshToken = _tokenService.GenerateRefreshToken();
        var tokenHash = _tokenService.HashToken(rawRefreshToken);
        var refreshTokenDays = _jwtSettings.RefreshTokenExpiryDays > 0 ? _jwtSettings.RefreshTokenExpiryDays : 7;

        await _db.RefreshTokens.AddAsync(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenDays),
            IsRevoked = false,
            CreatedByIp = ipAddress,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        var accessExpiryMinutes = _jwtSettings.AccessTokenExpiryMinutes > 0 ? _jwtSettings.AccessTokenExpiryMinutes : 15;
        var userDto = MapToUserDto(user, roles);

        return ApiResponse<AuthResponse>.Ok(new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = rawRefreshToken,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(accessExpiryMinutes),
            User = userDto
        }, message);
    }

    public async Task<ApiResponse<AuthResponse>> RefreshTokenAsync(RefreshTokenRequest request, string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return ApiResponse<AuthResponse>.Fail("Refresh token is required.");
        }

        var tokenHash = _tokenService.HashToken(request.RefreshToken);

        var existingToken = await _db.RefreshTokens
            .Include(t => t.User)
            .ThenInclude(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

        if (existingToken == null || existingToken.IsRevoked || existingToken.ExpiresAt <= DateTime.UtcNow)
        {
            return ApiResponse<AuthResponse>.Fail("Refresh token is invalid or expired. Please sign in again.");
        }

        var user = existingToken.User;
        if (user.IsSuspended || !user.IsActive)
        {
            return ApiResponse<AuthResponse>.Fail("Account is suspended or deactivated.");
        }

        // Rotate Refresh Token
        var newRawRefreshToken = _tokenService.GenerateRefreshToken();
        var newTokenHash = _tokenService.HashToken(newRawRefreshToken);

        existingToken.IsRevoked = true;
        existingToken.RevokedAt = DateTime.UtcNow;
        existingToken.ReplacedByTokenHash = newTokenHash;

        var refreshTokenDays = _jwtSettings.RefreshTokenExpiryDays > 0 ? _jwtSettings.RefreshTokenExpiryDays : 7;
        await _db.RefreshTokens.AddAsync(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = newTokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenDays),
            IsRevoked = false,
            CreatedByIp = ipAddress,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var newAccessToken = _tokenService.GenerateAccessToken(user, roles);
        var accessExpiryMinutes = _jwtSettings.AccessTokenExpiryMinutes > 0 ? _jwtSettings.AccessTokenExpiryMinutes : 15;

        return ApiResponse<AuthResponse>.Ok(new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRawRefreshToken,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(accessExpiryMinutes),
            User = MapToUserDto(user, roles)
        }, "Token refreshed successfully.");
    }

    public async Task<ApiResponse> RevokeTokenAsync(RevokeTokenRequest request, long currentUserId, bool isAdmin)
    {
        var tokenHash = _tokenService.HashToken(request.RefreshToken);
        var token = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

        if (token == null)
        {
            return ApiResponse.Fail("Token not found.");
        }

        if (token.UserId != currentUserId && !isAdmin)
        {
            return ApiResponse.Fail("Forbidden: Cannot revoke another user's session.");
        }

        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return ApiResponse.Ok("Session revoked successfully.");
    }

    public async Task<ApiResponse> LogoutAsync(string refreshToken)
    {
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            var tokenHash = _tokenService.HashToken(refreshToken);
            var token = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash);
            if (token != null)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }
        return ApiResponse.Ok("Logged out successfully.");
    }

    public async Task<ApiResponse<UserDto>> GetCurrentUserAsync(long userId)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("User not found.");
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        return ApiResponse<UserDto>.Ok(MapToUserDto(user, roles));
    }

    public async Task<ApiResponse> ChangePasswordAsync(long userId, ChangePasswordRequest request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            return ApiResponse.Fail("User not found.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return ApiResponse.Fail("Current password is incorrect.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, workFactor: 11);
        user.UpdatedAt = DateTime.UtcNow;

        // Invalidate existing refresh tokens upon password change
        var activeTokens = await _db.RefreshTokens.Where(t => t.UserId == userId && !t.IsRevoked).ToListAsync();
        foreach (var t in activeTokens)
        {
            t.IsRevoked = true;
            t.RevokedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return ApiResponse.Ok("Password changed successfully. Please log in again with your new password.");
    }

    public async Task<ApiResponse<UserDto>> UpdateProfileAsync(long userId, UpdateProfileRequest request)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("User not found.");
        }

        var phone = request.PhoneNumber.Trim();
        if (phone != user.PhoneNumber && await _db.Users.AnyAsync(u => u.PhoneNumber == phone && u.Id != userId))
        {
            return ApiResponse<UserDto>.Fail("Phone number is already associated with another account.");
        }

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = phone;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();

        return ApiResponse<UserDto>.Ok(MapToUserDto(user, roles), "Profile updated successfully.");
    }

    private static UserDto MapToUserDto(User user, List<string> roles)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Username = user.Username,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            ReferralCode = user.ReferralCode,
            Roles = roles,
            IsActive = user.IsActive,
            IsSuspended = user.IsSuspended,
            SuspensionReason = user.SuspensionReason,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}
