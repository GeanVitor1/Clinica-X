using ClinicaX.Application.DTOs;
using FluentResults;

namespace ClinicaX.Application.Services;

public interface IReportService
{
    Task<Result<RelatorioFinanceiroDto>> GetRelatorioFinanceiroAsync(Guid clinicaId, DateTime dataInicio, DateTime dataFim, CancellationToken ct = default);
    Task<Result<RelatorioOcupacaoDto>> GetRelatorioOcupacaoAsync(Guid clinicaId, DateTime dataInicio, DateTime dataFim, CancellationToken ct = default);
}
