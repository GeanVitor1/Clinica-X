using ClinicaX.Application.Services;
using static ClinicaX.API.Endpoints.EndpointHelpers;

namespace ClinicaX.API.Endpoints;

public static class DashboardEndpoints
{
    public static void MapDashboardEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/dashboard").WithTags("Dashboard").RequireAuthorization("ClinicaOwner");

        group.MapGet("/", async (IDashboardService service, HttpContext ctx) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var result = await service.GetDashboardAsync(clinicaId);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
        });

        group.MapGet("/timeline", async (IDashboardService service, HttpContext ctx) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var result = await service.GetTimelineAsync(clinicaId);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
        });
    }

}
