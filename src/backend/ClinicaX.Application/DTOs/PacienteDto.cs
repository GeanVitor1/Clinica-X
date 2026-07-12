namespace ClinicaX.Application.DTOs;

public record PacienteDto(
    Guid Id,
    Guid ClinicaId,
    string Nome,
    string Cpf,
    string Telefone,
    string? Email,
    DateTime? DataNascimento,
    string? Observacoes,
    string? Convenio,
    string? NumeroCarteirinha,
    string? Endereco,
    string? ContatoEmergencia,
    string? TelefoneEmergencia,
    bool Ativo,
    DateTime CriadoEm,
    DateTime? UltimoAgendamento,
    string? UltimoAgendamentoInfo
);

public record CreatePacienteRequest(
    string Nome,
    string Cpf,
    string Telefone,
    string? Email,
    DateTime? DataNascimento,
    string? Observacoes,
    string? Convenio,
    string? NumeroCarteirinha,
    string? Endereco,
    string? ContatoEmergencia,
    string? TelefoneEmergencia
);

public record UpdatePacienteRequest(
    string Nome,
    string Cpf,
    string Telefone,
    string? Email,
    DateTime? DataNascimento,
    string? Observacoes,
    string? Convenio,
    string? NumeroCarteirinha,
    string? Endereco,
    string? ContatoEmergencia,
    string? TelefoneEmergencia,
    bool Ativo
);

public record PacienteHistoricoDto(
    PacienteDto Paciente,
    List<AgendamentoResumoDto> Agendamentos,
    List<EventoResumoDto> Eventos
);

public record AgendamentoResumoDto(
    Guid Id,
    DateTime DataHoraInicio,
    DateTime DataHoraFim,
    string Status,
    string ServicoNome,
    string? Profissional
);

public record EventoResumoDto(
    Guid Id,
    string Tipo,
    string Descricao,
    DateTime CriadoEm
);
