using ClinicaX.Application.DTOs;
using FluentResults;

namespace ClinicaX.Application.Services;

public interface IAgendamentoService
{
    Task<Result<List<AgendamentoDto>>> GetByClinicaAsync(Guid clinicaId, DateTime? start = null, DateTime? end = null, CancellationToken ct = default);
    Task<Result<AgendamentoDto>> CreateAsync(Guid clinicaId, CreateAgendamentoRequest request, CancellationToken ct = default);
    Task<Result<AgendamentoDto>> RemarcarAsync(Guid id, RemarcarAgendamentoRequest request, CancellationToken ct = default);
    Task<Result<AgendamentoDto>> CancelarAsync(Guid id, CancelarAgendamentoRequest request, CancellationToken ct = default);
}
