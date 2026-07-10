using ClinicaX.API.Hubs;
using ClinicaX.Application.Services;
using Microsoft.AspNetCore.SignalR;

namespace ClinicaX.API.Services;

public class SignalRRealtimeNotifier : IRealtimeNotifier
{
    private readonly IHubContext<NotificationHub> _hub;

    public SignalRRealtimeNotifier(IHubContext<NotificationHub> hub)
    {
        _hub = hub;
    }

    public async Task NotifyNotificacaoEnviadaAsync(NotificacaoRealtimeEvent evt, CancellationToken ct = default)
    {
        await _hub.Clients
            .Group(evt.ClinicaId.ToString())
            .SendAsync("NotificacaoEnviada", evt, ct);
    }
}
