using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RosaContabilidade.Api.Data.Repositories;
using RosaContabilidade.Api.DTOs;
using RosaContabilidade.Api.Models;

namespace RosaContabilidade.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeadsController : ControllerBase
{
    private readonly LeadRepository _repo;

    public LeadsController(LeadRepository repo)
    {
        _repo = repo;
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

        await _repo.CreateAsync(lead);

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

        await _repo.CreateAsync(lead);

        return CreatedAtAction(nameof(GetById), new { id = lead.Id }, MapToDto(lead));
    }

    /// <summary>
    /// Listar todos os leads (admin)
    /// </summary>
    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<ActionResult<List<LeadDto>>> GetAll([FromQuery] string? origem)
    {
        var leads = await _repo.GetAllAsync(origem);
        var sorted = leads.OrderByDescending(l => l.CreatedAt).ToList();
        return Ok(sorted.Select(MapToDto));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet("{id}")]
    public async Task<ActionResult<LeadDto>> GetById(string id)
    {
        var lead = await _repo.GetByIdAsync(id);
        if (lead == null) return NotFound();
        return Ok(MapToDto(lead));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var lead = await _repo.GetByIdAsync(id);
        if (lead == null) return NotFound();

        await _repo.DeleteAsync(id);
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
