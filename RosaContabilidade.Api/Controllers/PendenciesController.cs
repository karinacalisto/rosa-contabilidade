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
public class PendenciesController : ControllerBase
{
    private readonly PendencyRepository _repo;
    private readonly UserManager<ApplicationUser> _userManager;

    public PendenciesController(PendencyRepository repo, UserManager<ApplicationUser> userManager)
    {
        _repo = repo;
        _userManager = userManager;
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<ActionResult<List<PendencyDto>>> GetAll([FromQuery] string? clienteId)
    {
        var items = await _repo.GetAllAsync(clienteId);
        // Enrich with client name
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

    [HttpGet("minhas")]
    public async Task<ActionResult<List<PendencyDto>>> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _repo.GetByClienteIdAsync(userId);
        var sorted = items.OrderByDescending(p => p.CreatedAt).ToList();
        return Ok(sorted.Select(MapToDto));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet("{id}")]
    public async Task<ActionResult<PendencyDto>> GetById(string id)
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
    public async Task<ActionResult<PendencyDto>> Create([FromBody] PendencyCreateRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var cliente = await _userManager.FindByIdAsync(request.ClienteId);

        var item = new Pendency
        {
            Descricao = request.Descricao,
            Resolvida = request.Resolvida,
            DataLimite = request.DataLimite,
            ClienteId = request.ClienteId,
            ClienteNome = cliente?.FullName,
            CreatedBy = userId
        };

        await _repo.CreateAsync(item);

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, MapToDto(item));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] PendencyUpdateRequest request)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item == null) return NotFound();

        item.Descricao = request.Descricao;
        item.Resolvida = request.Resolvida;
        item.DataLimite = request.DataLimite;

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

    private static PendencyDto MapToDto(Pendency p) => new()
    {
        Id = p.Id,
        Descricao = p.Descricao,
        Resolvida = p.Resolvida,
        DataLimite = p.DataLimite,
        ClienteId = p.ClienteId,
        ClienteNome = p.ClienteNome,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
