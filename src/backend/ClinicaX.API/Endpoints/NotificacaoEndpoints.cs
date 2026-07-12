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

        group.MapGet("/paciente/{pacienteId:guid}", async (Guid pacienteId, INotificacaoRepository repo, IPacienteRepository pacRepo, HttpContext ctx) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var pac = await pacRepo.GetByIdAndClinicaAsync(clinicaId, pacienteId);
            if (pac is null) return Results.NotFound();
            var list = await repo.GetByPacienteAsync(pacienteId);
            // Só devolve notificações cujo ClinicaId bate
            return Results.Ok(list.Where(n => n.ClinicaId == clinicaId));
        });
    }
}
