using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using ClinicaX.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicaX.Persistence.Repositories;

public class ClinicaRepository : IClinicaRepository
{
    private readonly ClinicaXDbContext _context;

    public ClinicaRepository(ClinicaXDbContext context)
    {
        _context = context;
    }

    public async Task<Clinica?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Clinicas.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<Clinica?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await _context.Clinicas.FirstOrDefaultAsync(c => c.Email == email, ct);

    public async Task<List<Clinica>> GetAllAsync(CancellationToken ct = default)
        => await _context.Clinicas.Where(c => c.Ativo).ToListAsync(ct);

    public async Task AddAsync(Clinica clinica, CancellationToken ct = default)
        => await _context.Clinicas.AddAsync(clinica, ct);

    public Task UpdateAsync(Clinica clinica, CancellationToken ct = default)
    {
        _context.Clinicas.Update(clinica);
        return Task.CompletedTask;
    }
}
