namespace ClinicaX.Application.DTOs;

public record ProntuarioDto(
    Guid Id,
    Guid PacienteId,
    Guid? AgendamentoId,
    DateTime Data,
    string? Descricao,
    string? Diagnostico,
    string? Prescricao,
    List<AnexoDto> Anexos,
    DateTime CriadoEm
);

public record AnexoDto(
    Guid Id,
    string Nome,
    string ContentType,
    long Tamanho
);

public record CreateProntuarioRequest(
    Guid? AgendamentoId,
    DateTime Data,
    string? Descricao,
    string? Diagnostico,
    string? Prescricao
);

public record UpdateProntuarioRequest(
    string? Descricao,
    string? Diagnostico,
    string? Prescricao
);
