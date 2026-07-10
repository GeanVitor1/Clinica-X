using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
using ClinicaX.Identity.Models;
using ClinicaX.Persistence.Data;
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
            var clinicaId = GetClinicaId(ctx);
            var clinica = await repo.GetByIdAsync(clinicaId);
            return clinica is null ? Results.NotFound() : Results.Ok(clinica);
        });

        group.MapPut("/", async (UpdateClinicaRequest request, IClinicaRepository repo, IUnitOfWork uow, HttpContext ctx) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var clinica = await repo.GetByIdAsync(clinicaId);
            if (clinica is null) return Results.NotFound();
            clinica.Nome = request.Nome;
            clinica.Email = request.Email;
            clinica.Telefone = request.Telefone;
            clinica.Endereco = request.Endereco;
            clinica.Plano = request.Plano;
            clinica.HorarioAbertura = request.HorarioAbertura;
            clinica.HorarioFechamento = request.HorarioFechamento;
            clinica.DiasFuncionamento = string.IsNullOrWhiteSpace(request.DiasFuncionamento)
                ? "1,2,3,4,5"
                : request.DiasFuncionamento;
            await repo.UpdateAsync(clinica);
            await uow.SaveChangesAsync();
            return Results.Ok(clinica);
        });

        group.MapPost("/change-password", async (ChangePasswordRequest request, HttpContext ctx, UserManager<ClinicaOwner> userManager) =>
        {
            var userId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId is null) return Results.Unauthorized();
            var user = await userManager.FindByIdAsync(userId);
            if (user is null) return Results.NotFound();
            var result = await userManager.ChangePasswordAsync(user, request.SenhaAtual, request.NovaSenha);
            return result.Succeeded ? Results.Ok() : Results.BadRequest(result.Errors.Select(e => e.Description));
        });

        group.MapPost("/reset-demo", async (ClinicaXDbContext context, UserManager<ClinicaOwner> userManager, RoleManager<IdentityRole> roleManager) =>
        {
            context.Pacientes.RemoveRange(context.Pacientes);
            context.Servicos.RemoveRange(context.Servicos);
            context.Agendamentos.RemoveRange(context.Agendamentos);
            context.Prontuarios.RemoveRange(context.Prontuarios);
            context.Anexos.RemoveRange(context.Anexos);
            context.Notificacoes.RemoveRange(context.Notificacoes);
            context.Eventos.RemoveRange(context.Eventos);
            await context.SaveChangesAsync();

            await SeedData.PopulateDemoDataAsync(context);
            return Results.Ok(new { message = "Dados demo restaurados com sucesso." });
        });
    }

}
