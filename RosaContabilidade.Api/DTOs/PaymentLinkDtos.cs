using System.ComponentModel.DataAnnotations;

namespace RosaContabilidade.Api.DTOs;

public class PaymentLinkDto
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public decimal? Valor { get; set; }
    public bool Pago { get; set; }
    public string ClienteId { get; set; } = string.Empty;
    public string? ClienteNome { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class PaymentLinkCreateRequest
{
    [Required, MaxLength(300)]
    public string Descricao { get; set; } = string.Empty;
    [Required, MaxLength(1000), Url]
    public string Url { get; set; } = string.Empty;
    [Range(0, double.MaxValue)]
    public decimal? Valor { get; set; }
    public bool Pago { get; set; } = false;
    [Required]
    public string ClienteId { get; set; } = string.Empty;
}

public class PaymentLinkUpdateRequest
{
    [Required, MaxLength(300)]
    public string Descricao { get; set; } = string.Empty;
    [Required, MaxLength(1000), Url]
    public string Url { get; set; } = string.Empty;
    [Range(0, double.MaxValue)]
    public decimal? Valor { get; set; }
    public bool Pago { get; set; }
}
