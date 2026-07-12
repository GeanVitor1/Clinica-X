using ClinicaX.Domain.Entities;

namespace ClinicaX.Application.Interfaces;

public interface IProntuarioRepository
{
    Task<Prontuario?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Prontuario?> GetByIdAndClinicaAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task<List<Prontuario>> GetByPacienteAsync(Guid clinicaId, Guid pacienteId, CancellationToken ct = default);
    Task AddAsync(Prontuario prontuario, CancellationToken ct = default);
    Task UpdateAsync(Prontuario prontuario, CancellationToken ct = default);
    Task<Anexo?> GetAnexoAsync(Guid anexoId, CancellationToken ct = default);
    Task<Anexo?> GetAnexoAndClinicaAsync(Guid clinicaId, Guid anexoId, CancellationToken ct = default);
    Task AddAnexoAsync(Anexo anexo, CancellationToken ct = default);
    Task RemoveAnexoAsync(Anexo anexo, CancellationToken ct = default);
}
