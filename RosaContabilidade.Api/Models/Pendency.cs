namespace RosaContabilidade.Api.Models;

public class Pendency
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public bool Resolvida { get; set; } = false;
    public DateTime? DataLimite { get; set; }

    public string ClienteId { get; set; } = string.Empty;
    public ApplicationUser Cliente { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
}
