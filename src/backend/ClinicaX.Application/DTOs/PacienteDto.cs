namespace ClinicaX.Application.DTOs;

public record PacienteDto(
    Guid Id,
    Guid ClinicaId,
    string Nome,
    string Cpf,
    string Telefone,
    DateTime? DataNascimento,
    string? Observacoes,
    bool Ativo,
    DateTime CriadoEm,
    DateTime? UltimoAgendamento,
    string? UltimoAgendamentoInfo
);

public record CreatePacienteRequest(
    string Nome,
    string Cpf,
    string Telefone,
    DateTime? DataNascimento,
    string? Observacoes
);

public record UpdatePacienteRequest(
    string Nome,
    string Cpf,
    string Telefone,
    DateTime? DataNascimento,
    string? Observacoes
);
