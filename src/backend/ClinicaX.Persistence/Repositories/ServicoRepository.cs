using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using ClinicaX.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicaX.Persistence.Repositories;

public class ServicoRepository : IServicoRepository
{
    private readonly ClinicaXDbContext _context;

    public ServicoRepository(ClinicaXDbContext context) => _context = context;

    public async Task<Servico?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Set<Servico>().FirstOrDefaultAsync(s => s.Id == id && s.Ativo, ct);

    public async Task<Servico?> GetByIdAndClinicaAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => await _context.Set<Servico>().FirstOrDefaultAsync(s => s.Id == id && s.ClinicaId == clinicaId && s.Ativo, ct);

    public async Task<List<Servico>> GetAllAsync(Guid clinicaId, CancellationToken ct = default)
        => await _context.Set<Servico>().Where(s => s.ClinicaId == clinicaId && s.Ativo).OrderBy(s => s.Nome).ToListAsync(ct);

    public async Task AddAsync(Servico servico, CancellationToken ct = default)
        => await _context.Set<Servico>().AddAsync(servico, ct);

    public Task UpdateAsync(Servico servico, CancellationToken ct = default)
    {
        _context.Set<Servico>().Update(servico);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Servico servico, CancellationToken ct = default)
    {
        _context.Set<Servico>().Remove(servico);
        return Task.CompletedTask;
    }
}
