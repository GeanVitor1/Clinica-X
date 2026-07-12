using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using FluentResults;

namespace ClinicaX.Application.Services;

public class PacienteService : IPacienteService
{
    private readonly IPacienteRepository _repo;
    private readonly IAgendamentoRepository _agendamentoRepo;
    private readonly IServicoRepository _servicoRepo;
    private readonly IEventoRepository _eventoRepo;
    private readonly IUnitOfWork _uow;

    public PacienteService(
        IPacienteRepository repo,
        IAgendamentoRepository agendamentoRepo,
        IServicoRepository servicoRepo,
        IEventoRepository eventoRepo,
        IUnitOfWork uow)
    {
        _repo = repo;
        _agendamentoRepo = agendamentoRepo;
        _servicoRepo = servicoRepo;
        _eventoRepo = eventoRepo;
        _uow = uow;
    }

    public async Task<Result<PacienteDto>> GetByIdAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var paciente = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (paciente is null) return Result.Fail("Paciente não encontrado.");
        var ultimos = await _agendamentoRepo.GetUltimoPorPacientesAsync([id], ct);
        ultimos.TryGetValue(id, out var ultimo);
        return Result.Ok(ToDto(paciente, ultimo));
    }

    public async Task<Result<(List<PacienteDto> Items, int Total)>> GetAllAsync(
        Guid clinicaId,
        string? search = null,
        int page = 1,
        int pageSize = 20,
        bool? ativo = true,
        CancellationToken ct = default)
    {
        var items = await _repo.GetAllAsync(clinicaId, search, page, pageSize, ativo, ct);
        var total = await _repo.CountAsync(clinicaId, search, ativo, ct);
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
            Nome = request.Nome.Trim(),
            Cpf = request.Cpf.Trim(),
            Telefone = request.Telefone.Trim(),
            Email = request.Email?.Trim(),
            DataNascimento = request.DataNascimento,
            Observacoes = request.Observacoes,
            Convenio = request.Convenio?.Trim(),
            NumeroCarteirinha = request.NumeroCarteirinha?.Trim(),
            Endereco = request.Endereco?.Trim(),
            ContatoEmergencia = request.ContatoEmergencia?.Trim(),
            TelefoneEmergencia = request.TelefoneEmergencia?.Trim()
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

    public async Task<Result<PacienteDto>> UpdateAsync(Guid clinicaId, Guid id, UpdatePacienteRequest request, CancellationToken ct = default)
    {
        var paciente = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (paciente is null) return Result.Fail("Paciente não encontrado.");
        var nomeAntigo = paciente.Nome;
        paciente.Nome = request.Nome.Trim();
        paciente.Cpf = request.Cpf.Trim();
        paciente.Telefone = request.Telefone.Trim();
        paciente.Email = request.Email?.Trim();
        paciente.DataNascimento = request.DataNascimento;
        paciente.Observacoes = request.Observacoes;
        paciente.Convenio = request.Convenio?.Trim();
        paciente.NumeroCarteirinha = request.NumeroCarteirinha?.Trim();
        paciente.Endereco = request.Endereco?.Trim();
        paciente.ContatoEmergencia = request.ContatoEmergencia?.Trim();
        paciente.TelefoneEmergencia = request.TelefoneEmergencia?.Trim();
        paciente.Ativo = request.Ativo;
        await _repo.UpdateAsync(paciente, ct);
        await _uow.SaveChangesAsync(ct);

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = paciente.ClinicaId,
            PacienteId = paciente.Id,
            Tipo = TipoEvento.PacienteEditado,
            Descricao = $"Paciente {nomeAntigo} atualizado"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        var ultimos = await _agendamentoRepo.GetUltimoPorPacientesAsync([id], ct);
        ultimos.TryGetValue(id, out var ultimo);
        return Result.Ok(ToDto(paciente, ultimo));
    }

    public async Task<Result> DeleteAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var paciente = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (paciente is null) return Result.Fail("Paciente não encontrado.");
        paciente.Ativo = false;
        await _repo.UpdateAsync(paciente, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    public async Task<Result<PacienteHistoricoDto>> GetHistoricoAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var paciente = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (paciente is null) return Result.Fail("Paciente não encontrado.");

        var ags = await _agendamentoRepo.GetByPacienteAsync(clinicaId, id, ct);
        var servicos = (await _servicoRepo.GetAllAsync(clinicaId, ct)).ToDictionary(s => s.Id);
        var eventos = await _eventoRepo.GetByPacienteAndClinicaAsync(clinicaId, id, ct);

        var resumoAgs = ags.Select(a =>
        {
            servicos.TryGetValue(a.ServicoId, out var s);
            return new AgendamentoResumoDto(a.Id, a.DataHoraInicio, a.DataHoraFim, a.Status.ToString(), s?.Nome ?? "—", a.Profissional);
        }).ToList();

        var resumoEv = eventos.Select(e => new EventoResumoDto(e.Id, e.Tipo.ToString(), e.Descricao, e.CriadoEm)).ToList();

        var ultimos = await _agendamentoRepo.GetUltimoPorPacientesAsync([id], ct);
        ultimos.TryGetValue(id, out var ultimo);

        return Result.Ok(new PacienteHistoricoDto(ToDto(paciente, ultimo), resumoAgs, resumoEv));
    }

    private static PacienteDto ToDto(Paciente p, Agendamento? ultimo)
        => new(
            p.Id,
            p.ClinicaId,
            p.Nome,
            p.Cpf,
            p.Telefone,
            p.Email,
            p.DataNascimento,
            p.Observacoes,
            p.Convenio,
            p.NumeroCarteirinha,
            p.Endereco,
            p.ContatoEmergencia,
            p.TelefoneEmergencia,
            p.Ativo,
            p.CriadoEm,
            ultimo?.DataHoraInicio,
            ultimo is null ? null : $"{ultimo.DataHoraInicio:dd/MM/yyyy HH:mm}");
}
