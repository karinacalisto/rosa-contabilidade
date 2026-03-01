using Microsoft.AspNetCore.Identity;

namespace RosaContabilidade.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string? CpfCnpj { get; set; }
    public string? RegimeObservacoes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    // Navigation
    public ICollection<Pendency> Pendencies { get; set; } = new List<Pendency>();
    public ICollection<PaymentLink> PaymentLinks { get; set; } = new List<PaymentLink>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
}
