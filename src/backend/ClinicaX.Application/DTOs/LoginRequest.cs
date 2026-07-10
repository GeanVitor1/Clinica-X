namespace ClinicaX.Application.DTOs;

public record LoginRequest(string Email, string Senha);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Email, string Token, string NovaSenha);

public record ForgotPasswordResponse(string Message, string? ResetToken, string? ResetUrl);
