using Microsoft.AspNetCore.Identity;

namespace RosaContabilidade.Api.Data;

/// <summary>
/// Minimal role store - roles are stored directly on ApplicationUser.Roles list.
/// This is a stub to satisfy Identity's IRoleStore requirement.
/// </summary>
public class DynamoRoleStore : IRoleStore<IdentityRole>
{
    private static readonly Dictionary<string, IdentityRole> Roles = new()
    {
        ["ADMIN"] = new IdentityRole { Id = "ADMIN", Name = "ADMIN", NormalizedName = "ADMIN" },
        ["CLIENTE"] = new IdentityRole { Id = "CLIENTE", Name = "CLIENTE", NormalizedName = "CLIENTE" }
    };

    public void Dispose() { }

    public Task<IdentityResult> CreateAsync(IdentityRole role, CancellationToken ct)
    {
        Roles[role.NormalizedName ?? role.Name!.ToUpperInvariant()] = role;
        return Task.FromResult(IdentityResult.Success);
    }

    public Task<IdentityResult> UpdateAsync(IdentityRole role, CancellationToken ct)
        => Task.FromResult(IdentityResult.Success);

    public Task<IdentityResult> DeleteAsync(IdentityRole role, CancellationToken ct)
    {
        Roles.Remove(role.NormalizedName ?? role.Name!.ToUpperInvariant());
        return Task.FromResult(IdentityResult.Success);
    }

    public Task<string> GetRoleIdAsync(IdentityRole role, CancellationToken ct)
        => Task.FromResult(role.Id ?? role.Name!);

    public Task<string?> GetRoleNameAsync(IdentityRole role, CancellationToken ct)
        => Task.FromResult(role.Name);

    public Task SetRoleNameAsync(IdentityRole role, string? roleName, CancellationToken ct)
    {
        role.Name = roleName;
        return Task.CompletedTask;
    }

    public Task<string?> GetNormalizedRoleNameAsync(IdentityRole role, CancellationToken ct)
        => Task.FromResult(role.NormalizedName);

    public Task SetNormalizedRoleNameAsync(IdentityRole role, string? normalizedName, CancellationToken ct)
    {
        role.NormalizedName = normalizedName;
        return Task.CompletedTask;
    }

    public Task<IdentityRole?> FindByIdAsync(string roleId, CancellationToken ct)
    {
        Roles.TryGetValue(roleId.ToUpperInvariant(), out var role);
        return Task.FromResult(role);
    }

    public Task<IdentityRole?> FindByNameAsync(string normalizedRoleName, CancellationToken ct)
    {
        Roles.TryGetValue(normalizedRoleName, out var role);
        return Task.FromResult(role);
    }
}
