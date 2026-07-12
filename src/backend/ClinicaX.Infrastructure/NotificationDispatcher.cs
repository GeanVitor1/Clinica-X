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
    private readonly IPacienteRepository _pacienteRepo;
    private readonly IUnitOfWork _uow;
    private readonly IWhatsAppService _whatsApp;
    private readonly IRealtimeNotifier _realtime;
    private readonly ILogger<NotificationDispatcher> _logger;

    public NotificationDispatcher(
        INotificacaoRepository notifRepo,
        IEventoRepository eventoRepo,
        IPacienteRepository pacienteRepo,
        IUnitOfWork uow,
        IWhatsAppService whatsApp,
        IRealtimeNotifier realtime,
        ILogger<NotificationDispatcher> logger)
    {
        _notifRepo = notifRepo;
        _eventoRepo = eventoRepo;
        _pacienteRepo = pacienteRepo;
        _uow = uow;
        _whatsApp = whatsApp;
        _realtime = realtime;
        _logger = logger;
    }

    public async Task<Result> SendConfirmacaoAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string servicoNome, string clinicaEndereco, string? linkConfirmacao = null, CancellationToken ct = default)
    {
        var paciente = await ResolvePaciente(agendamento, ct);
        var telefone = paciente?.Telefone ?? "";
        var mensagem = WhatsAppSimuladoService.BuildConfirmacao(pacienteNome, clinicaNome, servicoNome, agendamento.DataHoraInicio, clinicaEndereco, linkConfirmacao);
        var notif = await CriarPendente(agendamento, TipoNotificacao.Confirmacao, mensagem, "confirmacao", telefone, ct);
        var result = await _whatsApp.SendConfirmacaoAsync(agendamento, telefone, pacienteNome, clinicaNome, servicoNome, clinicaEndereco, linkConfirmacao, ct);
        await FinalizarNotificacao(notif, agendamento, result, pacienteNome, ct);
        return result;
    }

    public async Task<Result> SendLembreteAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string servicoNome, string? linkConfirmacao = null, CancellationToken ct = default)
    {
        var paciente = await ResolvePaciente(agendamento, ct);
        var telefone = paciente?.Telefone ?? "";
        var mensagem = WhatsAppSimuladoService.BuildLembrete(pacienteNome, clinicaNome, servicoNome, agendamento.DataHoraInicio, linkConfirmacao);
        var notif = await CriarPendente(agendamento, TipoNotificacao.Lembrete, mensagem, "lembrete", telefone, ct);
        var result = await _whatsApp.SendLembreteAsync(agendamento, telefone, pacienteNome, clinicaNome, servicoNome, linkConfirmacao, ct);
        await FinalizarNotificacao(notif, agendamento, result, pacienteNome, ct);
        return result;
    }

    public async Task<Result> SendCancelamentoAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string motivo, string telefoneClinica, CancellationToken ct = default)
    {
        var paciente = await ResolvePaciente(agendamento, ct);
        var telefone = paciente?.Telefone ?? "";
        var mensagem = $"Olá {pacienteNome}, sua consulta em {clinicaNome} ({agendamento.DataHoraInicio:dd/MM/yyyy HH:mm}) foi cancelada. Motivo: {motivo}.";
        var notif = await CriarPendente(agendamento, TipoNotificacao.Cancelamento, mensagem, "cancelamento", telefone, ct);
        var result = await _whatsApp.SendCancelamentoAsync(agendamento, telefone, pacienteNome, clinicaNome, motivo, telefoneClinica, ct);
        await FinalizarNotificacao(notif, agendamento, result, pacienteNome, ct);
        return result;
    }

    public async Task<Result> SendRemarcacaoAsync(Agendamento agendamento, DateTime novaData, string pacienteNome, string clinicaNome, string clinicaEndereco, string? linkConfirmacao = null, CancellationToken ct = default)
    {
        var paciente = await ResolvePaciente(agendamento, ct);
        var telefone = paciente?.Telefone ?? "";
        var mensagem = $"Olá {pacienteNome}, consulta remarcada para {novaData:dd/MM/yyyy HH:mm} em {clinicaNome}. Local: {clinicaEndereco}."
                       + (string.IsNullOrEmpty(linkConfirmacao) ? "" : $" Confirme: {linkConfirmacao}");
        var notif = await CriarPendente(agendamento, TipoNotificacao.Remarcacao, mensagem, "remarcacao", telefone, ct);
        var result = await _whatsApp.SendRemarcacaoAsync(agendamento, telefone, novaData, pacienteNome, clinicaNome, clinicaEndereco, linkConfirmacao, ct);
        await FinalizarNotificacao(notif, agendamento, result, pacienteNome, ct);
        return result;
    }

    public async Task<Result> SendPosConsultaAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string servicoNome, CancellationToken ct = default)
    {
        var paciente = await ResolvePaciente(agendamento, ct);
        var telefone = paciente?.Telefone ?? "";
        var mensagem = $"Olá {pacienteNome}! Obrigado por comparecer à {clinicaNome} ({servicoNome}). Como se sentiu? Em caso de dúvidas, responda esta mensagem.";
        var notif = await CriarPendente(agendamento, TipoNotificacao.PosConsulta, mensagem, "pos_consulta", telefone, ct);
        var result = await _whatsApp.SendPosConsultaAsync(agendamento, telefone, pacienteNome, clinicaNome, servicoNome, ct);
        await FinalizarNotificacao(notif, agendamento, result, pacienteNome, ct);
        return result;
    }

    private async Task<Paciente?> ResolvePaciente(Agendamento agendamento, CancellationToken ct)
        => await _pacienteRepo.GetByIdAndClinicaAsync(agendamento.ClinicaId, agendamento.PacienteId, ct)
           ?? await _pacienteRepo.GetByIdAsync(agendamento.PacienteId, ct);

    private async Task<Notificacao> CriarPendente(
        Agendamento agendamento,
        TipoNotificacao tipo,
        string mensagemCompleta,
        string template,
        string telefone,
        CancellationToken ct)
    {
        var notificacao = new Notificacao
        {
            ClinicaId = agendamento.ClinicaId,
            PacienteId = agendamento.PacienteId,
            AgendamentoId = agendamento.Id,
            Tipo = tipo,
            Mensagem = mensagemCompleta,
            TelefoneDestino = telefone,
            Template = template,
            Status = StatusNotificacao.Pendente
        };
        await _notifRepo.AddAsync(notificacao, ct);
        await _uow.SaveChangesAsync(ct);
        return notificacao;
    }

    private async Task FinalizarNotificacao(
        Notificacao notificacao,
        Agendamento agendamento,
        Result result,
        string pacienteNome,
        CancellationToken ct)
    {
        try
        {
            var sucesso = result.IsSuccess;
            notificacao.Status = sucesso ? StatusNotificacao.Enviada : StatusNotificacao.Falha;
            notificacao.ErroDetalhe = sucesso ? null : string.Join("; ", result.Errors.Select(e => e.Message));
            notificacao.EnviadaEm = DateTime.UtcNow;
            await _uow.SaveChangesAsync(ct);

            await _eventoRepo.AddAsync(new Evento
            {
                ClinicaId = agendamento.ClinicaId,
                PacienteId = agendamento.PacienteId,
                Tipo = TipoEvento.NotificacaoEnviada,
                Descricao = $"WhatsApp {notificacao.Tipo} {(sucesso ? "enviado" : "falhou")} — {agendamento.DataHoraInicio:dd/MM/yyyy HH:mm}"
            }, ct);
            await _uow.SaveChangesAsync(ct);

            var toastMsg = sucesso
                ? $"WhatsApp {notificacao.Tipo} enviado para {pacienteNome}"
                : $"Falha ao enviar WhatsApp {notificacao.Tipo} para {pacienteNome}";

            await _realtime.NotifyNotificacaoEnviadaAsync(new NotificacaoRealtimeEvent(
                notificacao.Tipo.ToString(),
                toastMsg,
                sucesso,
                agendamento.ClinicaId,
                agendamento.Id,
                agendamento.PacienteId
            ), ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao finalizar notificação no banco");
        }
    }
}
