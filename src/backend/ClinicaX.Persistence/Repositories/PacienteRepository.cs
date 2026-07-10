using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using ClinicaX.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicaX.Persistence.Repositories;

public class PacienteRepository : IPacienteRepository
{
    private readonly ClinicaXDbContext _context;

    public PacienteRepository(ClinicaXDbContext context) => _context = context;

    public async Task<Paciente?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Set<Paciente>().FirstOrDefaultAsync(p => p.Id == id && p.Ativo, ct);

    public async Task<List<Paciente>> GetAllAsync(Guid clinicaId, string? search = null, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var query = _context.Set<Paciente>().Where(p => p.ClinicaId == clinicaId && p.Ativo);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Nome.Contains(search) || p.Cpf.Contains(search) || p.Telefone.Contains(search));
        return await query.OrderByDescending(p => p.CriadoEm).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
    }

    public async Task<int> CountAsync(Guid clinicaId, string? search = null, CancellationToken ct = default)
    {
        var query = _context.Set<Paciente>().Where(p => p.ClinicaId == clinicaId && p.Ativo);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Nome.Contains(search) || p.Cpf.Contains(search) || p.Telefone.Contains(search));
        return await query.CountAsync(ct);
    }

    public async Task AddAsync(Paciente paciente, CancellationToken ct = default) => await _context.Set<Paciente>().AddAsync(paciente, ct);
    public Task UpdateAsync(Paciente paciente, CancellationToken ct = default) { _context.Set<Paciente>().Update(paciente); return Task.CompletedTask; }
    public Task DeleteAsync(Paciente paciente, CancellationToken ct = default) { _context.Set<Paciente>().Remove(paciente); return Task.CompletedTask; }
}
