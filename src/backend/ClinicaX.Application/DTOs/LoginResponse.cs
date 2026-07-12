namespace ClinicaX.Application.DTOs;

public record LoginResponse(string Token, string Nome, string Email, bool IsDemo = false, Guid? ClinicaId = null);
