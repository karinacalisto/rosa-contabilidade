namespace RosaContabilidade.Api.Models;

public class Document
{
    public int Id { get; set; }
    public string NomeOriginal { get; set; } = string.Empty;
    public string NomeArquivo { get; set; } = string.Empty;
    public string CaminhoRelativo { get; set; } = string.Empty;
    public string TipoMime { get; set; } = string.Empty;
    public long TamanhoBytes { get; set; }
    public string? Descricao { get; set; }

    public string ClienteId { get; set; } = string.Empty;
    public ApplicationUser Cliente { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
}
