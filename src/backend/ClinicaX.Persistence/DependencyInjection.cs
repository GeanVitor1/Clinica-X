using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Identity.Models;
using ClinicaX.Persistence.Data;
using ClinicaX.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using Microsoft.Extensions.DependencyInjection;

namespace ClinicaX.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ClinicaXDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddIdentity<ClinicaOwner, IdentityRole>(options =>
        {
            // Demo credentials use a short PIN-style password (1234)
            options.Password.RequireDigit = false;
            options.Password.RequiredLength = 4;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireLowercase = false;
            options.User.RequireUniqueEmail = true;
        })
        .AddEntityFrameworkStores<ClinicaXDbContext>()
        .AddDefaultTokenProviders();

        services.AddScoped<IClinicaRepository, ClinicaRepository>();
        services.AddScoped<IPacienteRepository, PacienteRepository>();
        services.AddScoped<IServicoRepository, ServicoRepository>();
        services.AddScoped<IAgendamentoRepository, AgendamentoRepository>();
        services.AddScoped<IProntuarioRepository, ProntuarioRepository>();
        services.AddScoped<INotificacaoRepository, NotificacaoRepository>();
        services.AddScoped<IEventoRepository, EventoRepository>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<ClinicaXDbContext>());

        return services;
    }
}
