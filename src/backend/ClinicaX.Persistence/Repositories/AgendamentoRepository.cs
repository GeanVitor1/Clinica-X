using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using ClinicaX.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicaX.Persistence.Repositories;

public class AgendamentoRepository : IAgendamentoRepository
{
    private readonly ClinicaXDbContext _context;

    public AgendamentoRepository(ClinicaXDbContext context) => _context = context;

    public async Task<Agendamento?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Set<Agendamento>().FindAsync(new object[] { id }, ct);

    public async Task<List<Agendamento>> GetByClinicaAsync(Guid clinicaId, DateTime? start = null, DateTime? end = null, CancellationToken ct = default)
    {
        var query = _context.Set<Agendamento>().Where(a => a.ClinicaId == clinicaId);
        if (start.HasValue) query = query.Where(a => a.DataHoraInicio >= start.Value);
        if (end.HasValue) query = query.Where(a => a.DataHoraInicio <= end.Value);
        return await query.OrderBy(a => a.DataHoraInicio).ToListAsync(ct);
    }

    public async Task<List<Agendamento>> GetByPacienteAsync(Guid pacienteId, CancellationToken ct = default)
        => await _context.Set<Agendamento>().Where(a => a.PacienteId == pacienteId).OrderByDescending(a => a.DataHoraInicio).ToListAsync(ct);

    public async Task<Dictionary<Guid, Agendamento>> GetUltimoPorPacientesAsync(IEnumerable<Guid> pacienteIds, CancellationToken ct = default)
    {
        var ids = pacienteIds.Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<Guid, Agendamento>();

        var list = await _context.Set<Agendamento>()
            .Where(a => ids.Contains(a.PacienteId) && a.Status != AgendamentoStatus.Cancelado)
            .OrderByDescending(a => a.DataHoraInicio)
            .ToListAsync(ct);

        return list
            .GroupBy(a => a.PacienteId)
            .ToDictionary(g => g.Key, g => g.First());
    }

    public async Task<bool> HasConflictAsync(Guid clinicaId, DateTime inicio, DateTime fim, Guid? ignoreId = null, CancellationToken ct = default)
    {
        var query = _context.Set<Agendamento>()
            .Where(a => a.ClinicaId == clinicaId && a.Status != AgendamentoStatus.Cancelado && a.DataHoraInicio < fim && a.DataHoraFim > inicio);
        if (ignoreId.HasValue)
            query = query.Where(a => a.Id != ignoreId.Value);
        return await query.AnyAsync(ct);
    }

    public async Task AddAsync(Agendamento agendamento, CancellationToken ct = default) => await _context.Set<Agendamento>().AddAsync(agendamento, ct);
    public Task UpdateAsync(Agendamento agendamento, CancellationToken ct = default) { _context.Set<Agendamento>().Update(agendamento); return Task.CompletedTask; }
}
