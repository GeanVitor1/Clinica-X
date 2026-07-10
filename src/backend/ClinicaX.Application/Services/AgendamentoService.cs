using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using FluentResults;

namespace ClinicaX.Application.Services;

public class AgendamentoService : IAgendamentoService
{
    private readonly IAgendamentoRepository _repo;
    private readonly IClinicaRepository _clinicaRepo;
    private readonly IServicoRepository _servicoRepo;
    private readonly IPacienteRepository _pacienteRepo;
    private readonly INotificationDispatcher _notifDispatcher;
    private readonly IEventoRepository _eventoRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICacheService _cache;

    public AgendamentoService(
        IAgendamentoRepository repo,
        IClinicaRepository clinicaRepo,
        IServicoRepository servicoRepo,
        IPacienteRepository pacienteRepo,
        INotificationDispatcher notifDispatcher,
        IEventoRepository eventoRepo,
        IUnitOfWork uow,
        ICacheService cache)
    {
        _repo = repo;
        _clinicaRepo = clinicaRepo;
        _servicoRepo = servicoRepo;
        _pacienteRepo = pacienteRepo;
        _notifDispatcher = notifDispatcher;
        _eventoRepo = eventoRepo;
        _uow = uow;
        _cache = cache;
    }

    public async Task<Result<List<AgendamentoDto>>> GetByClinicaAsync(Guid clinicaId, DateTime? start = null, DateTime? end = null, CancellationToken ct = default)
    {
        var list = await _repo.GetByClinicaAsync(clinicaId, start, end, ct);
        if (list.Count == 0)
            return Result.Ok(new List<AgendamentoDto>());

        var pacientes = (await _pacienteRepo.GetAllAsync(clinicaId, null, 1, int.MaxValue, ct))
            .ToDictionary(p => p.Id);
        var servicos = (await _servicoRepo.GetAllAsync(clinicaId, ct))
            .ToDictionary(s => s.Id);

        var dtos = list.Select(a =>
        {
            pacientes.TryGetValue(a.PacienteId, out var paciente);
            servicos.TryGetValue(a.ServicoId, out var servico);
            return ToDto(a, paciente?.Nome ?? string.Empty, servico?.Nome ?? string.Empty, servico?.Cor);
        }).ToList();

        return Result.Ok(dtos);
    }

    public async Task<Result<AgendamentoDto>> CreateAsync(Guid clinicaId, CreateAgendamentoRequest request, CancellationToken ct = default)
    {
        var clinica = await _clinicaRepo.GetByIdAsync(clinicaId, ct);
        if (clinica is null) return Result.Fail("Clínica não encontrada.");

        var servico = await _servicoRepo.GetByIdAsync(request.ServicoId, ct);
        if (servico is null) return Result.Fail("Serviço não encontrado.");

        var paciente = await _pacienteRepo.GetByIdAsync(request.PacienteId, ct);
        if (paciente is null) return Result.Fail("Paciente não encontrado.");

        var inicio = request.DataHoraInicio;
        var fim = inicio.AddMinutes(servico.DuracaoMin);

        var businessError = ValidateBusinessHours(clinica, inicio, fim);
        if (businessError is not null)
            return Result.Fail(businessError);

        var hasConflict = await _repo.HasConflictAsync(clinicaId, inicio, fim, null, ct);
        if (hasConflict)
            return Result.Fail("Conflito de horário com outro agendamento.");

        var agendamento = new Agendamento
        {
            ClinicaId = clinicaId,
            PacienteId = request.PacienteId,
            ServicoId = request.ServicoId,
            DataHoraInicio = inicio,
            DataHoraFim = fim,
            Observacao = request.Observacao,
            Status = AgendamentoStatus.Agendado
        };
        await _repo.AddAsync(agendamento, ct);
        await _uow.SaveChangesAsync(ct);
        await InvalidateDashboardCache(clinicaId, ct);

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = clinicaId,
            PacienteId = agendamento.PacienteId,
            Tipo = TipoEvento.AgendamentoCriado,
            Descricao = $"Agendamento criado para {paciente.Nome} em {agendamento.DataHoraInicio:dd/MM/yyyy HH:mm}"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        await _notifDispatcher.SendConfirmacaoAsync(agendamento, paciente.Nome, clinica.Nome, servico.Nome, clinica.Endereco, ct);

        return Result.Ok(ToDto(agendamento, paciente.Nome, servico.Nome, servico.Cor));
    }

