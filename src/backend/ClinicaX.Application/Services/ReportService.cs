using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using FluentResults;

namespace ClinicaX.Application.Services;

public class ReportService : IReportService
{
    private readonly IAgendamentoRepository _agendamentoRepo;
    private readonly IServicoRepository _servicoRepo;
    private readonly IPacienteRepository _pacienteRepo;

    public ReportService(
        IAgendamentoRepository agendamentoRepo,
        IServicoRepository servicoRepo,
        IPacienteRepository pacienteRepo)
    {
        _agendamentoRepo = agendamentoRepo;
        _servicoRepo = servicoRepo;
        _pacienteRepo = pacienteRepo;
    }

    public async Task<Result<RelatorioFinanceiroDto>> GetRelatorioFinanceiroAsync(Guid clinicaId, DateTime dataInicio, DateTime dataFim, CancellationToken ct = default)
    {
        var agendamentos = await _agendamentoRepo.GetByClinicaAsync(clinicaId, dataInicio, dataFim, ct);
        var servicos = await _servicoRepo.GetAllAsync(clinicaId, ct);
        var servicoMap = servicos.ToDictionary(s => s.Id);

        // Apenas consultas realizadas contam como faturamento (alinha com o dashboard)
        var realizados = agendamentos.Where(a => a.Status == AgendamentoStatus.Realizado).ToList();

        var porServico = realizados
            .GroupBy(a => a.ServicoId)
            .Select(g =>
            {
                var servico = servicoMap.GetValueOrDefault(g.Key);
                return new FaturamentoServicoDto(
                    servico?.Nome ?? "Desconhecido",
                    g.Count(),
                    servico?.Valor ?? 0,
                    g.Count() * (servico?.Valor ?? 0)
                );
            })
            .OrderByDescending(r => r.Total)
            .ToList();

        var total = porServico.Sum(r => r.Total);

        return Result.Ok(new RelatorioFinanceiroDto(dataInicio, dataFim, total, porServico));
    }

    public async Task<Result<RelatorioOcupacaoDto>> GetRelatorioOcupacaoAsync(Guid clinicaId, DateTime dataInicio, DateTime dataFim, CancellationToken ct = default)
    {
        var agendamentos = await _agendamentoRepo.GetByClinicaAsync(clinicaId, dataInicio, dataFim, ct);
        var servicos = await _servicoRepo.GetAllAsync(clinicaId, ct);
        var servicoMap = servicos.ToDictionary(s => s.Id);

        var realizados = agendamentos.Where(a => a.Status != AgendamentoStatus.Cancelado).ToList();

        var horariosPico = realizados
            .GroupBy(a => a.DataHoraInicio.Hour)
            .Select(g => new OcupacaoHorarioDto(g.Key, g.Count()))
            .OrderByDescending(h => h.Quantidade)
            .ToList();

        var totalGeral = realizados.Count;

        var servicosMaisAgendados = realizados
            .GroupBy(a => a.ServicoId)
            .Select(g =>
            {
                var servico = servicoMap.GetValueOrDefault(g.Key);
                return new ServicoMaisAgendadoDto(
                    servico?.Nome ?? "Desconhecido",
                    g.Count(),
                    totalGeral > 0 ? Math.Round((decimal)g.Count() / totalGeral * 100, 1) : 0
                );
            })
            .OrderByDescending(s => s.Quantidade)
            .ToList();

        return Result.Ok(new RelatorioOcupacaoDto(dataInicio, dataFim, totalGeral, horariosPico, servicosMaisAgendados));
    }
}
