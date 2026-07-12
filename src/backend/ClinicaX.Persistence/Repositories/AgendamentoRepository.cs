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
        => await _context.Set<Agendamento>().FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task<Agendamento?> GetByIdAndClinicaAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => await _context.Set<Agendamento>().FirstOrDefaultAsync(a => a.Id == id && a.ClinicaId == clinicaId, ct);

    public async Task<Agendamento?> GetByTokenConfirmacaoAsync(string token, CancellationToken ct = default)
        => await _context.Set<Agendamento>().FirstOrDefaultAsync(a => a.TokenConfirmacao == token, ct);

    public async Task<List<Agendamento>> GetByClinicaAsync(Guid clinicaId, DateTime? start = null, DateTime? end = null, CancellationToken ct = default)
    {
        var query = _context.Set<Agendamento>().Where(a => a.ClinicaId == clinicaId && a.Ativo);
        if (start.HasValue) query = query.Where(a => a.DataHoraInicio >= start.Value);
        if (end.HasValue) query = query.Where(a => a.DataHoraInicio <= end.Value);
        return await query.OrderBy(a => a.DataHoraInicio).ToListAsync(ct);
    }

    public async Task<List<Agendamento>> GetByPacienteAsync(Guid clinicaId, Guid pacienteId, CancellationToken ct = default)
        => await _context.Set<Agendamento>()
            .Where(a => a.ClinicaId == clinicaId && a.PacienteId == pacienteId && a.Ativo)
            .OrderByDescending(a => a.DataHoraInicio)
            .ToListAsync(ct);

    public async Task<Dictionary<Guid, Agendamento>> GetUltimoPorPacientesAsync(IEnumerable<Guid> pacienteIds, CancellationToken ct = default)
    {
        var ids = pacienteIds.Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<Guid, Agendamento>();

        var list = await _context.Set<Agendamento>()
            .AsNoTracking()
            .Where(a => ids.Contains(a.PacienteId) && a.Status != AgendamentoStatus.Cancelado && a.Ativo)
            .OrderByDescending(a => a.DataHoraInicio)
            .ToListAsync(ct);

        return list
            .GroupBy(a => a.PacienteId)
            .ToDictionary(g => g.Key, g => g.First());
    }

    public async Task<bool> HasConflictAsync(
        Guid clinicaId,
        DateTime inicio,
        DateTime fim,
        Guid? ignoreId = null,
        string? profissional = null,
        string? sala = null,
        string? equipamento = null,
        CancellationToken ct = default)
    {
        var query = _context.Set<Agendamento>()
            .Where(a => a.ClinicaId == clinicaId
                        && a.Ativo
                        && a.Status != AgendamentoStatus.Cancelado
                        && a.Status != AgendamentoStatus.Falta
                        && a.DataHoraInicio < fim
                        && a.DataHoraFim > inicio);

        if (ignoreId.HasValue)
            query = query.Where(a => a.Id != ignoreId.Value);

        var hasProf = !string.IsNullOrWhiteSpace(profissional);
        var hasSala = !string.IsNullOrWhiteSpace(sala);
        var hasEquip = !string.IsNullOrWhiteSpace(equipamento);

        // Sem recurso informado: calendário único — qualquer sobreposição conflita
        if (!hasProf && !hasSala && !hasEquip)
            return await query.AnyAsync(ct);

        // Conflito se mesmo profissional OU mesma sala OU mesmo equipamento,
        // ou se o existente ocupa slot global (sem recursos)
        return await query.AnyAsync(a =>
            (a.Profissional == null && a.Sala == null && a.Equipamento == null)
            || (hasProf && a.Profissional == profissional)
            || (hasSala && a.Sala == sala)
            || (hasEquip && a.Equipamento == equipamento), ct);
    }

    public async Task AddAsync(Agendamento agendamento, CancellationToken ct = default)
        => await _context.Set<Agendamento>().AddAsync(agendamento, ct);

    public Task UpdateAsync(Agendamento agendamento, CancellationToken ct = default)
    {
        _context.Set<Agendamento>().Update(agendamento);
        return Task.CompletedTask;
    }

    public async Task<List<BloqueioAgenda>> GetBloqueiosAsync(Guid clinicaId, DateTime? start, DateTime? end, CancellationToken ct = default)
    {
        var q = _context.Set<BloqueioAgenda>().Where(b => b.ClinicaId == clinicaId && b.Ativo);
        if (start.HasValue) q = q.Where(b => b.DataHoraFim >= start.Value);
        if (end.HasValue) q = q.Where(b => b.DataHoraInicio <= end.Value);
        return await q.OrderBy(b => b.DataHoraInicio).ToListAsync(ct);
    }

    public async Task<BloqueioAgenda?> GetBloqueioAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => await _context.Set<BloqueioAgenda>().FirstOrDefaultAsync(b => b.Id == id && b.ClinicaId == clinicaId && b.Ativo, ct);

    public async Task AddBloqueioAsync(BloqueioAgenda bloqueio, CancellationToken ct = default)
        => await _context.Set<BloqueioAgenda>().AddAsync(bloqueio, ct);

    public Task DeleteBloqueioAsync(BloqueioAgenda bloqueio, CancellationToken ct = default)
    {
        bloqueio.Ativo = false;
        _context.Set<BloqueioAgenda>().Update(bloqueio);
        return Task.CompletedTask;
    }

    public async Task<bool> HasBloqueioAsync(
        Guid clinicaId,
        DateTime inicio,
        DateTime fim,
        string? profissional = null,
        string? sala = null,
        string? equipamento = null,
        CancellationToken ct = default)
    {
        var q = _context.Set<BloqueioAgenda>()
            .Where(b => b.ClinicaId == clinicaId && b.Ativo && b.DataHoraInicio < fim && b.DataHoraFim > inicio);

        // Bloqueio geral (sem recurso) afeta todos; bloqueio com recurso só se bater
        return await q.AnyAsync(b =>
            (b.Profissional == null && b.Sala == null && b.Equipamento == null)
            || (!string.IsNullOrWhiteSpace(profissional) && b.Profissional == profissional)
            || (!string.IsNullOrWhiteSpace(sala) && b.Sala == sala)
            || (!string.IsNullOrWhiteSpace(equipamento) && b.Equipamento == equipamento), ct);
    }
}
