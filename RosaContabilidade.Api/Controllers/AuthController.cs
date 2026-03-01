using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RosaContabilidade.Api.DTOs;
using RosaContabilidade.Api.Models;
using RosaContabilidade.Api.Services;

namespace RosaContabilidade.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly TokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        TokenService tokenService,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Unauthorized(new ProblemDetails { Title = "Credenciais inválidas", Status = 401 });

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
                return StatusCode(429, new ProblemDetails { Title = "Conta bloqueada temporariamente. Tente novamente em alguns minutos.", Status = 429 });
            return Unauthorized(new ProblemDetails { Title = "Credenciais inválidas", Status = 401 });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        _logger.LogInformation("Usuário {Email} logou com sucesso", user.Email);

        return Ok(new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            Role = roles.FirstOrDefault() ?? "",
            UserId = user.Id,
            FullName = user.FullName
        });
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<TokenResponse>> Refresh([FromBody] RefreshTokenRequest request)
    {
        var user = _userManager.Users.FirstOrDefault(u => u.RefreshToken == request.RefreshToken);
        if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
            return Unauthorized(new ProblemDetails { Title = "Refresh token inválido ou expirado", Status = 401 });

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return Ok(new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            Role = roles.FirstOrDefault() ?? "",
            UserId = user.Id,
            FullName = user.FullName
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Ok(new { message = "Se o e-mail existir, um token de redefinição será gerado." });

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        _logger.LogWarning("DEV: Token de reset para {Email}: {Token}", request.Email, token);

        return Ok(new { message = "Se o e-mail existir, um token de redefinição será gerado.", devToken = token });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return BadRequest(new ProblemDetails { Title = "Usuário não encontrado", Status = 400 });

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new ProblemDetails
            {
                Title = "Erro ao redefinir senha",
                Detail = string.Join("; ", result.Errors.Select(e => e.Description)),
                Status = 400
            });

        return Ok(new { message = "Senha redefinida com sucesso." });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user == null) return NotFound();

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new ProblemDetails
            {
                Title = "Erro ao alterar senha",
                Detail = string.Join("; ", result.Errors.Select(e => e.Description)),
                Status = 400
            });

        return Ok(new { message = "Senha alterada com sucesso." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ClientDto>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user == null) return NotFound();

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new ClientDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            CpfCnpj = user.CpfCnpj,
            RegimeObservacoes = user.RegimeObservacoes,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt
        });
    }
}
