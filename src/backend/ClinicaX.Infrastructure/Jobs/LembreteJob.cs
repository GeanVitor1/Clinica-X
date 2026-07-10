using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;

namespace ClinicaX.Infrastructure.Jobs;

[DisallowConcurrentExecution]
public class LembreteJob : IJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<LembreteJob> _logger;

    public LembreteJob(IServiceScopeFactory scopeFactory, ILogger<LembreteJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        using var scope = _scopeFactory.CreateScope();
        var agendamentoRepo = scope.ServiceProvider.GetRequiredService<IAgendamentoRepository>();
        var notifRepo = scope.ServiceProvider.GetRequiredService<INotificacaoRepository>();
        var clinicaRepo = scope.ServiceProvider.GetRequiredService<IClinicaRepository>();
        var pacRepo = scope.ServiceProvider.GetRequiredService<IPacienteRepository>();
        var servRepo = scope.ServiceProvider.GetRequiredService<IServicoRepository>();
        var dispatcher = scope.ServiceProvider.GetRequiredService<INotificationDispatcher>();

        var agora = DateTime.UtcNow;
        var daqui1h = agora.AddHours(1);

        var clinicas = await clinicaRepo.GetAllAsync();
        foreach (var clinica in clinicas)
        {
            var agendamentos = await agendamentoRepo.GetByClinicaAsync(clinica.Id, agora, daqui1h, context.CancellationToken);
            foreach (var agendamento in agendamentos.Where(a => a.Status == AgendamentoStatus.Agendado))
            {
                var jaEnviado = await notifRepo.ExistsForAgendamentoAsync(
                    agendamento.Id, TipoNotificacao.Lembrete, context.CancellationToken);
                if (jaEnviado)
                {
                    _logger.LogDebug(
                        "Lembrete já enviado para agendamento {AgendamentoId}, ignorando",
                        agendamento.Id);
                    continue;
                }

                var paciente = await pacRepo.GetByIdAsync(agendamento.PacienteId, context.CancellationToken);
                var servico = await servRepo.GetByIdAsync(agendamento.ServicoId, context.CancellationToken);
                if (paciente is null || servico is null) continue;

                var result = await dispatcher.SendLembreteAsync(
                    agendamento, paciente.Nome, clinica.Nome, servico.Nome, context.CancellationToken);

                _logger.LogInformation("Lembrete para {Paciente} em {Data}: {Status}",
                    paciente.Nome, agendamento.DataHoraInicio, result.IsSuccess ? "enviado" : "falha");
            }
        }
    }
}
