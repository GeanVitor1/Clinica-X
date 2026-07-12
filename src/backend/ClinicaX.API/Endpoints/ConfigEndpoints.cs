using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Identity.Models;
using ClinicaX.Persistence.Data;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using static ClinicaX.API.Endpoints.EndpointHelpers;

namespace ClinicaX.API.Endpoints;

public static class ConfigEndpoints
{
    public static void MapConfigEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/config").WithTags("Configurações").RequireAuthorization("ClinicaOwner");

        group.MapGet("/", async (IClinicaRepository repo, HttpContext ctx) =>
        {
            if (RequireClinicaId(ctx, out var clinicaId) is { } deny) return deny;
            var clinica = await repo.GetByIdAsync(clinicaId);
            return clinica is null ? Results.NotFound() : Results.Ok(clinica);
        });

        group.MapPut("/", async (
            UpdateClinicaRequest request,
            IClinicaRepository repo,
            IUnitOfWork uow,
            UserManager<ClinicaOwner> userManager,
            IValidator<UpdateClinicaRequest> validator,
            HttpContext ctx) =>
        {
            if (RequireClinicaId(ctx, out var clinicaId) is { } deny) return deny;

            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var clinica = await repo.GetByIdAsync(clinicaId);
            if (clinica is null) return Results.NotFound();

            var emailNovo = request.Email.Trim().ToLowerInvariant();
            var emailAntigo = clinica.Email;

            clinica.Nome = request.Nome.Trim();
            clinica.Email = emailNovo;
            clinica.Telefone = request.Telefone.Trim();
            clinica.Endereco = request.Endereco.Trim();
            clinica.Plano = request.Plano;
            clinica.HorarioAbertura = request.HorarioAbertura;
            clinica.HorarioFechamento = request.HorarioFechamento;
            clinica.DiasFuncionamento = string.IsNullOrWhiteSpace(request.DiasFuncionamento)
                ? "1,2,3,4,5"
                : request.DiasFuncionamento;

            await repo.UpdateAsync(clinica);
            await uow.SaveChangesAsync();

            // Sincroniza Identity se o e-mail da clínica mudou
            if (!string.Equals(emailAntigo, emailNovo, StringComparison.OrdinalIgnoreCase))
            {
                var userId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId is not null)
                {
                    var user = await userManager.FindByIdAsync(userId);
                    if (user is not null)
                    {
                        user.Email = emailNovo;
                        user.UserName = emailNovo;
                        user.NormalizedEmail = emailNovo.ToUpperInvariant();
                        user.NormalizedUserName = emailNovo.ToUpperInvariant();
                        await userManager.UpdateAsync(user);
                    }
                }
            }

            return Results.Ok(clinica);
        });

        group.MapPost("/change-password", async (
            ChangePasswordRequest request,
            IValidator<ChangePasswordRequest> validator,
            HttpContext ctx,
            UserManager<ClinicaOwner> userManager) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var userId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId is null) return Results.Unauthorized();
            var user = await userManager.FindByIdAsync(userId);
            if (user is null) return Results.NotFound();
            var result = await userManager.ChangePasswordAsync(user, request.SenhaAtual, request.NovaSenha);
            return result.Succeeded ? Results.Ok() : Results.BadRequest(result.Errors.Select(e => e.Description));
        });

        group.MapPost("/reset-demo", async (ClinicaXDbContext context, IModulosRepository modulos, HttpContext ctx) =>
        {
            if (RequireClinicaId(ctx, out var callerClinicaId) is { } deny) return deny;
            var clinica = await context.Clinicas.FirstOrDefaultAsync(c => c.Id == callerClinicaId && (c.IsDemo || c.Email == SeedData.DemoEmail));
            if (clinica is null)
                return Results.BadRequest(new { message = "Reset disponível apenas para a conta demo da sua clínica." });

            var cid = clinica.Id;
            context.Anexos.RemoveRange(context.Anexos.Where(a => context.Prontuarios.Any(p => p.Id == a.ProntuarioId && p.ClinicaId == cid)));
            context.Prontuarios.RemoveRange(context.Prontuarios.Where(p => p.ClinicaId == cid));
            context.Agendamentos.RemoveRange(context.Agendamentos.Where(a => a.ClinicaId == cid));
            context.Notificacoes.RemoveRange(context.Notificacoes.Where(n => n.ClinicaId == cid));
            context.Eventos.RemoveRange(context.Eventos.Where(e => e.ClinicaId == cid));
            context.Pacientes.RemoveRange(context.Pacientes.Where(p => p.ClinicaId == cid));
            context.Servicos.RemoveRange(context.Servicos.Where(s => s.ClinicaId == cid));
            await modulos.ClearModulosByClinicaAsync(cid);
            await context.SaveChangesAsync();

            await SeedData.PopulateDemoDataAsync(context);
            return Results.Ok(new { message = "Dados demo restaurados com sucesso." });
        });
    }
}
