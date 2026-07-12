using ClinicaX.Domain.Entities;

namespace ClinicaX.Application.Interfaces;

public interface IEventoRepository
{
    Task AddAsync(Evento evento, CancellationToken ct = default);
    Task<List<Evento>> GetByClinicaAsync(Guid clinicaId, int take = 30, CancellationToken ct = default);
    Task<List<Evento>> GetByPacienteAsync(Guid pacienteId, CancellationToken ct = default);
    Task<List<Evento>> GetByPacienteAndClinicaAsync(Guid clinicaId, Guid pacienteId, CancellationToken ct = default);
}
