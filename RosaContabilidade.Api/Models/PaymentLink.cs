using Amazon.DynamoDBv2.DataModel;

namespace RosaContabilidade.Api.Models;

[DynamoDBTable("RosaPaymentLinks")]
public class PaymentLink
{
    [DynamoDBHashKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Descricao { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public decimal? Valor { get; set; }
    public bool Pago { get; set; } = false;

    [DynamoDBGlobalSecondaryIndexHashKey("ClienteId-index")]
    public string ClienteId { get; set; } = string.Empty;

    public string? ClienteNome { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
}
