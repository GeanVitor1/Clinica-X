namespace ClinicaX.Application.DTOs;

public record ProntuarioDto(
    Guid Id,
    Guid ClinicaId,
    Guid PacienteId,
    Guid? AgendamentoId,
    DateTime Data,
    string? Descricao,
    string? Diagnostico,
    string? Prescricao,
    string? Evolucao,
    string? Especialidade,
    List<AnexoDto> Anexos,
    DateTime CriadoEm,
    DateTime? AtualizadoEm
);

public record AnexoDto(
    Guid Id,
    string Nome,
    string ContentType,
    long Tamanho,
    bool IsImage
);

public record CreateProntuarioRequest(
    Guid? AgendamentoId,
    DateTime Data,
    string? Descricao,
    string? Diagnostico,
    string? Prescricao,
    string? Evolucao,
    string? Especialidade
);

public record UpdateProntuarioRequest(
    string? Descricao,
    string? Diagnostico,
    string? Prescricao,
    string? Evolucao,
    string? Especialidade
);
