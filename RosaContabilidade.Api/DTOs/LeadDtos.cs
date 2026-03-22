using System.ComponentModel.DataAnnotations;

namespace RosaContabilidade.Api.DTOs;

public class LeadDto
{
    public string Id { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string? Mensagem { get; set; }
    public string Origem { get; set; } = string.Empty;
    public string? TipoPessoa { get; set; }
    public decimal? ReceitaMensal { get; set; }
    public decimal? DespesasDedutiveis { get; set; }
    public decimal? AliquotaEstimada { get; set; }
    public string? OpcaoRegime { get; set; }
    public decimal? ImpostoEstimado { get; set; }
    public decimal? PercentualEfetivo { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LeadCreateRequest
{
    [Required, MaxLength(200)]
    public string Nome { get; set; } = string.Empty;
    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;
    [MaxLength(30)]
    public string? Telefone { get; set; }
    [MaxLength(2000)]
    public string? Mensagem { get; set; }
}

public class LeadCalculadoraRequest
{
    [Required, MaxLength(200)]
    public string Nome { get; set; } = string.Empty;
    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;
    [MaxLength(30)]
    public string? Telefone { get; set; }

    [Required]
    public string TipoPessoa { get; set; } = string.Empty; // PF | PJ
    [Required, Range(0, double.MaxValue)]
    public decimal ReceitaMensal { get; set; }
    [Range(0, double.MaxValue)]
    public decimal? DespesasDedutiveis { get; set; }
    [Range(0, 1)]
    public decimal? AliquotaEstimada { get; set; }
    public string? OpcaoRegime { get; set; } // simples | geral

    public decimal ImpostoEstimado { get; set; }
    public decimal PercentualEfetivo { get; set; }
}
