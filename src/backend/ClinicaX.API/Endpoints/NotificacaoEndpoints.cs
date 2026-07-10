using ClinicaX.Application.Interfaces;
using static ClinicaX.API.Endpoints.EndpointHelpers;

namespace ClinicaX.API.Endpoints;

public static class NotificacaoEndpoints
{
    public static void MapNotificacaoEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/notificacoes").WithTags("Notificações").RequireAuthorization("ClinicaOwner");

        group.MapGet("/", async (INotificacaoRepository repo, HttpContext ctx) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var list = await repo.GetByClinicaAsync(clinicaId);
            return Results.Ok(list);
        });

        group.MapGet("/pendentes", async (INotificacaoRepository repo, HttpContext ctx) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var count = await repo.CountPendentesAsync(clinicaId);
            return Results.Ok(new { count });
        });

        group.MapGet("/paciente/{pacienteId:guid}", async (Guid pacienteId, INotificacaoRepository repo) =>
        {
            var list = await repo.GetByPacienteAsync(pacienteId);
            return Results.Ok(list);
        });
    }

}
