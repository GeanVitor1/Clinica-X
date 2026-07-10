namespace ClinicaX.Application.DTOs;

public record RelatorioFinanceiroDto(
    DateTime DataInicio,
    DateTime DataFim,
    decimal TotalPeriodo,
    List<FaturamentoServicoDto> PorServico
);

public record FaturamentoServicoDto(
    string ServicoNome,
    int Quantidade,
    decimal ValorUnitario,
    decimal Total
);

public record RelatorioOcupacaoDto(
    DateTime DataInicio,
    DateTime DataFim,
    int TotalAgendamentos,
    List<OcupacaoHorarioDto> HorariosPico,
    List<ServicoMaisAgendadoDto> ServicosMaisAgendados
);

public record OcupacaoHorarioDto(
    int Hora,
    int Quantidade
);

public record ServicoMaisAgendadoDto(
    string ServicoNome,
    int Quantidade,
    decimal Percentual
);
