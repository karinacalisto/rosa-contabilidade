using System.ComponentModel.DataAnnotations;

namespace RosaContabilidade.Api.DTOs;

public class PendencyDto
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public bool Resolvida { get; set; }
    public DateTime? DataLimite { get; set; }
    public string ClienteId { get; set; } = string.Empty;
    public string? ClienteNome { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class PendencyCreateRequest
{
    [Required, MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;
    public bool Resolvida { get; set; } = false;
    public DateTime? DataLimite { get; set; }
    [Required]
    public string ClienteId { get; set; } = string.Empty;
}

public class PendencyUpdateRequest
{
    [Required, MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;
    public bool Resolvida { get; set; }
    public DateTime? DataLimite { get; set; }
}
