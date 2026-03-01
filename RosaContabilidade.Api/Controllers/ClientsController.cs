using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RosaContabilidade.Api.Data;
using RosaContabilidade.Api.DTOs;
using RosaContabilidade.Api.Models;

namespace RosaContabilidade.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _db;
    private readonly ILogger<ClientsController> _logger;

    public ClientsController(UserManager<ApplicationUser> userManager, AppDbContext db, ILogger<ClientsController> logger)
    {
        _userManager = userManager;
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Listar todos os clientes (admin)
    /// </summary>
    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<ActionResult<List<ClientDto>>> GetAll()
    {
        var clientRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "CLIENTE");
        if (clientRole == null) return Ok(new List<ClientDto>());

        var clientUserIds = await _db.UserRoles
            .Where(ur => ur.RoleId == clientRole.Id)
            .Select(ur => ur.UserId)
            .ToListAsync();

        var clients = await _db.Users
            .Where(u => clientUserIds.Contains(u.Id))
            .Select(u => new ClientDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email!,
                CpfCnpj = u.CpfCnpj,
                RegimeObservacoes = u.RegimeObservacoes,
                PhoneNumber = u.PhoneNumber,
                CreatedAt = u.CreatedAt,
                PendenciasCount = u.Pendencies.Count,
                DocumentosCount = u.Documents.Count,
                PagamentosCount = u.PaymentLinks.Count
            })
            .OrderBy(c => c.FullName)
            .ToListAsync();

        return Ok(clients);
    }

    /// <summary>
    /// Obter um cliente por ID (admin)
    /// </summary>
    [Authorize(Roles = "ADMIN")]
    [HttpGet("{id}")]
    public async Task<ActionResult<ClientDto>> GetById(string id)
    {
        var user = await _db.Users
            .Include(u => u.Pendencies)
            .Include(u => u.PaymentLinks)
            .Include(u => u.Documents)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound();

        return Ok(new ClientDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            CpfCnpj = user.CpfCnpj,
            RegimeObservacoes = user.RegimeObservacoes,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt,
            PendenciasCount = user.Pendencies.Count,
            DocumentosCount = user.Documents.Count,
            PagamentosCount = user.PaymentLinks.Count
        });
    }

    /// <summary>
    /// Criar novo cliente (admin)
    /// </summary>
    [Authorize(Roles = "ADMIN")]
    [HttpPost]
    public async Task<ActionResult<ClientDto>> Create([FromBody] RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return Conflict(new ProblemDetails { Title = "E-mail já cadastrado", Status = 409 });

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            CpfCnpj = request.CpfCnpj,
            RegimeObservacoes = request.RegimeObservacoes,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new ProblemDetails
            {
                Title = "Erro ao criar cliente",
                Detail = string.Join("; ", result.Errors.Select(e => e.Description)),
                Status = 400
            });

        await _userManager.AddToRoleAsync(user, "CLIENTE");

        _logger.LogInformation("Cliente criado: {Email} por admin", request.Email);

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, new ClientDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            CpfCnpj = user.CpfCnpj,
            RegimeObservacoes = user.RegimeObservacoes,
            CreatedAt = user.CreatedAt
        });
    }

    /// <summary>
    /// Atualizar cliente (admin ou o próprio cliente)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] ClientUpdateRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("ADMIN");

        if (!isAdmin && currentUserId != id)
            return Forbid();

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        user.FullName = request.FullName;
        user.CpfCnpj = request.CpfCnpj;
        user.RegimeObservacoes = request.RegimeObservacoes;
        user.PhoneNumber = request.PhoneNumber;
        user.UpdatedAt = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);
        return NoContent();
    }

    /// <summary>
    /// Excluir cliente (admin)
    /// </summary>
    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        await _userManager.DeleteAsync(user);
        _logger.LogInformation("Cliente excluído: {Email}", user.Email);
        return NoContent();
    }

    /// <summary>
    /// Dashboard do cliente logado
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<ClientDashboardDto>> Dashboard()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _db.Users
            .Include(u => u.Pendencies.OrderByDescending(p => p.CreatedAt))
            .Include(u => u.PaymentLinks.OrderByDescending(p => p.CreatedAt))
            .Include(u => u.Documents.OrderByDescending(d => d.CreatedAt))
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound();

        return Ok(new ClientDashboardDto
        {
            FullName = user.FullName,
            Email = user.Email!,
            CpfCnpj = user.CpfCnpj,
            RegimeObservacoes = user.RegimeObservacoes,
            Pendencias = user.Pendencies.Select(p => new PendencyDto
            {
                Id = p.Id,
                Descricao = p.Descricao,
                Resolvida = p.Resolvida,
                DataLimite = p.DataLimite,
                ClienteId = p.ClienteId,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList(),
            LinksPagamento = user.PaymentLinks.Select(p => new PaymentLinkDto
            {
                Id = p.Id,
                Descricao = p.Descricao,
                Url = p.Url,
                Valor = p.Valor,
                Pago = p.Pago,
                ClienteId = p.ClienteId,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList(),
            Documentos = user.Documents.Select(d => new DocumentDto
            {
                Id = d.Id,
                NomeOriginal = d.NomeOriginal,
                TipoMime = d.TipoMime,
                TamanhoBytes = d.TamanhoBytes,
                Descricao = d.Descricao,
                ClienteId = d.ClienteId,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            }).ToList()
        });
    }
}
