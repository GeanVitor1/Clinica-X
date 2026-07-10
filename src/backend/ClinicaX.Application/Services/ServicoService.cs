using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using FluentResults;
using Mapster;

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
        return Result.Ok(items.Adapt<List<ServicoDto>>());
    }

    public async Task<Result<ServicoDto>> CreateAsync(Guid clinicaId, CreateServicoRequest request, CancellationToken ct = default)
    {
        var servico = request.Adapt<Servico>();
        servico.ClinicaId = clinicaId;
        await _repo.AddAsync(servico, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(servico.Adapt<ServicoDto>());
    }

    public async Task<Result<ServicoDto>> UpdateAsync(Guid id, UpdateServicoRequest request, CancellationToken ct = default)
    {
        var servico = await _repo.GetByIdAsync(id, ct);
        if (servico is null) return Result.Fail("Serviço não encontrado.");
        request.Adapt(servico);
        await _repo.UpdateAsync(servico, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(servico.Adapt<ServicoDto>());
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var servico = await _repo.GetByIdAsync(id, ct);
        if (servico is null) return Result.Fail("Serviço não encontrado.");
        servico.Ativo = false;
        await _repo.UpdateAsync(servico, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }
}
