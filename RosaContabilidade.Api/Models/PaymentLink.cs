namespace RosaContabilidade.Api.Models;

public class PaymentLink
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public decimal? Valor { get; set; }
    public bool Pago { get; set; } = false;

    public string ClienteId { get; set; } = string.Empty;
    public ApplicationUser Cliente { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
}
