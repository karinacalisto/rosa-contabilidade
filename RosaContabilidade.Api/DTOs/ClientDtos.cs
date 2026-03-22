using System.ComponentModel.DataAnnotations;

namespace RosaContabilidade.Api.DTOs;

public class ClientDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? CpfCnpj { get; set; }
    public string? RegimeObservacoes { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PendenciasCount { get; set; }
    public int DocumentosCount { get; set; }
    public int PagamentosCount { get; set; }
}

public class ClientUpdateRequest
{
    [Required, MaxLength(200)]
    public string FullName { get; set; } = string.Empty;
    [MaxLength(20)]
    public string? CpfCnpj { get; set; }
    [MaxLength(500)]
    public string? RegimeObservacoes { get; set; }
    [Phone]
    public string? PhoneNumber { get; set; }
}

public class ClientDashboardDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? CpfCnpj { get; set; }
    public string? RegimeObservacoes { get; set; }
    public List<PendencyDto> Pendencias { get; set; } = new();
    public List<PaymentLinkDto> LinksPagamento { get; set; } = new();
    public List<DocumentDto> Documentos { get; set; } = new();
}
