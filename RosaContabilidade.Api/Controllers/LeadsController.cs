using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RosaContabilidade.Api.Data;
using RosaContabilidade.Api.DTOs;
using RosaContabilidade.Api.Models;

namespace RosaContabilidade.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeadsController : ControllerBase
{
    private readonly AppDbContext _db;

    public LeadsController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Criar lead via formulário de contato (público)
    /// </summary>
    [HttpPost("contato")]
    public async Task<ActionResult<LeadDto>> CriarContato([FromBody] LeadCreateRequest request)
    {
        var lead = new Lead
        {
            Nome = request.Nome,
            Email = request.Email,
            Telefone = request.Telefone,
            Mensagem = request.Mensagem,
            Origem = "contato"
        };

        _db.Leads.Add(lead);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = lead.Id }, MapToDto(lead));
    }

    /// <summary>
    /// Criar lead via calculadora (público)
    /// </summary>
    [HttpPost("calculadora")]
    public async Task<ActionResult<LeadDto>> CriarCalculadora([FromBody] LeadCalculadoraRequest request)
    {
        var lead = new Lead
        {
            Nome = request.Nome,
            Email = request.Email,
            Telefone = request.Telefone,
            Origem = "calculadora",
            TipoPessoa = request.TipoPessoa,
            ReceitaMensal = request.ReceitaMensal,
            DespesasDedutiveis = request.DespesasDedutiveis,
            AliquotaEstimada = request.AliquotaEstimada,
            OpcaoRegime = request.OpcaoRegime,
            ImpostoEstimado = request.ImpostoEstimado,
            PercentualEfetivo = request.PercentualEfetivo
        };

        _db.Leads.Add(lead);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = lead.Id }, MapToDto(lead));
    }

    /// <summary>
    /// Listar todos os leads (admin)
    /// </summary>
    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<ActionResult<List<LeadDto>>> GetAll([FromQuery] string? origem)
    {
        var query = _db.Leads.AsQueryable();
        if (!string.IsNullOrEmpty(origem))
            query = query.Where(l => l.Origem == origem);

        var leads = await query.OrderByDescending(l => l.CreatedAt).ToListAsync();
        return Ok(leads.Select(MapToDto));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet("{id}")]
    public async Task<ActionResult<LeadDto>> GetById(int id)
    {
        var lead = await _db.Leads.FindAsync(id);
        if (lead == null) return NotFound();
        return Ok(MapToDto(lead));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var lead = await _db.Leads.FindAsync(id);
        if (lead == null) return NotFound();

        _db.Leads.Remove(lead);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static LeadDto MapToDto(Lead lead) => new()
    {
        Id = lead.Id,
        Nome = lead.Nome,
        Email = lead.Email,
        Telefone = lead.Telefone,
        Mensagem = lead.Mensagem,
        Origem = lead.Origem,
        TipoPessoa = lead.TipoPessoa,
        ReceitaMensal = lead.ReceitaMensal,
        DespesasDedutiveis = lead.DespesasDedutiveis,
        AliquotaEstimada = lead.AliquotaEstimada,
        OpcaoRegime = lead.OpcaoRegime,
        ImpostoEstimado = lead.ImpostoEstimado,
        PercentualEfetivo = lead.PercentualEfetivo,
        CreatedAt = lead.CreatedAt
    };
}
