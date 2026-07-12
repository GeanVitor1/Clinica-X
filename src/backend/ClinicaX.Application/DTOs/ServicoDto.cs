namespace ClinicaX.Application.DTOs;

public record ServicoDto(
    Guid Id,
    Guid ClinicaId,
    string Nome,
    string? Descricao,
    int DuracaoMin,
    decimal Valor,
    string? Cor,
    decimal PercentualComissao,
    bool Ativo,
    DateTime CriadoEm
);

public record CreateServicoRequest(
    string Nome,
    string? Descricao,
    int DuracaoMin,
    decimal Valor,
    string? Cor,
    decimal PercentualComissao = 0
);

public record UpdateServicoRequest(
    string Nome,
    string? Descricao,
    int DuracaoMin,
    decimal Valor,
    string? Cor,
    decimal PercentualComissao = 0
);
