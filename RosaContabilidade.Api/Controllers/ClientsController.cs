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
public class ClientsController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly PendencyRepository _pendencyRepo;
    private readonly PaymentLinkRepository _paymentLinkRepo;
    private readonly DocumentRepository _documentRepo;
    private readonly ILogger<ClientsController> _logger;

    public ClientsController(
        UserManager<ApplicationUser> userManager,
        PendencyRepository pendencyRepo,
        PaymentLinkRepository paymentLinkRepo,
        DocumentRepository documentRepo,
        ILogger<ClientsController> logger)
    {
        _userManager = userManager;
        _pendencyRepo = pendencyRepo;
        _paymentLinkRepo = paymentLinkRepo;
        _documentRepo = documentRepo;
        _logger = logger;
    }

    /// <summary>
    /// Listar todos os clientes (admin)
    /// </summary>
    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<ActionResult<List<ClientDto>>> GetAll()
    {
        var allUsers = await _userManager.GetUsersInRoleAsync("CLIENTE");
        var clients = new List<ClientDto>();

        foreach (var u in allUsers.OrderBy(u => u.FullName))
        {
            var pendencies = await _pendencyRepo.GetByClienteIdAsync(u.Id);
            var documents = await _documentRepo.GetByClienteIdAsync(u.Id);
            var payments = await _paymentLinkRepo.GetByClienteIdAsync(u.Id);

            clients.Add(new ClientDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                CpfCnpj = u.CpfCnpj,
                RegimeObservacoes = u.RegimeObservacoes,
                PhoneNumber = u.PhoneNumber,
                CreatedAt = u.CreatedAt,
                PendenciasCount = pendencies.Count,
                DocumentosCount = documents.Count,
                PagamentosCount = payments.Count
            });
        }

        return Ok(clients);
    }

    /// <summary>
    /// Obter um cliente por ID (admin)
    /// </summary>
    [Authorize(Roles = "ADMIN")]
    [HttpGet("{id}")]
    public async Task<ActionResult<ClientDto>> GetById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        var pendencies = await _pendencyRepo.GetByClienteIdAsync(id);
        var documents = await _documentRepo.GetByClienteIdAsync(id);
        var payments = await _paymentLinkRepo.GetByClienteIdAsync(id);

        return Ok(new ClientDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            CpfCnpj = user.CpfCnpj,
            RegimeObservacoes = user.RegimeObservacoes,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt,
            PendenciasCount = pendencies.Count,
            DocumentosCount = documents.Count,
            PagamentosCount = payments.Count
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
        await _userManager.UpdateAsync(user);

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
        var user = await _userManager.FindByIdAsync(userId!);
        if (user == null) return NotFound();

        var pendencies = await _pendencyRepo.GetByClienteIdAsync(userId!);
        var payments = await _paymentLinkRepo.GetByClienteIdAsync(userId!);
        var documents = await _documentRepo.GetByClienteIdAsync(userId!);

        return Ok(new ClientDashboardDto
        {
            FullName = user.FullName,
            Email = user.Email,
            CpfCnpj = user.CpfCnpj,
            RegimeObservacoes = user.RegimeObservacoes,
            Pendencias = pendencies.OrderByDescending(p => p.CreatedAt).Select(p => new PendencyDto
            {
                Id = p.Id,
                Descricao = p.Descricao,
                Resolvida = p.Resolvida,
                DataLimite = p.DataLimite,
                ClienteId = p.ClienteId,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList(),
            LinksPagamento = payments.OrderByDescending(p => p.CreatedAt).Select(p => new PaymentLinkDto
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
            Documentos = documents.OrderByDescending(d => d.CreatedAt).Select(d => new DocumentDto
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
