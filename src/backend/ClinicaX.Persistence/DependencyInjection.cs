using ClinicaX.Application.Interfaces;
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
        var conn = configuration.GetConnectionString("DefaultConnection")
                   ?? $"Data Source={Path.Combine("data", "clinicax.db")}";

        var provider = configuration["Database:Provider"]
                       ?? DetectProvider(conn);

        services.AddDbContext<ClinicaXDbContext>(options =>
        {
            if (string.Equals(provider, "Sqlite", StringComparison.OrdinalIgnoreCase))
            {
                TryEnsureSqliteDirectory(conn);
                options.UseSqlite(conn);
            }
            else
            {
                options.UseSqlServer(conn);
            }

            // Não derruba o boot em nuvem por drift leve de snapshot de migration
            options.ConfigureWarnings(w =>
                w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        });

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

    private static string DetectProvider(string connectionString)
    {
        var cs = connectionString.Trim();
        if (cs.Contains(".db", StringComparison.OrdinalIgnoreCase) &&
            cs.Contains("Data Source=", StringComparison.OrdinalIgnoreCase) &&
            !cs.Contains("Initial Catalog=", StringComparison.OrdinalIgnoreCase) &&
            !cs.Contains("Database=", StringComparison.OrdinalIgnoreCase))
            return "Sqlite";
        return "SqlServer";
    }

    private static void TryEnsureSqliteDirectory(string connectionString)
    {
        try
        {
            const string prefix = "Data Source=";
            var idx = connectionString.IndexOf(prefix, StringComparison.OrdinalIgnoreCase);
            if (idx < 0) return;
            var rest = connectionString[(idx + prefix.Length)..];
            var end = rest.IndexOf(';');
            var path = (end >= 0 ? rest[..end] : rest).Trim().Trim('"');
            var dir = Path.GetDirectoryName(path);
            if (!string.IsNullOrWhiteSpace(dir))
                Directory.CreateDirectory(dir);
        }
        catch
        {
            /* ignore */
        }
    }
}
