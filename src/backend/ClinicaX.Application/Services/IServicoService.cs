using ClinicaX.Application.DTOs;
using FluentResults;

namespace ClinicaX.Application.Services;

public interface IServicoService
{
    Task<Result<List<ServicoDto>>> GetAllAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Result<ServicoDto>> CreateAsync(Guid clinicaId, CreateServicoRequest request, CancellationToken ct = default);
    Task<Result<ServicoDto>> UpdateAsync(Guid clinicaId, Guid id, UpdateServicoRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
}