    public async Task<Result<AgendamentoDto>> RemarcarAsync(Guid id, RemarcarAgendamentoRequest request, CancellationToken ct = default)
    {
        var agendamento = await _repo.GetByIdAsync(id, ct);
        if (agendamento is null) return Result.Fail("Agendamento não encontrado.");
        if (agendamento.Status == AgendamentoStatus.Cancelado)
            return Result.Fail("Não é possível remarcar um agendamento cancelado.");

        var servico = await _servicoRepo.GetByIdAsync(agendamento.ServicoId, ct);
        if (servico is null) return Result.Fail("Serviço vinculado não encontrado.");

        var paciente = await _pacienteRepo.GetByIdAsync(agendamento.PacienteId, ct);
        if (paciente is null) return Result.Fail("Paciente não encontrado.");

        var clinica = await _clinicaRepo.GetByIdAsync(agendamento.ClinicaId, ct);
        if (clinica is null) return Result.Fail("Clínica não encontrada.");

        var inicio = request.DataHoraInicio;
        var fim = inicio.AddMinutes(servico.DuracaoMin);

        var businessError = ValidateBusinessHours(clinica, inicio, fim);
        if (businessError is not null)
            return Result.Fail(businessError);

        var hasConflict = await _repo.HasConflictAsync(agendamento.ClinicaId, inicio, fim, id, ct);
        if (hasConflict)
            return Result.Fail("Conflito de horário com outro agendamento.");

        agendamento.DataHoraInicio = inicio;
        agendamento.DataHoraFim = fim;
        await _repo.UpdateAsync(agendamento, ct);
        await _uow.SaveChangesAsync(ct);
        await InvalidateDashboardCache(agendamento.ClinicaId, ct);

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = agendamento.ClinicaId,
            PacienteId = agendamento.PacienteId,
            Tipo = TipoEvento.AgendamentoRemarcado,
            Descricao = $"Agendamento de {paciente.Nome} remarcado para {inicio:dd/MM/yyyy HH:mm}"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        await _notifDispatcher.SendRemarcacaoAsync(agendamento, inicio, paciente.Nome, clinica.Nome, clinica.Endereco, ct);

        return Result.Ok(ToDto(agendamento, paciente.Nome, servico.Nome, servico.Cor));
    }

    public async Task<Result<AgendamentoDto>> CancelarAsync(Guid id, CancelarAgendamentoRequest request, CancellationToken ct = default)
    {
        var agendamento = await _repo.GetByIdAsync(id, ct);
        if (agendamento is null) return Result.Fail("Agendamento não encontrado.");

        var paciente = await _pacienteRepo.GetByIdAsync(agendamento.PacienteId, ct);
        var clinica = await _clinicaRepo.GetByIdAsync(agendamento.ClinicaId, ct);
        var servico = await _servicoRepo.GetByIdAsync(agendamento.ServicoId, ct);

        agendamento.Status = AgendamentoStatus.Cancelado;
        agendamento.MotivoCancelamento = request.MotivoCancelamento;
        await _repo.UpdateAsync(agendamento, ct);
        await _uow.SaveChangesAsync(ct);
        await InvalidateDashboardCache(agendamento.ClinicaId, ct);

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = agendamento.ClinicaId,
            PacienteId = agendamento.PacienteId,
            Tipo = TipoEvento.AgendamentoCancelado,
            Descricao = $"Agendamento de {(paciente?.Nome ?? "desconhecido")} cancelado. Motivo: {request.MotivoCancelamento}"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        if (paciente is not null && clinica is not null)
            await _notifDispatcher.SendCancelamentoAsync(agendamento, paciente.Nome, clinica.Nome, request.MotivoCancelamento, clinica.Telefone, ct);

        return Result.Ok(ToDto(agendamento, paciente?.Nome ?? string.Empty, servico?.Nome ?? string.Empty, servico?.Cor));
    }

    private static AgendamentoDto ToDto(Agendamento a, string pacienteNome, string servicoNome, string? cor)
        => new(
            a.Id,
            a.ClinicaId,
            a.PacienteId,
            pacienteNome,
            a.ServicoId,
            servicoNome,
            a.DataHoraInicio,
            a.DataHoraFim,
            a.Status.ToString(),
            a.Observacao,
            a.MotivoCancelamento,
            cor,
            a.CriadoEm);

    private static string? ValidateBusinessHours(Clinica clinica, DateTime inicio, DateTime fim)
    {
        if (!clinica.OperaNoDia(inicio.DayOfWeek))
            return "A clínica não funciona neste dia da semana.";

        var horaInicio = inicio.TimeOfDay;
        var horaFim = fim.TimeOfDay;
        if (horaInicio < clinica.HorarioAbertura || horaFim > clinica.HorarioFechamento)
            return "Horário fora do expediente da clínica.";

        return null;
    }

    private Task InvalidateDashboardCache(Guid clinicaId, CancellationToken ct)
        => _cache.RemoveAsync($"dashboard:{clinicaId}", ct);
}
