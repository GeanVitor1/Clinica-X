namespace ClinicaX.Application.DTOs;

public record NotificacaoDto(
    Guid Id,
    Guid PacienteId,
    string? PacienteNome,
    Guid? AgendamentoId,
    string Tipo,
    string Mensagem,
    string Status,
    DateTime? EnviadaEm,
    bool Lida,
    DateTime CriadoEm
);
