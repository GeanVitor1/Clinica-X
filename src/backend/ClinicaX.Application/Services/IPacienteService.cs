using ClinicaX.Application.DTOs;
using FluentResults;

namespace ClinicaX.Application.Services;

public interface IPacienteService
{
    Task<Result<PacienteDto>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<(List<PacienteDto> Items, int Total)>> GetAllAsync(Guid clinicaId, string? search = null, int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task<Result<PacienteDto>> CreateAsync(Guid clinicaId, CreatePacienteRequest request, CancellationToken ct = default);
    Task<Result<PacienteDto>> UpdateAsync(Guid id, UpdatePacienteRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
}
