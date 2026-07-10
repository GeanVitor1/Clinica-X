using ClinicaX.Domain.Entities;

namespace ClinicaX.Application.Interfaces;

public interface IAgendamentoRepository
{
    Task<Agendamento?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<Agendamento>> GetByClinicaAsync(Guid clinicaId, DateTime? start = null, DateTime? end = null, CancellationToken ct = default);
    Task<List<Agendamento>> GetByPacienteAsync(Guid pacienteId, CancellationToken ct = default);
    Task<Dictionary<Guid, Agendamento>> GetUltimoPorPacientesAsync(IEnumerable<Guid> pacienteIds, CancellationToken ct = default);
    Task<bool> HasConflictAsync(Guid clinicaId, DateTime inicio, DateTime fim, Guid? ignoreId = null, CancellationToken ct = default);
    Task AddAsync(Agendamento agendamento, CancellationToken ct = default);
    Task UpdateAsync(Agendamento agendamento, CancellationToken ct = default);
}
