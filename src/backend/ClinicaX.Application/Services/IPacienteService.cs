using ClinicaX.Application.DTOs;
using FluentResults;

namespace ClinicaX.Application.Services;

public interface IPacienteService
{
    Task<Result<PacienteDto>> GetByIdAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task<Result<(List<PacienteDto> Items, int Total)>> GetAllAsync(Guid clinicaId, string? search = null, int page = 1, int pageSize = 20, bool? ativo = true, CancellationToken ct = default);
    Task<Result<PacienteDto>> CreateAsync(Guid clinicaId, CreatePacienteRequest request, CancellationToken ct = default);
    Task<Result<PacienteDto>> UpdateAsync(Guid clinicaId, Guid id, UpdatePacienteRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task<Result<PacienteHistoricoDto>> GetHistoricoAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
}
