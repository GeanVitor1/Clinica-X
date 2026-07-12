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
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        // Usa horário local do servidor para alinhar com seed/UI de calendário
        var agora = DateTime.Now;
        var daqui24h = agora.AddHours(24);

        var clinicas = await clinicaRepo.GetAllAsync();
        foreach (var clinica in clinicas)
        {
            // Lembretes: consultas nas próximas 24h ainda Agendado/Confirmado
            var agendamentos = await agendamentoRepo.GetByClinicaAsync(clinica.Id, agora, daqui24h, context.CancellationToken);
            foreach (var agendamento in agendamentos.Where(a =>
                         a.Status is AgendamentoStatus.Agendado or AgendamentoStatus.Confirmado))
            {
                var jaEnviado = await notifRepo.ExistsForAgendamentoAsync(
                    agendamento.Id, TipoNotificacao.Lembrete, context.CancellationToken);
                if (jaEnviado || agendamento.LembreteEnviado)
                    continue;

                var paciente = await pacRepo.GetByIdAndClinicaAsync(clinica.Id, agendamento.PacienteId, context.CancellationToken);
                var servico = await servRepo.GetByIdAndClinicaAsync(clinica.Id, agendamento.ServicoId, context.CancellationToken);
                if (paciente is null || servico is null) continue;

                var link = string.IsNullOrEmpty(agendamento.TokenConfirmacao)
                    ? null
                    : $"/confirmar/{agendamento.TokenConfirmacao}";

                var result = await dispatcher.SendLembreteAsync(
                    agendamento, paciente.Nome, clinica.Nome, servico.Nome, link, context.CancellationToken);

                if (result.IsSuccess)
                {
                    agendamento.LembreteEnviado = true;
                    await agendamentoRepo.UpdateAsync(agendamento, context.CancellationToken);
                    await uow.SaveChangesAsync(context.CancellationToken);
                }

                _logger.LogInformation("Lembrete para {Paciente} em {Data}: {Status}",
                    paciente.Nome, agendamento.DataHoraInicio, result.IsSuccess ? "enviado" : "falha");
            }
        }
    }
}
