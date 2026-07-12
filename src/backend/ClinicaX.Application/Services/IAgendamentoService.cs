using ClinicaX.Application.DTOs;
using FluentResults;

namespace ClinicaX.Application.Services;

public interface IAgendamentoService
{
    Task<Result<List<AgendamentoDto>>> GetByClinicaAsync(Guid clinicaId, DateTime? start = null, DateTime? end = null, string? profissional = null, string? sala = null, string? status = null, CancellationToken ct = default);
    Task<Result<AgendamentoDto>> GetByIdAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task<Result<AgendamentoDto>> CreateAsync(Guid clinicaId, CreateAgendamentoRequest request, CancellationToken ct = default);
    Task<Result<AgendamentoDto>> RemarcarAsync(Guid clinicaId, Guid id, RemarcarAgendamentoRequest request, CancellationToken ct = default);
    Task<Result<AgendamentoDto>> CancelarAsync(Guid clinicaId, Guid id, CancelarAgendamentoRequest request, CancellationToken ct = default);
    Task<Result<AgendamentoDto>> ConfirmarAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task<Result<AgendamentoDto>> MarcarRealizadoAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task<Result<AgendamentoDto>> MarcarFaltaAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task<Result<ConfirmarPublicoResponse>> ConfirmarPorTokenAsync(string token, CancellationToken ct = default);

    Task<Result<List<BloqueioAgendaDto>>> ListBloqueiosAsync(Guid clinicaId, DateTime? start, DateTime? end, CancellationToken ct = default);
    Task<Result<BloqueioAgendaDto>> CreateBloqueioAsync(Guid clinicaId, CreateBloqueioAgendaRequest request, CancellationToken ct = default);
    Task<Result> DeleteBloqueioAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
}
