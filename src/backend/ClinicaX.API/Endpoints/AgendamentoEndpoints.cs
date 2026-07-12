using ClinicaX.Application.DTOs;
using ClinicaX.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using static ClinicaX.API.Endpoints.EndpointHelpers;

namespace ClinicaX.API.Endpoints;

public static class AgendamentoEndpoints
{
    public static void MapAgendamentoEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/agendamentos").WithTags("Agendamentos").RequireAuthorization("ClinicaOwner");

        group.MapGet("/", async (
            IAgendamentoService service,
            HttpContext ctx,
            [FromQuery] DateTime? start,
            [FromQuery] DateTime? end,
            [FromQuery] string? profissional,
            [FromQuery] string? sala,
            [FromQuery] string? status) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var result = await service.GetByClinicaAsync(clinicaId, start, end, profissional, sala, status);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(string.Join("; ", result.Errors.Select(e => e.Message)));
        });

        group.MapGet("/{id:guid}", async (Guid id, IAgendamentoService service, HttpContext ctx) =>
        {
            var result = await service.GetByIdAsync(GetClinicaId(ctx), id);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        group.MapPost("/", async (CreateAgendamentoRequest request, IAgendamentoService service, IValidator<CreateAgendamentoRequest> validator, HttpContext ctx) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var clinicaId = GetClinicaId(ctx);
            var result = await service.CreateAsync(clinicaId, request);
            return result.IsSuccess
                ? Results.Created($"/api/agendamentos/{result.Value.Id}", result.Value)
                : Results.BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        group.MapPut("/{id:guid}/remarcar", async (Guid id, RemarcarAgendamentoRequest request, IAgendamentoService service, IValidator<RemarcarAgendamentoRequest> validator, HttpContext ctx) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var result = await service.RemarcarAsync(GetClinicaId(ctx), id, request);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        group.MapPut("/{id:guid}/cancelar", async (Guid id, CancelarAgendamentoRequest request, IAgendamentoService service, IValidator<CancelarAgendamentoRequest> validator, HttpContext ctx) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var result = await service.CancelarAsync(GetClinicaId(ctx), id, request);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        group.MapPut("/{id:guid}/confirmar", async (Guid id, IAgendamentoService service, HttpContext ctx) =>
        {
            var result = await service.ConfirmarAsync(GetClinicaId(ctx), id);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        group.MapPut("/{id:guid}/realizar", async (Guid id, IAgendamentoService service, HttpContext ctx) =>
        {
            var result = await service.MarcarRealizadoAsync(GetClinicaId(ctx), id);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        group.MapPut("/{id:guid}/falta", async (Guid id, IAgendamentoService service, HttpContext ctx) =>
        {
            var result = await service.MarcarFaltaAsync(GetClinicaId(ctx), id);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        // Bloqueios de horário
        group.MapGet("/bloqueios", async (IAgendamentoService service, HttpContext ctx, DateTime? start, DateTime? end) =>
        {
            var result = await service.ListBloqueiosAsync(GetClinicaId(ctx), start, end);
            return Results.Ok(result.Value);
        });

        group.MapPost("/bloqueios", async (CreateBloqueioAgendaRequest request, IAgendamentoService service, HttpContext ctx) =>
        {
            var result = await service.CreateBloqueioAsync(GetClinicaId(ctx), request);
            return result.IsSuccess
                ? Results.Created($"/api/agendamentos/bloqueios/{result.Value.Id}", result.Value)
                : Results.BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        group.MapDelete("/bloqueios/{id:guid}", async (Guid id, IAgendamentoService service, HttpContext ctx) =>
        {
            var result = await service.DeleteBloqueioAsync(GetClinicaId(ctx), id);
            return result.IsSuccess ? Results.NoContent() : Results.NotFound(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        // Confirmação pública — POST preferido (evita prefetch de e-mail/bots)
        app.MapPost("/api/public/confirmar/{token}", async (string token, IAgendamentoService service) =>
        {
            var result = await service.ConfirmarPorTokenAsync(token);
            if (!result.IsSuccess || result.Value is null)
                return Results.BadRequest(new { sucesso = false, mensagem = "Não foi possível confirmar." });
            return result.Value.Sucesso
                ? Results.Ok(result.Value)
                : Results.BadRequest(result.Value);
        })
        .AllowAnonymous()
        .RequireRateLimiting("public")
        .WithTags("Agendamentos")
        .WithName("ConfirmarAgendamentoPublico");

        // GET legado: apenas consulta status sem mutar? Mantido como POST-only para segurança.
        // Frontend usa POST.
    }
}
