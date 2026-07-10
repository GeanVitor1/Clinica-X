using ClinicaX.Application.Services;
using FluentValidation;
using Mapster;
using Microsoft.Extensions.DependencyInjection;

namespace ClinicaX.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IPacienteService, PacienteService>();
        services.AddScoped<IServicoService, ServicoService>();
        services.AddScoped<IAgendamentoService, AgendamentoService>();
        services.AddScoped<IProntuarioService, ProntuarioService>();
        services.AddScoped<IReportService, ReportService>();
        TypeAdapterConfig.GlobalSettings.Default.MapToConstructor(true);
        return services;
    }
}
