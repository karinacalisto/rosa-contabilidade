using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RosaContabilidade.Api.Data.Repositories;
using RosaContabilidade.Api.DTOs;
using RosaContabilidade.Api.Models;

namespace RosaContabilidade.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentLinksController : ControllerBase
{
    private readonly PaymentLinkRepository _repo;
    private readonly UserManager<ApplicationUser> _userManager;

    public PaymentLinksController(PaymentLinkRepository repo, UserManager<ApplicationUser> userManager)
    {
        _repo = repo;
        _userManager = userManager;
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<ActionResult<List<PaymentLinkDto>>> GetAll([FromQuery] string? clienteId)
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
        var sorted = items.OrderByDescending(p => p.CreatedAt).ToList();
        return Ok(sorted.Select(MapToDto));
    }

    [HttpGet("meus")]
    public async Task<ActionResult<List<PaymentLinkDto>>> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _repo.GetByClienteIdAsync(userId);
        var sorted = items.OrderByDescending(p => p.CreatedAt).ToList();
        return Ok(sorted.Select(MapToDto));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet("{id}")]
    public async Task<ActionResult<PaymentLinkDto>> GetById(string id)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item == null) return NotFound();
        if (string.IsNullOrEmpty(item.ClienteNome))
        {
            var cliente = await _userManager.FindByIdAsync(item.ClienteId);
            item.ClienteNome = cliente?.FullName;
        }
        return Ok(MapToDto(item));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPost]
    public async Task<ActionResult<PaymentLinkDto>> Create([FromBody] PaymentLinkCreateRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var cliente = await _userManager.FindByIdAsync(request.ClienteId);

        var item = new PaymentLink
        {
            Descricao = request.Descricao,
            Url = request.Url,
            Valor = request.Valor,
            Pago = request.Pago,
            ClienteId = request.ClienteId,
            ClienteNome = cliente?.FullName,
            CreatedBy = userId
        };

        await _repo.CreateAsync(item);

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, MapToDto(item));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] PaymentLinkUpdateRequest request)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item == null) return NotFound();

        item.Descricao = request.Descricao;
        item.Url = request.Url;
        item.Valor = request.Valor;
        item.Pago = request.Pago;

        await _repo.UpdateAsync(item);
        return NoContent();
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item == null) return NotFound();

        await _repo.DeleteAsync(id);
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
        ClienteNome = p.ClienteNome,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
