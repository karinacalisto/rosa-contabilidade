using System.ComponentModel.DataAnnotations;

namespace RosaContabilidade.Api.DTOs;

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;
    [Required, MaxLength(200)]
    public string FullName { get; set; } = string.Empty;
    [MaxLength(20)]
    public string? CpfCnpj { get; set; }
    [MaxLength(500)]
    public string? RegimeObservacoes { get; set; }
    public string Role { get; set; } = "CLIENTE";
}

public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string Role { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}

public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string Token { get; set; } = string.Empty;
    [Required, MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;
    [Required, MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}
