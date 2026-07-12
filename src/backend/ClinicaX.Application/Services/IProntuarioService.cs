using ClinicaX.Application.DTOs;
using FluentResults;

namespace ClinicaX.Application.Services;

public interface IProntuarioService
{
    Task<Result<List<ProntuarioDto>>> GetByPacienteAsync(Guid clinicaId, Guid pacienteId, CancellationToken ct = default);
    Task<Result<ProntuarioDto>> CreateAsync(Guid clinicaId, Guid pacienteId, CreateProntuarioRequest request, CancellationToken ct = default);
    Task<Result<ProntuarioDto>> UpdateAsync(Guid clinicaId, Guid id, UpdateProntuarioRequest request, CancellationToken ct = default);
    Task<Result> UploadAnexoAsync(Guid clinicaId, Guid prontuarioId, string nome, string contentType, long tamanho, Stream content, CancellationToken ct = default);
    Task<Result<(Stream, string, string)>> DownloadAnexoAsync(Guid clinicaId, Guid anexoId, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task<Result> RemoveAnexoAsync(Guid clinicaId, Guid anexoId, CancellationToken ct = default);
}
