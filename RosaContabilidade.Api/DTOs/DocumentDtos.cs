namespace RosaContabilidade.Api.DTOs;

public class DocumentDto
{
    public string Id { get; set; } = string.Empty;
    public string NomeOriginal { get; set; } = string.Empty;
    public string TipoMime { get; set; } = string.Empty;
    public long TamanhoBytes { get; set; }
    public string? Descricao { get; set; }
    public string ClienteId { get; set; } = string.Empty;
    public string? ClienteNome { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
