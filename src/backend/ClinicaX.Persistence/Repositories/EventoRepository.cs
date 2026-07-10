using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using ClinicaX.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicaX.Persistence.Repositories;

public class EventoRepository : IEventoRepository
{
    private readonly ClinicaXDbContext _context;

    public EventoRepository(ClinicaXDbContext context) => _context = context;

    public async Task AddAsync(Evento evento, CancellationToken ct = default)
        => await _context.Set<Evento>().AddAsync(evento, ct);

    public async Task<List<Evento>> GetByClinicaAsync(Guid clinicaId, int take = 30, CancellationToken ct = default)
        => await _context.Set<Evento>()
            .Where(e => e.ClinicaId == clinicaId)
            .OrderByDescending(e => e.CriadoEm)
            .Take(take)
            .ToListAsync(ct);

    public async Task<List<Evento>> GetByPacienteAsync(Guid pacienteId, CancellationToken ct = default)
        => await _context.Set<Evento>()
            .Where(e => e.PacienteId == pacienteId)
            .OrderByDescending(e => e.CriadoEm)
            .ToListAsync(ct);
}
