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
        => await _context.Set<Paciente>().FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Paciente?> GetByIdAndClinicaAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => await _context.Set<Paciente>().FirstOrDefaultAsync(p => p.Id == id && p.ClinicaId == clinicaId, ct);

    public async Task<List<Paciente>> GetAllAsync(Guid clinicaId, string? search = null, int page = 1, int pageSize = 20, bool? ativo = true, CancellationToken ct = default)
    {
        var query = _context.Set<Paciente>().Where(p => p.ClinicaId == clinicaId);
        if (ativo.HasValue)
            query = query.Where(p => p.Ativo == ativo.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(p =>
                p.Nome.Contains(s)
                || p.Cpf.Contains(s)
                || p.Telefone.Contains(s)
                || (p.Email != null && p.Email.Contains(s))
                || (p.Convenio != null && p.Convenio.Contains(s)));
        }

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);
        return await query.OrderByDescending(p => p.CriadoEm).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
    }

    public async Task<int> CountAsync(Guid clinicaId, string? search = null, bool? ativo = true, CancellationToken ct = default)
    {
        var query = _context.Set<Paciente>().Where(p => p.ClinicaId == clinicaId);
        if (ativo.HasValue)
            query = query.Where(p => p.Ativo == ativo.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(p =>
                p.Nome.Contains(s)
                || p.Cpf.Contains(s)
                || p.Telefone.Contains(s)
                || (p.Email != null && p.Email.Contains(s))
                || (p.Convenio != null && p.Convenio.Contains(s)));
        }
        return await query.CountAsync(ct);
    }

    public async Task AddAsync(Paciente paciente, CancellationToken ct = default)
        => await _context.Set<Paciente>().AddAsync(paciente, ct);

    public Task UpdateAsync(Paciente paciente, CancellationToken ct = default)
    {
        _context.Set<Paciente>().Update(paciente);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Paciente paciente, CancellationToken ct = default)
    {
        _context.Set<Paciente>().Remove(paciente);
        return Task.CompletedTask;
    }
}
