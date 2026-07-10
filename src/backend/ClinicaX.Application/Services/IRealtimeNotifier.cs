namespace ClinicaX.Application.Services;

public record NotificacaoRealtimeEvent(
    string Tipo,
    string Mensagem,
    bool Sucesso,
    Guid ClinicaId,
    Guid? AgendamentoId,
    Guid? PacienteId
);

/// <summary>
/// Abstração para push em tempo real (implementada via SignalR na API).
/// </summary>
public interface IRealtimeNotifier
{
    Task NotifyNotificacaoEnviadaAsync(NotificacaoRealtimeEvent evt, CancellationToken ct = default);
}
