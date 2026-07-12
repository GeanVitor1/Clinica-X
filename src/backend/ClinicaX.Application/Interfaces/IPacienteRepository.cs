using ClinicaX.Domain.Entities;

namespace ClinicaX.Application.Interfaces;

public interface IPacienteRepository
{
    Task<Paciente?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Paciente?> GetByIdAndClinicaAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task<List<Paciente>> GetAllAsync(Guid clinicaId, string? search = null, int page = 1, int pageSize = 20, bool? ativo = true, CancellationToken ct = default);
    Task<int> CountAsync(Guid clinicaId, string? search = null, bool? ativo = true, CancellationToken ct = default);
    Task AddAsync(Paciente paciente, CancellationToken ct = default);
    Task UpdateAsync(Paciente paciente, CancellationToken ct = default);
    Task DeleteAsync(Paciente paciente, CancellationToken ct = default);
}
