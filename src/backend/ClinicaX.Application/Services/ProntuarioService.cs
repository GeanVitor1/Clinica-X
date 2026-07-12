using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using FluentResults;

namespace ClinicaX.Application.Services;

public class ProntuarioService : IProntuarioService
{
    private readonly IProntuarioRepository _repo;
    private readonly IPacienteRepository _pacienteRepo;
    private readonly IEventoRepository _eventoRepo;
    private readonly IUnitOfWork _uow;

    private static readonly HashSet<string> TiposPermitidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/pdf", "image/jpeg", "image/png", "image/webp"
    };
    private const long TamanhoMaximo = 10 * 1024 * 1024; // 10 MB

    public ProntuarioService(
        IProntuarioRepository repo,
        IPacienteRepository pacienteRepo,
        IEventoRepository eventoRepo,
        IUnitOfWork uow)
    {
        _repo = repo;
        _pacienteRepo = pacienteRepo;
        _eventoRepo = eventoRepo;
        _uow = uow;
    }

    public async Task<Result<List<ProntuarioDto>>> GetByPacienteAsync(Guid clinicaId, Guid pacienteId, CancellationToken ct = default)
    {
        var paciente = await _pacienteRepo.GetByIdAndClinicaAsync(clinicaId, pacienteId, ct);
        if (paciente is null) return Result.Fail("Paciente não encontrado.");

        var list = await _repo.GetByPacienteAsync(clinicaId, pacienteId, ct);
        return Result.Ok(list.Select(ToDto).ToList());
    }

    public async Task<Result<ProntuarioDto>> CreateAsync(Guid clinicaId, Guid pacienteId, CreateProntuarioRequest request, CancellationToken ct = default)
    {
        var paciente = await _pacienteRepo.GetByIdAndClinicaAsync(clinicaId, pacienteId, ct);
        if (paciente is null) return Result.Fail("Paciente não encontrado.");

        var prontuario = new Prontuario
        {
            ClinicaId = clinicaId,
            PacienteId = pacienteId,
            AgendamentoId = request.AgendamentoId,
            Data = request.Data,
            Descricao = request.Descricao,
            Diagnostico = request.Diagnostico,
            Prescricao = request.Prescricao,
            Evolucao = request.Evolucao,
            Especialidade = request.Especialidade
        };
        await _repo.AddAsync(prontuario, ct);
        await _uow.SaveChangesAsync(ct);

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = clinicaId,
            PacienteId = pacienteId,
            Tipo = TipoEvento.ProntuarioCriado,
            Descricao = $"Evolução/prontuário criado para {paciente.Nome} em {prontuario.Data:dd/MM/yyyy}"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        return Result.Ok(ToDto(prontuario));
    }

    public async Task<Result<ProntuarioDto>> UpdateAsync(Guid clinicaId, Guid id, UpdateProntuarioRequest request, CancellationToken ct = default)
    {
        var prontuario = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (prontuario is null) return Result.Fail("Prontuário não encontrado.");

        prontuario.Descricao = request.Descricao;
        prontuario.Diagnostico = request.Diagnostico;
        prontuario.Prescricao = request.Prescricao;
        prontuario.Evolucao = request.Evolucao;
        prontuario.Especialidade = request.Especialidade;
        prontuario.AtualizadoEm = DateTime.UtcNow;
        await _repo.UpdateAsync(prontuario, ct);
        await _uow.SaveChangesAsync(ct);

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = clinicaId,
            PacienteId = prontuario.PacienteId,
            Tipo = TipoEvento.ProntuarioEditado,
            Descricao = $"Prontuário atualizado em {prontuario.AtualizadoEm:dd/MM/yyyy HH:mm}"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        return Result.Ok(ToDto(prontuario));
    }

    public async Task<Result> UploadAnexoAsync(Guid clinicaId, Guid prontuarioId, string nome, string contentType, long tamanho, Stream content, CancellationToken ct = default)
    {
        if (!TiposPermitidos.Contains(contentType))
            return Result.Fail("Tipo de arquivo não permitido. Apenas PDF, JPG, PNG e WEBP.");
        if (tamanho > TamanhoMaximo)
            return Result.Fail("Arquivo muito grande. Máximo 10 MB.");

        var prontuario = await _repo.GetByIdAndClinicaAsync(clinicaId, prontuarioId, ct);
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

    public async Task<Result<(Stream, string, string)>> DownloadAnexoAsync(Guid clinicaId, Guid anexoId, CancellationToken ct = default)
    {
        var anexo = await _repo.GetAnexoAndClinicaAsync(clinicaId, anexoId, ct);
        if (anexo is null) return Result.Fail("Anexo não encontrado.");
        return Result.Ok(((Stream)new MemoryStream(anexo.Dados), anexo.ContentType, anexo.Nome));
    }

    public async Task<Result> DeleteAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var prontuario = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (prontuario is null) return Result.Fail("Prontuário não encontrado.");
        prontuario.Ativo = false;
        await _repo.UpdateAsync(prontuario, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    public async Task<Result> RemoveAnexoAsync(Guid clinicaId, Guid anexoId, CancellationToken ct = default)
    {
        var anexo = await _repo.GetAnexoAndClinicaAsync(clinicaId, anexoId, ct);
        if (anexo is null) return Result.Fail("Anexo não encontrado.");
        await _repo.RemoveAnexoAsync(anexo, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    private static ProntuarioDto ToDto(Prontuario p)
        => new(
            p.Id,
            p.ClinicaId,
            p.PacienteId,
            p.AgendamentoId,
            p.Data,
            p.Descricao,
            p.Diagnostico,
            p.Prescricao,
            p.Evolucao,
            p.Especialidade,
            (p.Anexos ?? []).Where(a => a.Ativo).Select(a => new AnexoDto(
                a.Id, a.Nome, a.ContentType, a.Tamanho,
                a.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))).ToList(),
            p.CriadoEm,
            p.AtualizadoEm);
}
