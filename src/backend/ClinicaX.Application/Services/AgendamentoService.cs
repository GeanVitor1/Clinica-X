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
    private readonly IModulosRepository _modulosRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICacheService _cache;

    public AgendamentoService(
        IAgendamentoRepository repo,
        IClinicaRepository clinicaRepo,
        IServicoRepository servicoRepo,
        IPacienteRepository pacienteRepo,
        INotificationDispatcher notifDispatcher,
        IEventoRepository eventoRepo,
        IModulosRepository modulosRepo,
        IUnitOfWork uow,
        ICacheService cache)
    {
        _repo = repo;
        _clinicaRepo = clinicaRepo;
        _servicoRepo = servicoRepo;
        _pacienteRepo = pacienteRepo;
        _notifDispatcher = notifDispatcher;
        _eventoRepo = eventoRepo;
        _modulosRepo = modulosRepo;
        _uow = uow;
        _cache = cache;
    }

    public async Task<Result<List<AgendamentoDto>>> GetByClinicaAsync(
        Guid clinicaId,
        DateTime? start = null,
        DateTime? end = null,
        string? profissional = null,
        string? sala = null,
        string? status = null,
        CancellationToken ct = default)
    {
        var list = await _repo.GetByClinicaAsync(clinicaId, start, end, ct);

        if (!string.IsNullOrWhiteSpace(profissional))
            list = list.Where(a => string.Equals(a.Profissional, profissional, StringComparison.OrdinalIgnoreCase)).ToList();
        if (!string.IsNullOrWhiteSpace(sala))
            list = list.Where(a => string.Equals(a.Sala, sala, StringComparison.OrdinalIgnoreCase)).ToList();
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<AgendamentoStatus>(status, true, out var st))
            list = list.Where(a => a.Status == st).ToList();

        if (list.Count == 0)
            return Result.Ok(new List<AgendamentoDto>());

        var pacientes = (await _pacienteRepo.GetAllAsync(clinicaId, null, 1, 200, null, ct))
            .ToDictionary(p => p.Id);
        // load more if needed via ids missing
        foreach (var pid in list.Select(a => a.PacienteId).Distinct().Where(id => !pacientes.ContainsKey(id)))
        {
            var p = await _pacienteRepo.GetByIdAndClinicaAsync(clinicaId, pid, ct);
            if (p is not null) pacientes[p.Id] = p;
        }

        var servicos = (await _servicoRepo.GetAllAsync(clinicaId, ct)).ToDictionary(s => s.Id);

        var dtos = list.Select(a =>
        {
            pacientes.TryGetValue(a.PacienteId, out var paciente);
            servicos.TryGetValue(a.ServicoId, out var servico);
            return ToDto(a, paciente?.Nome ?? string.Empty, servico?.Nome ?? string.Empty, servico?.Cor);
        }).ToList();

        return Result.Ok(dtos);
    }

    public async Task<Result<AgendamentoDto>> GetByIdAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var a = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (a is null) return Result.Fail("Agendamento não encontrado.");
        var paciente = await _pacienteRepo.GetByIdAndClinicaAsync(clinicaId, a.PacienteId, ct);
        var servico = await _servicoRepo.GetByIdAndClinicaAsync(clinicaId, a.ServicoId, ct);
        return Result.Ok(ToDto(a, paciente?.Nome ?? "", servico?.Nome ?? "", servico?.Cor));
    }

    public async Task<Result<AgendamentoDto>> CreateAsync(Guid clinicaId, CreateAgendamentoRequest request, CancellationToken ct = default)
    {
        var clinica = await _clinicaRepo.GetByIdAsync(clinicaId, ct);
        if (clinica is null) return Result.Fail("Clínica não encontrada.");

        var servico = await _servicoRepo.GetByIdAndClinicaAsync(clinicaId, request.ServicoId, ct);
        if (servico is null) return Result.Fail("Serviço não encontrado nesta clínica.");

        var paciente = await _pacienteRepo.GetByIdAndClinicaAsync(clinicaId, request.PacienteId, ct);
        if (paciente is null || !paciente.Ativo) return Result.Fail("Paciente não encontrado ou inativo nesta clínica.");

        var inicio = request.DataHoraInicio;
        var fim = inicio.AddMinutes(servico.DuracaoMin);

        var businessError = ValidateBusinessHours(clinica, inicio, fim);
        if (businessError is not null)
            return Result.Fail(businessError);

        if (await _repo.HasBloqueioAsync(clinicaId, inicio, fim, request.Profissional, request.Sala, request.Equipamento, ct))
            return Result.Fail("Horário bloqueado na agenda (folga, sala ou equipamento indisponível).");

        if (await _repo.HasConflictAsync(clinicaId, inicio, fim, null, request.Profissional, request.Sala, request.Equipamento, ct))
            return Result.Fail("Conflito de horário com outro agendamento (profissional, sala ou equipamento).");

        var token = GenerateToken();
        var agendamento = new Agendamento
        {
            ClinicaId = clinicaId,
            PacienteId = request.PacienteId,
            ServicoId = request.ServicoId,
            DataHoraInicio = inicio,
            DataHoraFim = fim,
            Observacao = request.Observacao,
            Profissional = request.Profissional,
            Sala = request.Sala,
            Equipamento = request.Equipamento,
            TokenConfirmacao = token,
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

        var link = BuildConfirmLink(token);
        await _notifDispatcher.SendConfirmacaoAsync(agendamento, paciente.Nome, clinica.Nome, servico.Nome, clinica.Endereco, link, ct);

        return Result.Ok(ToDto(agendamento, paciente.Nome, servico.Nome, servico.Cor));
    }

    public async Task<Result<AgendamentoDto>> RemarcarAsync(Guid clinicaId, Guid id, RemarcarAgendamentoRequest request, CancellationToken ct = default)
    {
        var agendamento = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (agendamento is null) return Result.Fail("Agendamento não encontrado.");
        if (agendamento.Status is AgendamentoStatus.Cancelado or AgendamentoStatus.Realizado)
            return Result.Fail("Não é possível remarcar este agendamento.");

        var servico = await _servicoRepo.GetByIdAndClinicaAsync(clinicaId, agendamento.ServicoId, ct);
        if (servico is null) return Result.Fail("Serviço vinculado não encontrado.");

        var paciente = await _pacienteRepo.GetByIdAndClinicaAsync(clinicaId, agendamento.PacienteId, ct);
        if (paciente is null) return Result.Fail("Paciente não encontrado.");

        var clinica = await _clinicaRepo.GetByIdAsync(clinicaId, ct);
        if (clinica is null) return Result.Fail("Clínica não encontrada.");

        var inicio = request.DataHoraInicio;
        var fim = inicio.AddMinutes(servico.DuracaoMin);

        var businessError = ValidateBusinessHours(clinica, inicio, fim);
        if (businessError is not null)
            return Result.Fail(businessError);

        if (await _repo.HasBloqueioAsync(clinicaId, inicio, fim, agendamento.Profissional, agendamento.Sala, agendamento.Equipamento, ct))
            return Result.Fail("Horário bloqueado na agenda.");

        if (await _repo.HasConflictAsync(clinicaId, inicio, fim, id, agendamento.Profissional, agendamento.Sala, agendamento.Equipamento, ct))
            return Result.Fail("Conflito de horário com outro agendamento.");

        agendamento.DataHoraInicio = inicio;
        agendamento.DataHoraFim = fim;
        agendamento.Status = AgendamentoStatus.Agendado;
        agendamento.ConfirmadoEm = null;
        agendamento.TokenConfirmacao ??= GenerateToken();
        await _repo.UpdateAsync(agendamento, ct);
        await _uow.SaveChangesAsync(ct);
        await InvalidateDashboardCache(clinicaId, ct);

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = clinicaId,
            PacienteId = agendamento.PacienteId,
            Tipo = TipoEvento.AgendamentoRemarcado,
            Descricao = $"Agendamento de {paciente.Nome} remarcado para {inicio:dd/MM/yyyy HH:mm}"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        var link = BuildConfirmLink(agendamento.TokenConfirmacao!);
        await _notifDispatcher.SendRemarcacaoAsync(agendamento, inicio, paciente.Nome, clinica.Nome, clinica.Endereco, link, ct);

        return Result.Ok(ToDto(agendamento, paciente.Nome, servico.Nome, servico.Cor));
    }

    public async Task<Result<AgendamentoDto>> CancelarAsync(Guid clinicaId, Guid id, CancelarAgendamentoRequest request, CancellationToken ct = default)
    {
        var agendamento = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (agendamento is null) return Result.Fail("Agendamento não encontrado.");
        if (agendamento.Status == AgendamentoStatus.Cancelado)
            return Result.Fail("Agendamento já cancelado.");
        if (agendamento.Status == AgendamentoStatus.Realizado)
            return Result.Fail("Não é possível cancelar um agendamento já realizado. Estorne o lançamento financeiro se necessário.");

        var paciente = await _pacienteRepo.GetByIdAndClinicaAsync(clinicaId, agendamento.PacienteId, ct);
        var clinica = await _clinicaRepo.GetByIdAsync(clinicaId, ct);
        var servico = await _servicoRepo.GetByIdAndClinicaAsync(clinicaId, agendamento.ServicoId, ct);

        agendamento.Status = AgendamentoStatus.Cancelado;
        agendamento.MotivoCancelamento = request.MotivoCancelamento;
        await _repo.UpdateAsync(agendamento, ct);
        await _uow.SaveChangesAsync(ct);
        await InvalidateDashboardCache(clinicaId, ct);

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = clinicaId,
            PacienteId = agendamento.PacienteId,
            Tipo = TipoEvento.AgendamentoCancelado,
            Descricao = $"Agendamento de {(paciente?.Nome ?? "desconhecido")} cancelado. Motivo: {request.MotivoCancelamento}"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        if (paciente is not null && clinica is not null)
            await _notifDispatcher.SendCancelamentoAsync(agendamento, paciente.Nome, clinica.Nome, request.MotivoCancelamento, clinica.Telefone, ct);

        return Result.Ok(ToDto(agendamento, paciente?.Nome ?? string.Empty, servico?.Nome ?? string.Empty, servico?.Cor));
    }

    public async Task<Result<AgendamentoDto>> ConfirmarAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var agendamento = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (agendamento is null) return Result.Fail("Agendamento não encontrado.");
        if (agendamento.Status is AgendamentoStatus.Cancelado or AgendamentoStatus.Realizado or AgendamentoStatus.Falta)
            return Result.Fail("Não é possível confirmar este agendamento.");

        agendamento.Status = AgendamentoStatus.Confirmado;
        agendamento.ConfirmadoEm = DateTime.UtcNow;
        await _repo.UpdateAsync(agendamento, ct);
        await _uow.SaveChangesAsync(ct);
        await InvalidateDashboardCache(clinicaId, ct);

        var paciente = await _pacienteRepo.GetByIdAndClinicaAsync(clinicaId, agendamento.PacienteId, ct);
        var servico = await _servicoRepo.GetByIdAndClinicaAsync(clinicaId, agendamento.ServicoId, ct);

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = clinicaId,
            PacienteId = agendamento.PacienteId,
            Tipo = TipoEvento.AgendamentoConfirmado,
            Descricao = $"Consulta confirmada: {paciente?.Nome} em {agendamento.DataHoraInicio:dd/MM/yyyy HH:mm}"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        return Result.Ok(ToDto(agendamento, paciente?.Nome ?? "", servico?.Nome ?? "", servico?.Cor));
    }

    public async Task<Result<AgendamentoDto>> MarcarRealizadoAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var agendamento = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (agendamento is null) return Result.Fail("Agendamento não encontrado.");
        if (agendamento.Status is AgendamentoStatus.Cancelado or AgendamentoStatus.Falta)
            return Result.Fail("Não é possível marcar como realizado.");
        if (agendamento.Status == AgendamentoStatus.Realizado)
            return Result.Fail("Agendamento já realizado.");

        var paciente = await _pacienteRepo.GetByIdAndClinicaAsync(clinicaId, agendamento.PacienteId, ct);
        var servico = await _servicoRepo.GetByIdAndClinicaAsync(clinicaId, agendamento.ServicoId, ct);
        var clinica = await _clinicaRepo.GetByIdAsync(clinicaId, ct);

        agendamento.Status = AgendamentoStatus.Realizado;
        agendamento.RealizadoEm = DateTime.UtcNow;
        await _repo.UpdateAsync(agendamento, ct);
        await _uow.SaveChangesAsync(ct);

        // Integração financeira: receita + comissão (idempotente)
        if (servico is not null)
        {
            var existentes = await _modulosRepo.GetLancamentosAsync(clinicaId, null, null, ct);
            var jaFaturado = existentes.Any(l =>
                l.AgendamentoId == agendamento.Id
                && l.Tipo == TipoLancamento.Receita
                && l.Status != StatusLancamento.Cancelado);

            if (!jaFaturado)
            {
                var receita = new LancamentoFinanceiro
                {
                    ClinicaId = clinicaId,
                    PacienteId = agendamento.PacienteId,
                    AgendamentoId = agendamento.Id,
                    Tipo = TipoLancamento.Receita,
                    Categoria = "Consulta",
                    Descricao = $"Receita — {servico.Nome} ({paciente?.Nome})",
                    Valor = servico.Valor,
                    Data = DateTime.UtcNow,
                    DataPagamento = null,
                    Status = StatusLancamento.Pendente,
                    FormaPagamento = null,
                    Profissional = agendamento.Profissional,
                    ValorComissao = servico.PercentualComissao > 0
                        ? Math.Round(servico.Valor * servico.PercentualComissao / 100m, 2)
                        : null
                };
                await _modulosRepo.AddLancamentoAsync(receita, ct);

                if (receita.ValorComissao is > 0)
                {
                    await _modulosRepo.AddLancamentoAsync(new LancamentoFinanceiro
                    {
                        ClinicaId = clinicaId,
                        PacienteId = agendamento.PacienteId,
                        AgendamentoId = agendamento.Id,
                        Tipo = TipoLancamento.Despesa,
                        Categoria = "Comissão",
                        Descricao = $"Comissão {servico.PercentualComissao}% — {agendamento.Profissional ?? "profissional"} ({servico.Nome})",
                        Valor = receita.ValorComissao.Value,
                        Data = DateTime.UtcNow,
                        DataPagamento = null,
                        Status = StatusLancamento.Pendente,
                        FormaPagamento = "Comissão",
                        Profissional = agendamento.Profissional
                    }, ct);
                }
                await _uow.SaveChangesAsync(ct);
            }
        }

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = clinicaId,
            PacienteId = agendamento.PacienteId,
            Tipo = TipoEvento.AgendamentoRealizado,
            Descricao = $"Consulta realizada: {paciente?.Nome} — {servico?.Nome}"
        }, ct);
        await _uow.SaveChangesAsync(ct);
        await InvalidateDashboardCache(clinicaId, ct);

        if (paciente is not null && clinica is not null && servico is not null && !agendamento.PosConsultaEnviado)
        {
            await _notifDispatcher.SendPosConsultaAsync(agendamento, paciente.Nome, clinica.Nome, servico.Nome, ct);
            agendamento.PosConsultaEnviado = true;
            await _repo.UpdateAsync(agendamento, ct);
            await _uow.SaveChangesAsync(ct);
        }

        return Result.Ok(ToDto(agendamento, paciente?.Nome ?? "", servico?.Nome ?? "", servico?.Cor));
    }

    public async Task<Result<AgendamentoDto>> MarcarFaltaAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var agendamento = await _repo.GetByIdAndClinicaAsync(clinicaId, id, ct);
        if (agendamento is null) return Result.Fail("Agendamento não encontrado.");
        if (agendamento.Status is AgendamentoStatus.Cancelado or AgendamentoStatus.Realizado)
            return Result.Fail("Não é possível marcar falta neste status.");

        agendamento.Status = AgendamentoStatus.Falta;
        await _repo.UpdateAsync(agendamento, ct);
        await _uow.SaveChangesAsync(ct);
        await InvalidateDashboardCache(clinicaId, ct);

        var paciente = await _pacienteRepo.GetByIdAndClinicaAsync(clinicaId, agendamento.PacienteId, ct);
        var servico = await _servicoRepo.GetByIdAndClinicaAsync(clinicaId, agendamento.ServicoId, ct);

        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = clinicaId,
            PacienteId = agendamento.PacienteId,
            Tipo = TipoEvento.AgendamentoFalta,
            Descricao = $"Falta registrada: {paciente?.Nome} em {agendamento.DataHoraInicio:dd/MM/yyyy HH:mm}"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        return Result.Ok(ToDto(agendamento, paciente?.Nome ?? "", servico?.Nome ?? "", servico?.Cor));
    }

    public async Task<Result<ConfirmarPublicoResponse>> ConfirmarPorTokenAsync(string token, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(token))
            return Result.Ok(new ConfirmarPublicoResponse(false, "Token inválido.", null, null));

        var agendamento = await _repo.GetByTokenConfirmacaoAsync(token.Trim(), ct);
        if (agendamento is null)
            return Result.Ok(new ConfirmarPublicoResponse(false, "Link de confirmação inválido ou expirado.", null, null));

        if (agendamento.Status == AgendamentoStatus.Cancelado)
            return Result.Ok(new ConfirmarPublicoResponse(false, "Este agendamento foi cancelado.", null, agendamento.DataHoraInicio));

        if (agendamento.Status is AgendamentoStatus.Confirmado or AgendamentoStatus.Realizado)
        {
            var pacOk = await _pacienteRepo.GetByIdAsync(agendamento.PacienteId, ct);
            return Result.Ok(new ConfirmarPublicoResponse(true, "Consulta já confirmada. Obrigado!", pacOk?.Nome, agendamento.DataHoraInicio));
        }

        agendamento.Status = AgendamentoStatus.Confirmado;
        agendamento.ConfirmadoEm = DateTime.UtcNow;
        await _repo.UpdateAsync(agendamento, ct);
        await _uow.SaveChangesAsync(ct);
        await InvalidateDashboardCache(agendamento.ClinicaId, ct);

        var paciente = await _pacienteRepo.GetByIdAsync(agendamento.PacienteId, ct);
        await _eventoRepo.AddAsync(new Evento
        {
            ClinicaId = agendamento.ClinicaId,
            PacienteId = agendamento.PacienteId,
            Tipo = TipoEvento.AgendamentoConfirmado,
            Descricao = $"Confirmação em 1 clique por {paciente?.Nome} via WhatsApp/link"
        }, ct);
        await _uow.SaveChangesAsync(ct);

        return Result.Ok(new ConfirmarPublicoResponse(true, "Consulta confirmada com sucesso! Até breve.", paciente?.Nome, agendamento.DataHoraInicio));
    }

    public async Task<Result<List<BloqueioAgendaDto>>> ListBloqueiosAsync(Guid clinicaId, DateTime? start, DateTime? end, CancellationToken ct = default)
    {
        var list = await _repo.GetBloqueiosAsync(clinicaId, start, end, ct);
        return Result.Ok(list.Select(b => new BloqueioAgendaDto(b.Id, b.DataHoraInicio, b.DataHoraFim, b.Motivo, b.Profissional, b.Sala, b.Equipamento)).ToList());
    }

    public async Task<Result<BloqueioAgendaDto>> CreateBloqueioAsync(Guid clinicaId, CreateBloqueioAgendaRequest request, CancellationToken ct = default)
    {
        if (request.DataHoraFim <= request.DataHoraInicio)
            return Result.Fail("Data/hora fim deve ser posterior ao início.");
        if (string.IsNullOrWhiteSpace(request.Motivo))
            return Result.Fail("Informe o motivo do bloqueio.");

        var b = new BloqueioAgenda
        {
            ClinicaId = clinicaId,
            DataHoraInicio = request.DataHoraInicio,
            DataHoraFim = request.DataHoraFim,
            Motivo = request.Motivo.Trim(),
            Profissional = request.Profissional,
            Sala = request.Sala,
            Equipamento = request.Equipamento
        };
        await _repo.AddBloqueioAsync(b, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(new BloqueioAgendaDto(b.Id, b.DataHoraInicio, b.DataHoraFim, b.Motivo, b.Profissional, b.Sala, b.Equipamento));
    }

    public async Task<Result> DeleteBloqueioAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var b = await _repo.GetBloqueioAsync(clinicaId, id, ct);
        if (b is null) return Result.Fail("Bloqueio não encontrado.");
        await _repo.DeleteBloqueioAsync(b, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
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
            a.Profissional,
            a.Sala,
            a.Equipamento,
            // Token de confirmação NÃO é exposto na API autenticada
            null,
            a.ConfirmadoEm,
            a.RealizadoEm,
            a.CriadoEm);

    private static string? ValidateBusinessHours(Clinica clinica, DateTime inicio, DateTime fim)
    {
        // Compara pelo dia local do início vs hoje (evita falsos positivos de Kind/UTC)
        if (inicio.Date < DateTime.Today.AddDays(-1))
            return "Não é possível agendar no passado.";

        if (!clinica.OperaNoDia(inicio.DayOfWeek))
            return "A clínica não funciona neste dia da semana.";

        var horaInicio = inicio.TimeOfDay;
        var horaFim = fim.TimeOfDay;
        if (horaInicio < clinica.HorarioAbertura || horaFim > clinica.HorarioFechamento)
            return "Horário fora do expediente da clínica.";

        return null;
    }

    private static string GenerateToken()
    {
        var bytes = new byte[24];
        System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-").Replace("/", "_").Replace("=", "");
    }

    private static string BuildConfirmLink(string token)
        => $"/confirmar/{token}";

    private Task InvalidateDashboardCache(Guid clinicaId, CancellationToken ct)
        => _cache.RemoveAsync($"dashboard:{clinicaId}", ct);
}
