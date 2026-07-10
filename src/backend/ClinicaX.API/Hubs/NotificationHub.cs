using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ClinicaX.API.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var clinicaId = Context.User?.FindFirst("ClinicaId")?.Value
            ?? Context.User?.FindFirstValue("ClinicaId");

        if (!string.IsNullOrEmpty(clinicaId))
            await Groups.AddToGroupAsync(Context.ConnectionId, clinicaId);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var clinicaId = Context.User?.FindFirst("ClinicaId")?.Value;
        if (!string.IsNullOrEmpty(clinicaId))
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, clinicaId);

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinGroup(string clinicaId)
    {
        var claimId = Context.User?.FindFirst("ClinicaId")?.Value;
        // Só permite entrar no próprio grupo da clínica autenticada
        if (!string.IsNullOrEmpty(claimId) && claimId == clinicaId)
            await Groups.AddToGroupAsync(Context.ConnectionId, clinicaId);
    }

    public async Task LeaveGroup(string clinicaId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, clinicaId);
    }
}
