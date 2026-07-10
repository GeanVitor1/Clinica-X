using ClinicaX.Domain.Entities;

namespace ClinicaX.Application.Interfaces;

public interface IClinicaRepository
{
    Task<Clinica?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Clinica?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<List<Clinica>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(Clinica clinica, CancellationToken ct = default);
    Task UpdateAsync(Clinica clinica, CancellationToken ct = default);
}
