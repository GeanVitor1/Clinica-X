using ClinicaX.Domain.Entities;

namespace ClinicaX.Application.DTOs;

public record AgendamentoDto(
    Guid Id,
    Guid ClinicaId,
    Guid PacienteId,
    string PacienteNome,
    Guid ServicoId,
    string ServicoNome,
    DateTime DataHoraInicio,
    DateTime DataHoraFim,
    string Status,
    string? Observacao,
    string? MotivoCancelamento,
    string? Cor,
    DateTime CriadoEm
);

public record CreateAgendamentoRequest(
    Guid PacienteId,
    Guid ServicoId,
    DateTime DataHoraInicio,
    string? Observacao
);

public record RemarcarAgendamentoRequest(
    DateTime DataHoraInicio
);

public record CancelarAgendamentoRequest(
    string MotivoCancelamento
);
