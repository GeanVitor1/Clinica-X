using ClinicaX.Application.Interfaces;
using static ClinicaX.API.Endpoints.EndpointHelpers;

namespace ClinicaX.API.Endpoints;

public static class EventoEndpoints
{
    public static void MapEventoEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/eventos").WithTags("Eventos").RequireAuthorization("ClinicaOwner");

        group.MapGet("/", async (IEventoRepository repo, HttpContext ctx, int take = 50) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var list = await repo.GetByClinicaAsync(clinicaId, take);
            return Results.Ok(list);
        });

        group.MapGet("/paciente/{pacienteId:guid}", async (Guid pacienteId, IEventoRepository repo) =>
        {
            var list = await repo.GetByPacienteAsync(pacienteId);
            return Results.Ok(list);
        });
    }

}
