using Amazon.DynamoDBv2.DataModel;

namespace RosaContabilidade.Api.Models;

[DynamoDBTable("RosaUsers")]
public class ApplicationUser
{
    [DynamoDBHashKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [DynamoDBGlobalSecondaryIndexHashKey("Email-index")]
    public string Email { get; set; } = string.Empty;

    public string? NormalizedEmail { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? NormalizedUserName { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? CpfCnpj { get; set; }
    public string? RegimeObservacoes { get; set; }
    public string? PhoneNumber { get; set; }
    public bool EmailConfirmed { get; set; }
    public string? PasswordHash { get; set; }
    public string? SecurityStamp { get; set; }
    public string? ConcurrencyStamp { get; set; } = Guid.NewGuid().ToString();
    public int AccessFailedCount { get; set; }
    public bool LockoutEnabled { get; set; } = true;
    public DateTime? LockoutEnd { get; set; }

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Roles stored as a list directly on the user for DynamoDB simplicity
    public List<string> Roles { get; set; } = new();
}
