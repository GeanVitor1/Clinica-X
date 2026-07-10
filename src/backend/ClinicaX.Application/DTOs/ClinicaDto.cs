namespace ClinicaX.Application.DTOs;

public record ClinicaDto(
    Guid Id,
    string Nome,
    string Email,
    string Telefone,
    string Endereco,
    string Plano,
    TimeSpan HorarioAbertura,
    TimeSpan HorarioFechamento,
    string DiasFuncionamento,
    DateTime CriadoEm
);

public record UpdateClinicaRequest(
    string Nome,
    string Email,
    string Telefone,
    string Endereco,
    string Plano,
    TimeSpan HorarioAbertura,
    TimeSpan HorarioFechamento,
    string DiasFuncionamento
);

public record ChangePasswordRequest(
    string SenhaAtual,
    string NovaSenha
);
