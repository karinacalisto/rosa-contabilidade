using Amazon.DynamoDBv2.DataModel;

namespace RosaContabilidade.Api.Models;

[DynamoDBTable("RosaLeads")]
public class Lead
{
    [DynamoDBHashKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string? Mensagem { get; set; }

    [DynamoDBGlobalSecondaryIndexHashKey("Origem-index")]
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
