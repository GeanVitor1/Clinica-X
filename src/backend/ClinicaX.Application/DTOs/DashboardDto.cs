namespace ClinicaX.Application.DTOs;

public record DashboardDataDto(
    int ConsultasHoje,
    int Proximos7Dias,
    decimal FaturamentoMes,
    int NotificacoesPendentes,
    List<AgendamentoDto> ConsultasHojeLista,
    List<OcupacaoDto> OcupacaoSemana
);

public record OcupacaoDto(
    string Dia,
    int Total,
    int Realizados
);

public record EventoDto(
    Guid Id,
    string Tipo,
    string Descricao,
    DateTime CriadoEm,
    string? PacienteNome
);
