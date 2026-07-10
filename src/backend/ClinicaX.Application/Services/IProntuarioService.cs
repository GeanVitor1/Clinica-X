using ClinicaX.Application.DTOs;
using FluentResults;

namespace ClinicaX.Application.Services;

public interface IProntuarioService
{
    Task<Result<List<ProntuarioDto>>> GetByPacienteAsync(Guid pacienteId, CancellationToken ct = default);
    Task<Result<ProntuarioDto>> CreateAsync(Guid clinicaId, Guid pacienteId, CreateProntuarioRequest request, CancellationToken ct = default);
    Task<Result<ProntuarioDto>> UpdateAsync(Guid id, UpdateProntuarioRequest request, CancellationToken ct = default);
    Task<Result> UploadAnexoAsync(Guid prontuarioId, string nome, string contentType, long tamanho, Stream content, CancellationToken ct = default);
    Task<Result<(Stream Content, string ContentType, string Nome)>> DownloadAnexoAsync(Guid anexoId, CancellationToken ct = default);
    Task<Result> RemoveAnexoAsync(Guid anexoId, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
}
