using ClinicaX.Application.Services;
using static ClinicaX.API.Endpoints.EndpointHelpers;

namespace ClinicaX.API.Endpoints;

public static class ReportEndpoints
{
    public static void MapReportEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/relatorios").WithTags("Relatórios").RequireAuthorization("ClinicaOwner");

        group.MapGet("/financeiro", async (IReportService service, HttpContext ctx, DateTime? dataInicio, DateTime? dataFim) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var inicio = dataInicio ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var fim = dataFim ?? inicio.AddMonths(1).AddDays(-1);
            var result = await service.GetRelatorioFinanceiroAsync(clinicaId, inicio, fim);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
        });

        group.MapGet("/ocupacao", async (IReportService service, HttpContext ctx, DateTime? dataInicio, DateTime? dataFim) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var inicio = dataInicio ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var fim = dataFim ?? inicio.AddMonths(1).AddDays(-1);
            var result = await service.GetRelatorioOcupacaoAsync(clinicaId, inicio, fim);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
        });
    }

}
