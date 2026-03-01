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
public class PendenciesController : ControllerBase
{
    private readonly AppDbContext _db;

    public PendenciesController(AppDbContext db)
    {
        _db = db;
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<ActionResult<List<PendencyDto>>> GetAll([FromQuery] string? clienteId)
    {
        var query = _db.Pendencies.Include(p => p.Cliente).AsQueryable();
        if (!string.IsNullOrEmpty(clienteId))
            query = query.Where(p => p.ClienteId == clienteId);

        var items = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return Ok(items.Select(MapToDto));
    }

    [HttpGet("minhas")]
    public async Task<ActionResult<List<PendencyDto>>> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _db.Pendencies
            .Where(p => p.ClienteId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
        return Ok(items.Select(MapToDto));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet("{id}")]
    public async Task<ActionResult<PendencyDto>> GetById(int id)
    {
        var item = await _db.Pendencies.Include(p => p.Cliente).FirstOrDefaultAsync(p => p.Id == id);
        if (item == null) return NotFound();
        return Ok(MapToDto(item));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPost]
    public async Task<ActionResult<PendencyDto>> Create([FromBody] PendencyCreateRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var item = new Pendency
        {
            Descricao = request.Descricao,
            Resolvida = request.Resolvida,
            DataLimite = request.DataLimite,
            ClienteId = request.ClienteId,
            CreatedBy = userId
        };

        _db.Pendencies.Add(item);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, MapToDto(item));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] PendencyUpdateRequest request)
    {
        var item = await _db.Pendencies.FindAsync(id);
        if (item == null) return NotFound();

        item.Descricao = request.Descricao;
        item.Resolvida = request.Resolvida;
        item.DataLimite = request.DataLimite;
        item.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.Pendencies.FindAsync(id);
        if (item == null) return NotFound();

        _db.Pendencies.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static PendencyDto MapToDto(Pendency p) => new()
    {
        Id = p.Id,
        Descricao = p.Descricao,
        Resolvida = p.Resolvida,
        DataLimite = p.DataLimite,
        ClienteId = p.ClienteId,
        ClienteNome = p.Cliente?.FullName,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
