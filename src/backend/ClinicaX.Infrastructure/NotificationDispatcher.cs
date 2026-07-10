using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
using FluentResults;
using Microsoft.Extensions.Logging;

namespace ClinicaX.Infrastructure.Services;

public class NotificationDispatcher : INotificationDispatcher
{
    private readonly INotificacaoRepository _notifRepo;
    private readonly IEventoRepository _eventoRepo;
    private readonly IUnitOfWork _uow;
    private readonly IWhatsAppService _whatsApp;
    private readonly IRealtimeNotifier _realtime;
    private readonly ILogger<NotificationDispatcher> _logger;

    public NotificationDispatcher(
        INotificacaoRepository notifRepo,
        IEventoRepository eventoRepo,
        IUnitOfWork uow,
        IWhatsAppService whatsApp,
        IRealtimeNotifier realtime,
        ILogger<NotificationDispatcher> logger)
    {
        _notifRepo = notifRepo;
        _eventoRepo = eventoRepo;
        _uow = uow;
        _whatsApp = whatsApp;
        _realtime = realtime;
        _logger = logger;
    }

    public async Task<Result> SendConfirmacaoAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string servicoNome, string clinicaEndereco, CancellationToken ct = default)
    {
        var result = await _whatsApp.SendConfirmacaoAsync(agendamento, pacienteNome, clinicaNome, servicoNome, clinicaEndereco, ct);
        await SalvarNotificacao(agendamento, TipoNotificacao.Confirmacao, result.IsSuccess, pacienteNome, ct);
        return result;
    }

    public async Task<Result> SendLembreteAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string servicoNome, CancellationToken ct = default)
    {
        var result = await _whatsApp.SendLembreteAsync(agendamento, pacienteNome, clinicaNome, servicoNome, ct);
        await SalvarNotificacao(agendamento, TipoNotificacao.Lembrete, result.IsSuccess, pacienteNome, ct);
        return result;
    }

    public async Task<Result> SendCancelamentoAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string motivo, string telefone, CancellationToken ct = default)
    {
        var result = await _whatsApp.SendCancelamentoAsync(agendamento, pacienteNome, clinicaNome, motivo, telefone, ct);
        await SalvarNotificacao(agendamento, TipoNotificacao.Cancelamento, result.IsSuccess, pacienteNome, ct);
        return result;
    }

    public async Task<Result> SendRemarcacaoAsync(Agendamento agendamento, DateTime novaData, string pacienteNome, string clinicaNome, string clinicaEndereco, CancellationToken ct = default)
    {
        var result = await _whatsApp.SendRemarcacaoAsync(agendamento, novaData, pacienteNome, clinicaNome, clinicaEndereco, ct);
        await SalvarNotificacao(agendamento, TipoNotificacao.Remarcacao, result.IsSuccess, pacienteNome, ct);
        return result;
    }

    private async Task SalvarNotificacao(Agendamento agendamento, TipoNotificacao tipo, bool sucesso, string pacienteNome, CancellationToken ct)
    {
        try
        {
            var mensagem = $"{tipo} - {agendamento.DataHoraInicio:dd/MM/yyyy HH:mm}";
            var notificacao = new Notificacao
            {
                ClinicaId = agendamento.ClinicaId,
                PacienteId = agendamento.PacienteId,
                AgendamentoId = agendamento.Id,
                Tipo = tipo,
                Mensagem = mensagem,
                Status = sucesso ? StatusNotificacao.Enviada : StatusNotificacao.Falha,
                EnviadaEm = DateTime.UtcNow
            };
            await _notifRepo.AddAsync(notificacao, ct);
            await _uow.SaveChangesAsync(ct);

            await _eventoRepo.AddAsync(new Evento
            {
                ClinicaId = agendamento.ClinicaId,
                PacienteId = agendamento.PacienteId,
                Tipo = TipoEvento.NotificacaoEnviada,
                Descricao = $"Notificação de {tipo} {(sucesso ? "enviada" : "falhou")} para o agendamento de {agendamento.DataHoraInicio:dd/MM/yyyy HH:mm}"
            }, ct);
            await _uow.SaveChangesAsync(ct);

            var toastMsg = sucesso
                ? $"WhatsApp {tipo} enviado para {pacienteNome}"
                : $"Falha ao enviar WhatsApp {tipo} para {pacienteNome}";

            await _realtime.NotifyNotificacaoEnviadaAsync(new NotificacaoRealtimeEvent(
                tipo.ToString(),
                toastMsg,
                sucesso,
                agendamento.ClinicaId,
                agendamento.Id,
                agendamento.PacienteId
            ), ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao salvar notificação no banco");
        }
    }
}
