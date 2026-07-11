using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using FluentResults;

namespace ClinicaX.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IAgendamentoRepository _agendamentoRepo;
    private readonly INotificacaoRepository _notificacaoRepo;
    private readonly IEventoRepository _eventoRepo;
    private readonly IPacienteRepository _pacienteRepo;
    private readonly IServicoRepository _servicoRepo;
    private readonly ICacheService _cache;

    public DashboardService(
        IAgendamentoRepository agendamentoRepo,
        INotificacaoRepository notificacaoRepo,
        IEventoRepository eventoRepo,
        IPacienteRepository pacienteRepo,
        IServicoRepository servicoRepo,
        ICacheService cache)
    {
        _agendamentoRepo = agendamentoRepo;
        _notificacaoRepo = notificacaoRepo;
        _eventoRepo = eventoRepo;
        _pacienteRepo = pacienteRepo;
        _servicoRepo = servicoRepo;
        _cache = cache;
    }

    public async Task<Result<DashboardDataDto>> GetDashboardAsync(Guid clinicaId, CancellationToken ct = default)
    {
        var cacheKey = $"dashboard:{clinicaId}";
        var cached = await _cache.GetAsync<DashboardDataDto>(cacheKey, ct);
        if (cached is not null)
            return Result.Ok(cached);

        var data = await BuildDashboardAsync(clinicaId, ct);
        await _cache.SetAsync(cacheKey, data, TimeSpan.FromMinutes(1), ct);
        return Result.Ok(data);
    }

    private async Task<DashboardDataDto> BuildDashboardAsync(Guid clinicaId, CancellationToken ct)
    {
        // Use local calendar day so demo seed (DateTime.Today) and UI match
        var hoje = DateTime.Today;
        var fimHoje = hoje.AddDays(1);
        var fim7dias = hoje.AddDays(7);

        var agendamentosHoje = await _agendamentoRepo.GetByClinicaAsync(clinicaId, hoje, fimHoje, ct);
        var agendamentos7dias = await _agendamentoRepo.GetByClinicaAsync(clinicaId, hoje, fim7dias, ct);

        var inicioMes = new DateTime(hoje.Year, hoje.Month, 1);
        var fimMes = inicioMes.AddMonths(1);
        var agendamentosMes = await _agendamentoRepo.GetByClinicaAsync(clinicaId, inicioMes, fimMes, ct);

        var servicos = await _servicoRepo.GetAllAsync(clinicaId, ct);
        var servicoMap = servicos.ToDictionary(s => s.Id);

        var pacientes = (await _pacienteRepo.GetAllAsync(clinicaId, null, 1, int.MaxValue, ct))
            .ToDictionary(p => p.Id);

        var faturamento = agendamentosMes
            .Where(a => a.Status != AgendamentoStatus.Cancelado)
            .Sum(a => servicoMap.GetValueOrDefault(a.ServicoId)?.Valor ?? 0);

        var pendentes = await _notificacaoRepo.CountPendentesAsync(clinicaId, ct);

        var ocupacao = agendamentos7dias
            .GroupBy(a => a.DataHoraInicio.DayOfWeek)
            .Select(g => new OcupacaoDto(
                g.Key.ToString(),
                g.Count(),
                g.Count(a => a.Status == AgendamentoStatus.Realizado)
            ))
            .ToList();

        var consultasHojeLista = agendamentosHoje
            .Where(a => a.Status != AgendamentoStatus.Cancelado)
            .OrderBy(a => a.DataHoraInicio)
            .Select(a =>
            {
                pacientes.TryGetValue(a.PacienteId, out var paciente);
                servicoMap.TryGetValue(a.ServicoId, out var servico);
                return new AgendamentoDto(
                    a.Id,
                    a.ClinicaId,
                    a.PacienteId,
                    paciente?.Nome ?? string.Empty,
                    a.ServicoId,
                    servico?.Nome ?? string.Empty,
                    a.DataHoraInicio,
                    a.DataHoraFim,
                    a.Status.ToString(),
                    a.Observacao,
                    a.MotivoCancelamento,
                    servico?.Cor,
                    a.CriadoEm);
            })
            .ToList();

        return new DashboardDataDto(
            agendamentosHoje.Count(a => a.Status != AgendamentoStatus.Cancelado),
            agendamentos7dias.Count(a => a.Status != AgendamentoStatus.Cancelado),
            faturamento,
            pendentes,
            consultasHojeLista,
            ocupacao
        );
    }

    public async Task<Result<List<EventoDto>>> GetTimelineAsync(Guid clinicaId, int take = 30, CancellationToken ct = default)
    {
        var eventos = await _eventoRepo.GetByClinicaAsync(clinicaId, take, ct);
        var pacienteIds = eventos.Where(e => e.PacienteId.HasValue).Select(e => e.PacienteId!.Value).Distinct().ToList();
        var pacientes = new Dictionary<Guid, string>();
        foreach (var id in pacienteIds)
        {
            var p = await _pacienteRepo.GetByIdAsync(id, ct);
            if (p is not null)
                pacientes[id] = p.Nome;
        }

        var result = eventos.Select(e => new EventoDto(
            e.Id,
            e.Tipo.ToString(),
            e.Descricao,
            e.CriadoEm,
            e.PacienteId.HasValue ? pacientes.GetValueOrDefault(e.PacienteId.Value) : null
        )).ToList();

        return Result.Ok(result);
    }
}
