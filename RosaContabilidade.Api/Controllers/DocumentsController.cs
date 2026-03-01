using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RosaContabilidade.Api.Data;
using RosaContabilidade.Api.DTOs;
using RosaContabilidade.Api.Models;

namespace RosaContabilidade.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(AppDbContext db, IConfiguration config, ILogger<DocumentsController> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    private string GetUploadPath()
    {
        var path = _config["Uploads:Path"] ?? Path.Combine(Directory.GetCurrentDirectory(), "App_Data", "uploads");
        if (!Directory.Exists(path))
            Directory.CreateDirectory(path);
        return path;
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<ActionResult<List<DocumentDto>>> GetAll([FromQuery] string? clienteId)
    {
        var query = _db.Documents.Include(d => d.Cliente).AsQueryable();
        if (!string.IsNullOrEmpty(clienteId))
            query = query.Where(d => d.ClienteId == clienteId);

        var items = await query.OrderByDescending(d => d.CreatedAt).ToListAsync();
        return Ok(items.Select(MapToDto));
    }

    [HttpGet("meus")]
    public async Task<ActionResult<List<DocumentDto>>> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _db.Documents
            .Where(d => d.ClienteId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
        return Ok(items.Select(MapToDto));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPost("upload")]
    [RequestSizeLimit(50_000_000)] // 50MB
    public async Task<ActionResult<DocumentDto>> Upload([FromForm] IFormFile file, [FromForm] string clienteId, [FromForm] string? descricao)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new ProblemDetails { Title = "Arquivo não enviado", Status = 400 });

        var cliente = await _db.Users.FindAsync(clienteId);
        if (cliente == null)
            return NotFound(new ProblemDetails { Title = "Cliente não encontrado", Status = 404 });

        var uploadPath = GetUploadPath();
        var nomeArquivo = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var caminhoCompleto = Path.Combine(uploadPath, nomeArquivo);

        await using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var doc = new Document
        {
            NomeOriginal = file.FileName,
            NomeArquivo = nomeArquivo,
            CaminhoRelativo = nomeArquivo,
            TipoMime = file.ContentType,
            TamanhoBytes = file.Length,
            Descricao = descricao,
            ClienteId = clienteId,
            CreatedBy = userId
        };

        _db.Documents.Add(doc);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Documento enviado: {Nome} para cliente {ClienteId}", file.FileName, clienteId);

        return CreatedAtAction(nameof(Download), new { id = doc.Id }, MapToDto(doc));
    }

    [HttpPost("upload-meu")]
    [RequestSizeLimit(50_000_000)]
    public async Task<ActionResult<DocumentDto>> UploadMeu([FromForm] IFormFile file, [FromForm] string? descricao)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new ProblemDetails { Title = "Arquivo não enviado", Status = 400 });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var uploadPath = GetUploadPath();
        var nomeArquivo = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var caminhoCompleto = Path.Combine(uploadPath, nomeArquivo);

        await using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var doc = new Document
        {
            NomeOriginal = file.FileName,
            NomeArquivo = nomeArquivo,
            CaminhoRelativo = nomeArquivo,
            TipoMime = file.ContentType,
            TamanhoBytes = file.Length,
            Descricao = descricao,
            ClienteId = userId,
            CreatedBy = userId
        };

        _db.Documents.Add(doc);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Download), new { id = doc.Id }, MapToDto(doc));
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole("ADMIN");

        var doc = await _db.Documents.FindAsync(id);
        if (doc == null) return NotFound();

        if (!isAdmin && doc.ClienteId != userId)
            return Forbid();

        var uploadPath = GetUploadPath();
        var filePath = Path.Combine(uploadPath, doc.CaminhoRelativo);

        if (!System.IO.File.Exists(filePath))
            return NotFound(new ProblemDetails { Title = "Arquivo não encontrado no servidor", Status = 404 });

        var bytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(bytes, doc.TipoMime, doc.NomeOriginal);
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var doc = await _db.Documents.FindAsync(id);
        if (doc == null) return NotFound();

        var uploadPath = GetUploadPath();
        var filePath = Path.Combine(uploadPath, doc.CaminhoRelativo);

        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);

        _db.Documents.Remove(doc);
        await _db.SaveChangesAsync();

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
        ClienteNome = d.Cliente?.FullName,
        CreatedAt = d.CreatedAt,
        UpdatedAt = d.UpdatedAt
    };
}
