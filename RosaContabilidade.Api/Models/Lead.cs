namespace RosaContabilidade.Api.Models;

public class Lead
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string? Mensagem { get; set; }
    public string Origem { get; set; } = "contato"; // contato | calculadora

    // Dados da simulação (quando origem = calculadora)
    public string? TipoPessoa { get; set; } // PF | PJ
    public decimal? ReceitaMensal { get; set; }
    public decimal? DespesasDedutiveis { get; set; }
    public decimal? AliquotaEstimada { get; set; }
    public string? OpcaoRegime { get; set; } // simples | geral
    public decimal? ImpostoEstimado { get; set; }
    public decimal? PercentualEfetivo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
}
