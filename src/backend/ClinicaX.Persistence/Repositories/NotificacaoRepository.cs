using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using ClinicaX.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicaX.Persistence.Repositories;

public class NotificacaoRepository : INotificacaoRepository
{
    private readonly ClinicaXDbContext _context;

    public NotificacaoRepository(ClinicaXDbContext context) => _context = context;

    public async Task<List<Notificacao>> GetByClinicaAsync(Guid clinicaId, int take = 20, CancellationToken ct = default)
        => await _context.Set<Notificacao>().Where(n => n.ClinicaId == clinicaId).OrderByDescending(n => n.CriadoEm).Take(take).ToListAsync(ct);

    public async Task<List<Notificacao>> GetByPacienteAsync(Guid pacienteId, CancellationToken ct = default)
        => await _context.Set<Notificacao>().Where(n => n.PacienteId == pacienteId).OrderByDescending(n => n.CriadoEm).ToListAsync(ct);

    public async Task AddAsync(Notificacao notificacao, CancellationToken ct = default) => await _context.Set<Notificacao>().AddAsync(notificacao, ct);

    public async Task<int> CountPendentesAsync(Guid clinicaId, CancellationToken ct = default)
        => await _context.Set<Notificacao>().CountAsync(n =>
            n.ClinicaId == clinicaId
            && (n.Status == StatusNotificacao.Pendente || n.Status == StatusNotificacao.Falha), ct);

    public async Task<bool> ExistsForAgendamentoAsync(Guid agendamentoId, TipoNotificacao tipo, CancellationToken ct = default)
        => await _context.Set<Notificacao>().AnyAsync(
            n => n.AgendamentoId == agendamentoId
                 && n.Tipo == tipo
                 && n.Status != StatusNotificacao.Falha,
            ct);
}
