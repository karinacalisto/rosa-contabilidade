using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Microsoft.AspNetCore.Identity;
using RosaContabilidade.Api.Models;

namespace RosaContabilidade.Api.Data;

public class DynamoUserStore :
    IUserStore<ApplicationUser>,
    IUserPasswordStore<ApplicationUser>,
    IUserRoleStore<ApplicationUser>,
    IUserEmailStore<ApplicationUser>,
    IUserLockoutStore<ApplicationUser>,
    IUserSecurityStampStore<ApplicationUser>
{
    private readonly IDynamoDBContext _db;

    public DynamoUserStore(IDynamoDBContext db) => _db = db;

    public void Dispose() { }

    // === IUserStore ===
    public async Task<IdentityResult> CreateAsync(ApplicationUser user, CancellationToken ct)
    {
        user.NormalizedEmail = user.Email?.ToUpperInvariant();
        user.NormalizedUserName = user.UserName?.ToUpperInvariant();
        await _db.SaveAsync(user, ct);
        return IdentityResult.Success;
    }

    public async Task<IdentityResult> UpdateAsync(ApplicationUser user, CancellationToken ct)
    {
        user.NormalizedEmail = user.Email?.ToUpperInvariant();
        user.NormalizedUserName = user.UserName?.ToUpperInvariant();
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveAsync(user, ct);
        return IdentityResult.Success;
    }

    public async Task<IdentityResult> DeleteAsync(ApplicationUser user, CancellationToken ct)
    {
        await _db.DeleteAsync(user, ct);
        return IdentityResult.Success;
    }

    public async Task<ApplicationUser?> FindByIdAsync(string userId, CancellationToken ct)
    {
        return await _db.LoadAsync<ApplicationUser>(userId, ct);
    }

    public async Task<ApplicationUser?> FindByNameAsync(string normalizedUserName, CancellationToken ct)
    {
        // Username == Email in our system, so query by email index
        var search = _db.FromQueryAsync<ApplicationUser>(new QueryOperationConfig
        {
            IndexName = "Email-index",
            KeyExpression = new Expression
            {
                ExpressionStatement = "NormalizedEmail = :v",
                ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
                {
                    { ":v", normalizedUserName }
                }
            }
        });
        var results = await search.GetRemainingAsync(ct);
        return results.FirstOrDefault();
    }

    public Task<string> GetUserIdAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult(user.Id);

    public Task<string?> GetUserNameAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult<string?>(user.UserName);

    public Task SetUserNameAsync(ApplicationUser user, string? userName, CancellationToken ct)
    {
        user.UserName = userName ?? string.Empty;
        return Task.CompletedTask;
    }

    public Task<string?> GetNormalizedUserNameAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult(user.NormalizedUserName);

    public Task SetNormalizedUserNameAsync(ApplicationUser user, string? normalizedName, CancellationToken ct)
    {
        user.NormalizedUserName = normalizedName;
        return Task.CompletedTask;
    }

    // === IUserPasswordStore ===
    public Task SetPasswordHashAsync(ApplicationUser user, string? passwordHash, CancellationToken ct)
    {
        user.PasswordHash = passwordHash;
        return Task.CompletedTask;
    }

    public Task<string?> GetPasswordHashAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult(user.PasswordHash);

    public Task<bool> HasPasswordAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult(!string.IsNullOrEmpty(user.PasswordHash));

    // === IUserRoleStore ===
    public Task AddToRoleAsync(ApplicationUser user, string roleName, CancellationToken ct)
    {
        var normalized = roleName.ToUpperInvariant();
        if (!user.Roles.Contains(normalized))
            user.Roles.Add(normalized);
        return Task.CompletedTask;
    }

    public Task RemoveFromRoleAsync(ApplicationUser user, string roleName, CancellationToken ct)
    {
        user.Roles.Remove(roleName.ToUpperInvariant());
        return Task.CompletedTask;
    }

    public Task<IList<string>> GetRolesAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult<IList<string>>(user.Roles);

    public Task<bool> IsInRoleAsync(ApplicationUser user, string roleName, CancellationToken ct)
        => Task.FromResult(user.Roles.Contains(roleName.ToUpperInvariant()));

    public async Task<IList<ApplicationUser>> GetUsersInRoleAsync(string roleName, CancellationToken ct)
    {
        var normalized = roleName.ToUpperInvariant();
        var allUsers = await _db.ScanAsync<ApplicationUser>(default(List<ScanCondition>), null).GetRemainingAsync(ct);
        return allUsers.Where(u => u.Roles.Contains(normalized)).ToList();
    }

    // === IUserEmailStore ===
    public Task SetEmailAsync(ApplicationUser user, string? email, CancellationToken ct)
    {
        user.Email = email ?? string.Empty;
        return Task.CompletedTask;
    }

    public Task<string?> GetEmailAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult<string?>(user.Email);

    public Task<bool> GetEmailConfirmedAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult(user.EmailConfirmed);

    public Task SetEmailConfirmedAsync(ApplicationUser user, bool confirmed, CancellationToken ct)
    {
        user.EmailConfirmed = confirmed;
        return Task.CompletedTask;
    }

    public async Task<ApplicationUser?> FindByEmailAsync(string normalizedEmail, CancellationToken ct)
    {
        var search = _db.FromQueryAsync<ApplicationUser>(new QueryOperationConfig
        {
            IndexName = "Email-index",
            KeyExpression = new Expression
            {
                ExpressionStatement = "NormalizedEmail = :v",
                ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
                {
                    { ":v", normalizedEmail }
                }
            }
        });
        var results = await search.GetRemainingAsync(ct);
        return results.FirstOrDefault();
    }

    public Task<string?> GetNormalizedEmailAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult(user.NormalizedEmail);

    public Task SetNormalizedEmailAsync(ApplicationUser user, string? normalizedEmail, CancellationToken ct)
    {
        user.NormalizedEmail = normalizedEmail;
        return Task.CompletedTask;
    }

    // === IUserLockoutStore ===
    public Task<DateTimeOffset?> GetLockoutEndDateAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult(user.LockoutEnd.HasValue ? new DateTimeOffset(user.LockoutEnd.Value) : (DateTimeOffset?)null);

    public Task SetLockoutEndDateAsync(ApplicationUser user, DateTimeOffset? lockoutEnd, CancellationToken ct)
    {
        user.LockoutEnd = lockoutEnd?.UtcDateTime;
        return Task.CompletedTask;
    }

    public Task<int> IncrementAccessFailedCountAsync(ApplicationUser user, CancellationToken ct)
    {
        user.AccessFailedCount++;
        return Task.FromResult(user.AccessFailedCount);
    }

    public Task ResetAccessFailedCountAsync(ApplicationUser user, CancellationToken ct)
    {
        user.AccessFailedCount = 0;
        return Task.CompletedTask;
    }

    public Task<int> GetAccessFailedCountAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult(user.AccessFailedCount);

    public Task<bool> GetLockoutEnabledAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult(user.LockoutEnabled);

    public Task SetLockoutEnabledAsync(ApplicationUser user, bool enabled, CancellationToken ct)
    {
        user.LockoutEnabled = enabled;
        return Task.CompletedTask;
    }

    // === IUserSecurityStampStore ===
    public Task SetSecurityStampAsync(ApplicationUser user, string stamp, CancellationToken ct)
    {
        user.SecurityStamp = stamp;
        return Task.CompletedTask;
    }

    public Task<string?> GetSecurityStampAsync(ApplicationUser user, CancellationToken ct)
        => Task.FromResult(user.SecurityStamp);

    // === Helper: find by refresh token ===
    public async Task<ApplicationUser?> FindByRefreshTokenAsync(string refreshToken)
    {
        var allUsers = await _db.ScanAsync<ApplicationUser>(
            new List<ScanCondition>
            {
                new("RefreshToken", ScanOperator.Equal, refreshToken)
            }, null).GetRemainingAsync();
        return allUsers.FirstOrDefault();
    }
}
