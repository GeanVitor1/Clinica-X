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
            options.Password.RequireDigit = true;
            options.Password.RequiredLength = 8;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = true;
            options.User.RequireUniqueEmail = true;
            options.Lockout.AllowedForNewUsers = true;
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
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
        services.AddScoped<IModulosRepository, ModulosRepository>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<ClinicaXDbContext>());

        return services;
    }
}
