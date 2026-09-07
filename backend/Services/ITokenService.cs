using Novyra.Backend.Entities;

namespace Novyra.Backend.Services;

public interface ITokenService
{
    string GenerateAccessToken(User user, IEnumerable<string> roles);
    string GenerateRefreshToken();
    string HashToken(string token);
}
