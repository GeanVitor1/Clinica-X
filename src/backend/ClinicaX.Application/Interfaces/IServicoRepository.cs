using ClinicaX.Domain.Entities;

namespace ClinicaX.Application.Interfaces;

public interface IServicoRepository
{
    Task<Servico?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<Servico>> GetAllAsync(Guid clinicaId, CancellationToken ct = default);
    Task AddAsync(Servico servico, CancellationToken ct = default);
    Task UpdateAsync(Servico servico, CancellationToken ct = default);
    Task DeleteAsync(Servico servico, CancellationToken ct = default);
}
