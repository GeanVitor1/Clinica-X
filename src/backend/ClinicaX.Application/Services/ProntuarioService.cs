using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using FluentResults;
using Mapster;

namespace ClinicaX.Application.Services;

public class ProntuarioService : IProntuarioService
{
    private readonly IProntuarioRepository _repo;
    private readonly IUnitOfWork _uow;

    private static readonly HashSet<string> TiposPermitidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/pdf", "image/jpeg", "image/png"
    };
    private const long TamanhoMaximo = 10 * 1024 * 1024; // 10 MB

    public ProntuarioService(IProntuarioRepository repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<Result<List<ProntuarioDto>>> GetByPacienteAsync(Guid pacienteId, CancellationToken ct = default)
    {
        var list = await _repo.GetByPacienteAsync(pacienteId, ct);
        return Result.Ok(list.Adapt<List<ProntuarioDto>>());
    }

    public async Task<Result<ProntuarioDto>> CreateAsync(Guid clinicaId, Guid pacienteId, CreateProntuarioRequest request, CancellationToken ct = default)
    {
        var prontuario = request.Adapt<Prontuario>();
        prontuario.ClinicaId = clinicaId;
        prontuario.PacienteId = pacienteId;
        await _repo.AddAsync(prontuario, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(prontuario.Adapt<ProntuarioDto>());
    }

    public async Task<Result<ProntuarioDto>> UpdateAsync(Guid id, UpdateProntuarioRequest request, CancellationToken ct = default)
    {
        var prontuario = await _repo.GetByIdAsync(id, ct);
        if (prontuario is null) return Result.Fail("Prontuário não encontrado.");
        request.Adapt(prontuario);
        await _repo.UpdateAsync(prontuario, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(prontuario.Adapt<ProntuarioDto>());
    }

    public async Task<Result> UploadAnexoAsync(Guid prontuarioId, string nome, string contentType, long tamanho, Stream content, CancellationToken ct = default)
    {
        if (!TiposPermitidos.Contains(contentType))
            return Result.Fail("Tipo de arquivo não permitido. Apenas PDF, JPG e PNG.");
        if (tamanho > TamanhoMaximo)
            return Result.Fail("Arquivo muito grande. Máximo 10 MB.");

        var prontuario = await _repo.GetByIdAsync(prontuarioId, ct);
        if (prontuario is null) return Result.Fail("Prontuário não encontrado.");

        using var ms = new MemoryStream();
        await content.CopyToAsync(ms, ct);

        var anexo = new Anexo
        {
            ProntuarioId = prontuarioId,
            Nome = nome,
            ContentType = contentType,
            Tamanho = tamanho,
            Dados = ms.ToArray()
        };

        await _repo.AddAnexoAsync(anexo, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    public async Task<Result<(Stream, string, string)>> DownloadAnexoAsync(Guid anexoId, CancellationToken ct = default)
    {
        var anexo = await _repo.GetAnexoAsync(anexoId, ct);
        if (anexo is null) return Result.Fail("Anexo não encontrado.");
        return Result.Ok(((Stream)new MemoryStream(anexo.Dados), anexo.ContentType, anexo.Nome));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var prontuario = await _repo.GetByIdAsync(id, ct);
        if (prontuario is null) return Result.Fail("Prontuário não encontrado.");
        prontuario.Ativo = false;
        await _repo.UpdateAsync(prontuario, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    public async Task<Result> RemoveAnexoAsync(Guid anexoId, CancellationToken ct = default)
    {
        var anexo = await _repo.GetAnexoAsync(anexoId, ct);
        if (anexo is null) return Result.Fail("Anexo não encontrado.");
        await _repo.RemoveAnexoAsync(anexo, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }
}
