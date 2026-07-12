using System.Threading.RateLimiting;
using ClinicaX.API.Endpoints;
using ClinicaX.API.Hosting;
using ClinicaX.API.Hubs;
using ClinicaX.API.Middleware;
using ClinicaX.API.Services;
using ClinicaX.Application;
using ClinicaX.Application.Services;
using ClinicaX.Identity;
using ClinicaX.Identity.Services;
using ClinicaX.Infrastructure;
using ClinicaX.Persistence;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Railway / containers: PORT dinâmico
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Zero-config: SQLite + JWT + demo + CORS aberto se variáveis não vierem
RuntimeBootstrap.ApplyCloudDefaults(builder);

builder.Host.UseSerilog((ctx, cfg) =>
    cfg.ReadFrom.Configuration(ctx.Configuration)
       .WriteTo.Console());

// Proxy headers (Railway / reverse proxy)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddIdentityAuth(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IRealtimeNotifier, SignalRRealtimeNotifier>();

builder.Services.AddSignalR();
builder.Services.AddOpenApi();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.PermitLimit = 60;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
    options.AddFixedWindowLimiter("public", opt =>
    {
        opt.PermitLimit = 120;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

// CORS: AllowAll (default nuvem) OU lista explícita + previews Vercel
var allowAll = builder.Configuration.GetValue("Cors:AllowAll", false);
var allowVercelPreviews = builder.Configuration.GetValue("Cors:AllowVercelPreviews", true);

var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
    ??
    [
        "http://localhost:4200",
        "https://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost",
        "http://localhost:80"
    ];

var corsCsv = builder.Configuration["Cors:Origins"];
if (!string.IsNullOrWhiteSpace(corsCsv) && corsCsv.Contains(','))
{
    corsOrigins = corsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}

// Indexed env vars Cors__Origins__0, __1...
var indexed = new List<string>();
for (var i = 0; i < 20; i++)
{
    var o = builder.Configuration[$"Cors:Origins:{i}"];
    if (!string.IsNullOrWhiteSpace(o)) indexed.Add(o.Trim());
}
if (indexed.Count > 0)
    corsOrigins = indexed.Concat(corsOrigins ?? []).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();

var originSet = new HashSet<string>(
    (corsOrigins ?? []).Where(o => !string.IsNullOrWhiteSpace(o)),
    StringComparer.OrdinalIgnoreCase);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Angular", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                if (allowAll) return true;
                if (originSet.Contains(origin)) return true;
                if (allowVercelPreviews &&
                    Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
                    (uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase)
                     || uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)))
                    return true;
                return false;
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseForwardedHeaders();

// Migra/cria banco + seed (não derruba a API se seed falhar parcialmente)
try
{
    var enableDemo = app.Configuration.GetValue("Seed:EnableDemo", true);
    await ClinicaX.Persistence.Data.SeedData.InitializeAsync(app.Services, enableDemo);
}
catch (Exception ex)
{
    Log.Fatal(ex, "Falha ao inicializar banco/seed. Verifique ConnectionStrings e permissões de escrita em /app/data");
    throw;
}

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Angular");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapPacienteEndpoints();
app.MapServicoEndpoints();
app.MapAgendamentoEndpoints();
app.MapProntuarioEndpoints();
app.MapNotificacaoEndpoints();
app.MapDashboardEndpoints();
app.MapEventoEndpoints();
app.MapReportEndpoints();
app.MapConfigEndpoints();
app.MapModulosEndpoints();
app.MapHub<NotificationHub>("/hub/notificacoes");

app.MapGet("/", () => Results.Ok(new
{
    message = "ClinicaX API rodando!",
    env = app.Environment.EnvironmentName,
    provider = app.Configuration["Database:Provider"] ?? "auto",
    demo = app.Configuration.GetValue("Seed:EnableDemo", true),
    utc = DateTime.UtcNow
}))
.AllowAnonymous();

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    utc = DateTime.UtcNow,
    provider = app.Configuration["Database:Provider"] ?? "auto"
}))
.AllowAnonymous()
.WithName("Health");

try
{
    Log.Information("ClinicaX API listening. Provider={Provider} Demo={Demo}",
        app.Configuration["Database:Provider"],
        app.Configuration.GetValue("Seed:EnableDemo", true));
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
