using Amazon.DynamoDBv2.DataModel;

namespace RosaContabilidade.Api.Models;

[DynamoDBTable("RosaPendencies")]
public class Pendency
{
    [DynamoDBHashKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Descricao { get; set; } = string.Empty;
    public bool Resolvida { get; set; } = false;
    public DateTime? DataLimite { get; set; }

    [DynamoDBGlobalSecondaryIndexHashKey("ClienteId-index")]
    public string ClienteId { get; set; } = string.Empty;

    public string? ClienteNome { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
}
