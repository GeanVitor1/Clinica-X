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
    string? Profissional,
    string? Sala,
    string? Equipamento,
    string? TokenConfirmacao,
    DateTime? ConfirmadoEm,
    DateTime? RealizadoEm,
    DateTime CriadoEm
);

public record CreateAgendamentoRequest(
    Guid PacienteId,
    Guid ServicoId,
    DateTime DataHoraInicio,
    string? Observacao,
    string? Profissional,
    string? Sala,
    string? Equipamento
);

public record RemarcarAgendamentoRequest(
    DateTime DataHoraInicio
);

public record CancelarAgendamentoRequest(
    string MotivoCancelamento
);

public record BloqueioAgendaDto(
    Guid Id,
    DateTime DataHoraInicio,
    DateTime DataHoraFim,
    string Motivo,
    string? Profissional,
    string? Sala,
    string? Equipamento
);

public record CreateBloqueioAgendaRequest(
    DateTime DataHoraInicio,
    DateTime DataHoraFim,
    string Motivo,
    string? Profissional,
    string? Sala,
    string? Equipamento
);

public record ConfirmarPublicoResponse(
    bool Sucesso,
    string Mensagem,
    string? PacienteNome,
    DateTime? DataHora
);
