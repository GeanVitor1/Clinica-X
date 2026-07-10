using ClinicaX.Application.DTOs;
using FluentResults;

namespace ClinicaX.Application.Services;

public interface IDashboardService
{
    Task<Result<DashboardDataDto>> GetDashboardAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Result<List<EventoDto>>> GetTimelineAsync(Guid clinicaId, int take = 30, CancellationToken ct = default);
}
