using Amazon.DynamoDBv2.DataModel;

namespace RosaContabilidade.Api.Models;

[DynamoDBTable("RosaDocuments")]
public class Document
{
    [DynamoDBHashKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string NomeOriginal { get; set; } = string.Empty;
    public string NomeArquivo { get; set; } = string.Empty;
    public string S3Key { get; set; } = string.Empty;
    public string TipoMime { get; set; } = string.Empty;
    public long TamanhoBytes { get; set; }
    public string? Descricao { get; set; }

    [DynamoDBGlobalSecondaryIndexHashKey("ClienteId-index")]
    public string ClienteId { get; set; } = string.Empty;

    public string? ClienteNome { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
}
