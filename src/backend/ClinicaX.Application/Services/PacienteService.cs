using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using FluentResults;

namespace ClinicaX.Application.Services;

public class PacienteService : IPacienteService
{
    private readonly IPacienteRepository _repo;
    private readonly IAgendamentoRepository _agendamentoRepo;
    private readonly IEventoRepository _eventoRepo;
    private readonly IUnitOfWork _uow;

    public PacienteService(
        IPacienteRepository repo,
        IAgendamentoRepository agendamentoRepo,
        IEventoRepository eventoRepo,
        IUnitOfWork uow)
    {
        _repo = repo;
        _agendamentoRepo = agendamentoRepo;
        _eventoRepo = eventoRepo;
        _uow = uow;
    }

    public async Task<Result<PacienteDto>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var paciente = await _repo.GetByIdAsync(id, ct);
        if (paciente is null) return Result.Fail("Paciente não encontrado.");
        var ultimos = await _agendamentoRepo.GetUltimoPorPacientesAsync([id], ct);
        ultimos.TryGetValue(id, out var ultimo);
        return Result.Ok(ToDto(paciente, ultimo));
    }

    public async Task<Result<(List<PacienteDto> Items, int Total)>> GetAllAsync(Guid clinicaId, string? search = null, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var items = await _repo.GetAllAsync(clinicaId, search, page, pageSize, ct);
        var total = await _repo.CountAsync(clinicaId, search, ct);
        var ultimos = await _agendamentoRepo.GetUltimoPorPacientesAsync(items.Select(p => p.Id), ct);
        var dtos = items.Select(p =>
        {
            ultimos.TryGetValue(p.Id, out var ultimo);
            return ToDto(p, ultimo);
        }).ToList();
        return Result.Ok((dtos, total));
    }

    public async Task<Result<PacienteDto>> CreateAsync(Guid clinicaId, CreatePacienteRequest request, CancellationToken ct = default)
    {
        var paciente = new Paciente
        {
            ClinicaId = clinicaId,
            Nome = request.Nome,
            Cpf = request.Cpf,
            Telefone = request.Telefone,
            DataNascimento = request.DataNascimento,
            Observacoes = request.Observacoes
        };
        await _repo.AddAsync(paciente, ct);
        await _uow.SaveChangesAsync(ct);

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = clinicaId,
            PacienteId = paciente.Id,
            Tipo = TipoEvento.PacienteCriado,
            Descricao = $"Paciente {paciente.Nome} cadastrado"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        return Result.Ok(ToDto(paciente, null));
    }

    public async Task<Result<PacienteDto>> UpdateAsync(Guid id, UpdatePacienteRequest request, CancellationToken ct = default)
    {
        var paciente = await _repo.GetByIdAsync(id, ct);
        if (paciente is null) return Result.Fail("Paciente não encontrado.");
        var nomeAntigo = paciente.Nome;
        paciente.Nome = request.Nome;
        paciente.Cpf = request.Cpf;
        paciente.Telefone = request.Telefone;
        paciente.DataNascimento = request.DataNascimento;
        paciente.Observacoes = request.Observacoes;
        await _repo.UpdateAsync(paciente, ct);
        await _uow.SaveChangesAsync(ct);

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = paciente.ClinicaId,
            PacienteId = paciente.Id,
            Tipo = TipoEvento.PacienteEditado,
            Descricao = $"Paciente {nomeAntigo} editado para {paciente.Nome}"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        var ultimos = await _agendamentoRepo.GetUltimoPorPacientesAsync([id], ct);
        ultimos.TryGetValue(id, out var ultimo);
        return Result.Ok(ToDto(paciente, ultimo));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var paciente = await _repo.GetByIdAsync(id, ct);
        if (paciente is null) return Result.Fail("Paciente não encontrado.");
        paciente.Ativo = false;
        await _repo.UpdateAsync(paciente, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    private static PacienteDto ToDto(Paciente p, Agendamento? ultimo)
        => new(
            p.Id,
            p.ClinicaId,
            p.Nome,
            p.Cpf,
            p.Telefone,
            p.DataNascimento,
            p.Observacoes,
            p.Ativo,
            p.CriadoEm,
            ultimo?.DataHoraInicio,
            ultimo is null ? null : $"{ultimo.DataHoraInicio:dd/MM/yyyy HH:mm}");
}
