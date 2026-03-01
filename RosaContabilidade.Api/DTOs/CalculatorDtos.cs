using System.ComponentModel.DataAnnotations;

namespace RosaContabilidade.Api.DTOs;

public class CalculatorRequest
{
    [Required]
    public string TipoPessoa { get; set; } = string.Empty; // PF | PJ
    [Required, Range(0, double.MaxValue)]
    public decimal ReceitaMensal { get; set; }
    [Range(0, double.MaxValue)]
    public decimal? DespesasDedutiveis { get; set; }
    [Range(0, 1)]
    public decimal? AliquotaEstimada { get; set; }
    public string? OpcaoRegime { get; set; } // simples | geral
}

public class CalculatorResponse
{
    public decimal ImpostoEstimadoMensal { get; set; }
    public decimal PercentualEfetivo { get; set; }
    public string Regime { get; set; } = string.Empty;
    public string TipoPessoa { get; set; } = string.Empty;
    public decimal BaseCalculo { get; set; }
    public string Aviso { get; set; } = "Esta é uma simulação educativa e não substitui a orientação de um contador profissional.";
    public List<string> Detalhes { get; set; } = new();
}
