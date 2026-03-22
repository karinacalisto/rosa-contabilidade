using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RosaContabilidade.Api.Data.Repositories;
using RosaContabilidade.Api.DTOs;
using RosaContabilidade.Api.Models;
using RosaContabilidade.Api.Services;

namespace RosaContabilidade.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly DocumentRepository _repo;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly S3StorageService _s3;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(
        DocumentRepository repo,
        UserManager<ApplicationUser> userManager,
        S3StorageService s3,
        ILogger<DocumentsController> logger)
    {
        _repo = repo;
        _userManager = userManager;
        _s3 = s3;
        _logger = logger;
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<ActionResult<List<DocumentDto>>> GetAll([FromQuery] string? clienteId)
    {
        var items = await _repo.GetAllAsync(clienteId);
        foreach (var item in items)
        {
            if (string.IsNullOrEmpty(item.ClienteNome))
            {
                var cliente = await _userManager.FindByIdAsync(item.ClienteId);
                item.ClienteNome = cliente?.FullName;
            }
        }
        var sorted = items.OrderByDescending(d => d.CreatedAt).ToList();
        return Ok(sorted.Select(MapToDto));
    }

    [HttpGet("meus")]
    public async Task<ActionResult<List<DocumentDto>>> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _repo.GetByClienteIdAsync(userId);
        var sorted = items.OrderByDescending(d => d.CreatedAt).ToList();
        return Ok(sorted.Select(MapToDto));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPost("upload")]
    [RequestSizeLimit(50_000_000)] // 50MB
    public async Task<ActionResult<DocumentDto>> Upload([FromForm] IFormFile file, [FromForm] string clienteId, [FromForm] string? descricao)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new ProblemDetails { Title = "Arquivo não enviado", Status = 400 });

        var cliente = await _userManager.FindByIdAsync(clienteId);
        if (cliente == null)
            return NotFound(new ProblemDetails { Title = "Cliente não encontrado", Status = 404 });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        string s3Key;
        await using (var stream = file.OpenReadStream())
        {
            s3Key = await _s3.UploadAsync(stream, file.FileName, file.ContentType);
        }

        var doc = new Document
        {
            NomeOriginal = file.FileName,
            NomeArquivo = Path.GetFileName(s3Key),
            S3Key = s3Key,
            TipoMime = file.ContentType,
            TamanhoBytes = file.Length,
            Descricao = descricao,
            ClienteId = clienteId,
            ClienteNome = cliente.FullName,
            CreatedBy = userId
        };

        await _repo.CreateAsync(doc);

        _logger.LogInformation("Documento enviado para S3: {Nome} para cliente {ClienteId}", file.FileName, clienteId);

        return CreatedAtAction(nameof(Download), new { id = doc.Id }, MapToDto(doc));
    }

    [HttpPost("upload-meu")]
    [RequestSizeLimit(50_000_000)]
    public async Task<ActionResult<DocumentDto>> UploadMeu([FromForm] IFormFile file, [FromForm] string? descricao)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new ProblemDetails { Title = "Arquivo não enviado", Status = 400 });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var user = await _userManager.FindByIdAsync(userId);

        string s3Key;
        await using (var stream = file.OpenReadStream())
        {
            s3Key = await _s3.UploadAsync(stream, file.FileName, file.ContentType);
        }

        var doc = new Document
        {
            NomeOriginal = file.FileName,
            NomeArquivo = Path.GetFileName(s3Key),
            S3Key = s3Key,
            TipoMime = file.ContentType,
            TamanhoBytes = file.Length,
            Descricao = descricao,
            ClienteId = userId,
            ClienteNome = user?.FullName,
            CreatedBy = userId
        };

        await _repo.CreateAsync(doc);

        return CreatedAtAction(nameof(Download), new { id = doc.Id }, MapToDto(doc));
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(string id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole("ADMIN");

        var doc = await _repo.GetByIdAsync(id);
        if (doc == null) return NotFound();

        if (!isAdmin && doc.ClienteId != userId)
            return Forbid();

        try
        {
            var (stream, contentType) = await _s3.DownloadAsync(doc.S3Key);
            return File(stream, contentType, doc.NomeOriginal);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao baixar documento {Id} do S3", id);
            return NotFound(new ProblemDetails { Title = "Arquivo não encontrado no S3", Status = 404 });
        }
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var doc = await _repo.GetByIdAsync(id);
        if (doc == null) return NotFound();

        try
        {
            await _s3.DeleteAsync(doc.S3Key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao remover arquivo do S3: {Key}", doc.S3Key);
        }

        await _repo.DeleteAsync(id);

        _logger.LogInformation("Documento excluído: {Nome}", doc.NomeOriginal);
        return NoContent();
    }

    private static DocumentDto MapToDto(Document d) => new()
    {
        Id = d.Id,
        NomeOriginal = d.NomeOriginal,
        TipoMime = d.TipoMime,
        TamanhoBytes = d.TamanhoBytes,
        Descricao = d.Descricao,
        ClienteId = d.ClienteId,
        ClienteNome = d.ClienteNome,
        CreatedAt = d.CreatedAt,
        UpdatedAt = d.UpdatedAt
    };
}
