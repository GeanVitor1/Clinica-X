using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using FluentResults;

namespace ClinicaX.Application.Services;

public class ServicoService : IServicoService
{
    private readonly IServicoRepository _repo;
    private readonly IUnitOfWork _uow;

    public ServicoService(IServicoRepository repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<Result<List<ServicoDto>>> GetAllAsync(Guid clinicaId, CancellationToken ct = default)
    {
        var items = await _repo.GetAllAsync(clinicaId, ct);
        return Result.Ok(items.Select(ToDto).ToList());
    }

    public async Task<Result<ServicoDto>> CreateAsync(Guid clinicaId, CreateServicoRequest request, CancellationToken ct = default)
    {
        if (request.DuracaoMin <= 0) return Result.Fail("Duração deve ser positiva.");
        if (request.Valor < 0) return Result.Fail("Valor inválido.");
        if (request.PercentualComissao is < 0 or > 100) return Result.Fail("Comissão deve estar entre 0 e 100%.");

        var servico = new Servico
        {
            ClinicaId = clinicaId,
            Nome = request.Nome.Trim(),
            Descricao = request.Descricao,
            DuracaoMin = request.DuracaoMin,
            Valor = request.Valor,
            Cor = request.Cor,
            PercentualComissao = request.PercentualComissao
        };
        await _repo.AddAsync(servico, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToDto(servico));
    }

    public async Task<Result<ServicoDto>> UpdateAsync(Guid clinicaId, Guid id, UpdateServicoRequest request, CancellationToken ct = default)
    {
        var servico = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (servico is null) return Result.Fail("Serviço não encontrado.");
        if (request.PercentualComissao is < 0 or > 100) return Result.Fail("Comissão deve estar entre 0 e 100%.");

        servico.Nome = request.Nome.Trim();
        servico.Descricao = request.Descricao;
        servico.DuracaoMin = request.DuracaoMin;
        servico.Valor = request.Valor;
        servico.Cor = request.Cor;
        servico.PercentualComissao = request.PercentualComissao;
        await _repo.UpdateAsync(servico, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToDto(servico));
    }

    public async Task<Result> DeleteAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var servico = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (servico is null) return Result.Fail("Serviço não encontrado.");
        servico.Ativo = false;
        await _repo.UpdateAsync(servico, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    private static ServicoDto ToDto(Servico s)
        => new(s.Id, s.ClinicaId, s.Nome, s.Descricao, s.DuracaoMin, s.Valor, s.Cor, s.PercentualComissao, s.Ativo, s.CriadoEm);
}
