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
public class PaymentLinksController : ControllerBase
{
    private readonly AppDbContext _db;

    public PaymentLinksController(AppDbContext db)
    {
        _db = db;
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<ActionResult<List<PaymentLinkDto>>> GetAll([FromQuery] string? clienteId)
    {
        var query = _db.PaymentLinks.Include(p => p.Cliente).AsQueryable();
        if (!string.IsNullOrEmpty(clienteId))
            query = query.Where(p => p.ClienteId == clienteId);

        var items = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return Ok(items.Select(MapToDto));
    }

    [HttpGet("meus")]
    public async Task<ActionResult<List<PaymentLinkDto>>> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _db.PaymentLinks
            .Where(p => p.ClienteId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
        return Ok(items.Select(MapToDto));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet("{id}")]
    public async Task<ActionResult<PaymentLinkDto>> GetById(int id)
    {
        var item = await _db.PaymentLinks.Include(p => p.Cliente).FirstOrDefaultAsync(p => p.Id == id);
        if (item == null) return NotFound();
        return Ok(MapToDto(item));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPost]
    public async Task<ActionResult<PaymentLinkDto>> Create([FromBody] PaymentLinkCreateRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var item = new PaymentLink
        {
            Descricao = request.Descricao,
            Url = request.Url,
            Valor = request.Valor,
            Pago = request.Pago,
            ClienteId = request.ClienteId,
            CreatedBy = userId
        };

        _db.PaymentLinks.Add(item);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, MapToDto(item));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] PaymentLinkUpdateRequest request)
    {
        var item = await _db.PaymentLinks.FindAsync(id);
        if (item == null) return NotFound();

        item.Descricao = request.Descricao;
        item.Url = request.Url;
        item.Valor = request.Valor;
        item.Pago = request.Pago;
        item.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.PaymentLinks.FindAsync(id);
        if (item == null) return NotFound();

        _db.PaymentLinks.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static PaymentLinkDto MapToDto(PaymentLink p) => new()
    {
        Id = p.Id,
        Descricao = p.Descricao,
        Url = p.Url,
        Valor = p.Valor,
        Pago = p.Pago,
        ClienteId = p.ClienteId,
        ClienteNome = p.Cliente?.FullName,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
