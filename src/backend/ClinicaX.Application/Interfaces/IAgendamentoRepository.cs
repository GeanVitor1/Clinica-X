using ClinicaX.Domain.Entities;

namespace ClinicaX.Application.Interfaces;

public interface IAgendamentoRepository
{
    Task<Agendamento?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Agendamento?> GetByIdAndClinicaAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task<Agendamento?> GetByTokenConfirmacaoAsync(string token, CancellationToken ct = default);
    Task<List<Agendamento>> GetByClinicaAsync(Guid clinicaId, DateTime? start = null, DateTime? end = null, CancellationToken ct = default);
    Task<List<Agendamento>> GetByPacienteAsync(Guid clinicaId, Guid pacienteId, CancellationToken ct = default);
    Task<Dictionary<Guid, Agendamento>> GetUltimoPorPacientesAsync(IEnumerable<Guid> pacienteIds, CancellationToken ct = default);
    Task<bool> HasConflictAsync(Guid clinicaId, DateTime inicio, DateTime fim, Guid? ignoreId = null, string? profissional = null, string? sala = null, string? equipamento = null, CancellationToken ct = default);
    Task AddAsync(Agendamento agendamento, CancellationToken ct = default);
    Task UpdateAsync(Agendamento agendamento, CancellationToken ct = default);

    // Bloqueios
    Task<List<BloqueioAgenda>> GetBloqueiosAsync(Guid clinicaId, DateTime? start, DateTime? end, CancellationToken ct = default);
    Task<BloqueioAgenda?> GetBloqueioAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task AddBloqueioAsync(BloqueioAgenda bloqueio, CancellationToken ct = default);
    Task DeleteBloqueioAsync(BloqueioAgenda bloqueio, CancellationToken ct = default);
    Task<bool> HasBloqueioAsync(Guid clinicaId, DateTime inicio, DateTime fim, string? profissional = null, string? sala = null, string? equipamento = null, CancellationToken ct = default);
}
