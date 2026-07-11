using ClinicaX.API.Endpoints;
using ClinicaX.API.Hubs;
using ClinicaX.API.Middleware;
using ClinicaX.API.Services;
using ClinicaX.Application;
using ClinicaX.Application.Services;
using ClinicaX.Identity;
using ClinicaX.Identity.Services;
using ClinicaX.Infrastructure;
using ClinicaX.Persistence;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, cfg) =>
    cfg.ReadFrom.Configuration(ctx.Configuration));

builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddIdentityAuth(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IRealtimeNotifier, SignalRRealtimeNotifier>();

builder.Services.AddSignalR();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Angular", policy =>
        policy.WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200",
                "http://127.0.0.1:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    await ClinicaX.Persistence.Data.SeedData.InitializeAsync(app.Services);
}

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Angular");
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
app.MapHub<NotificationHub>("/hub/notificacoes");

app.MapGet("/", () => Results.Ok(new { message = "ClinicaX API rodando!" }))
   .AllowAnonymous();

try
{
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
