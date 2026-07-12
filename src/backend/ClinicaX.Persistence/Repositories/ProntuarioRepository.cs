using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using ClinicaX.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicaX.Persistence.Repositories;

public class ProntuarioRepository : IProntuarioRepository
{
    private readonly ClinicaXDbContext _context;

    public ProntuarioRepository(ClinicaXDbContext context) => _context = context;

    public async Task<Prontuario?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Set<Prontuario>().Include(p => p.Anexos).FirstOrDefaultAsync(p => p.Id == id && p.Ativo, ct);

    public async Task<Prontuario?> GetByIdAndClinicaAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => await _context.Set<Prontuario>()
            .Include(p => p.Anexos)
            .FirstOrDefaultAsync(p => p.Id == id && p.ClinicaId == clinicaId && p.Ativo, ct);

    public async Task<List<Prontuario>> GetByPacienteAsync(Guid clinicaId, Guid pacienteId, CancellationToken ct = default)
        => await _context.Set<Prontuario>()
            .Include(p => p.Anexos.Where(a => a.Ativo))
            .Where(p => p.ClinicaId == clinicaId && p.PacienteId == pacienteId && p.Ativo)
            .OrderByDescending(p => p.Data)
            .ToListAsync(ct);

    public async Task AddAsync(Prontuario prontuario, CancellationToken ct = default)
        => await _context.Set<Prontuario>().AddAsync(prontuario, ct);

    public Task UpdateAsync(Prontuario prontuario, CancellationToken ct = default)
    {
        _context.Set<Prontuario>().Update(prontuario);
        return Task.CompletedTask;
    }

    public async Task<Anexo?> GetAnexoAsync(Guid anexoId, CancellationToken ct = default)
        => await _context.Set<Anexo>().FirstOrDefaultAsync(a => a.Id == anexoId && a.Ativo, ct);

    public async Task<Anexo?> GetAnexoAndClinicaAsync(Guid clinicaId, Guid anexoId, CancellationToken ct = default)
    {
        var anexo = await _context.Set<Anexo>().FirstOrDefaultAsync(a => a.Id == anexoId && a.Ativo, ct);
        if (anexo is null) return null;
        var ok = await _context.Set<Prontuario>().AnyAsync(p => p.Id == anexo.ProntuarioId && p.ClinicaId == clinicaId, ct);
        return ok ? anexo : null;
    }

    public async Task AddAnexoAsync(Anexo anexo, CancellationToken ct = default)
        => await _context.Set<Anexo>().AddAsync(anexo, ct);

    public Task RemoveAnexoAsync(Anexo anexo, CancellationToken ct = default)
    {
        anexo.Ativo = false;
        _context.Set<Anexo>().Update(anexo);
        return Task.CompletedTask;
    }
}
