using ClinicaX.Application.DTOs;
using ClinicaX.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using static ClinicaX.API.Endpoints.EndpointHelpers;

namespace ClinicaX.API.Endpoints;

public static class AgendamentoEndpoints
{
    public static void MapAgendamentoEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/agendamentos").WithTags("Agendamentos").RequireAuthorization("ClinicaOwner");

        group.MapGet("/", async (IAgendamentoService service, HttpContext ctx, [FromQuery] DateTime? start, [FromQuery] DateTime? end) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var result = await service.GetByClinicaAsync(clinicaId, start, end);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
        });

        group.MapPost("/", async (CreateAgendamentoRequest request, IAgendamentoService service, IValidator<CreateAgendamentoRequest> validator, HttpContext ctx) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var clinicaId = GetClinicaId(ctx);
            var result = await service.CreateAsync(clinicaId, request);
            return result.IsSuccess ? Results.Created($"/api/agendamentos/{result.Value.Id}", result.Value) : Results.BadRequest(string.Join("; ", result.Errors.Select(e => e.Message)));
        });

        group.MapPut("/{id:guid}/remarcar", async (Guid id, RemarcarAgendamentoRequest request, IAgendamentoService service, IValidator<RemarcarAgendamentoRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var result = await service.RemarcarAsync(id, request);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(string.Join("; ", result.Errors.Select(e => e.Message)));
        });

        group.MapPut("/{id:guid}/cancelar", async (Guid id, CancelarAgendamentoRequest request, IAgendamentoService service, IValidator<CancelarAgendamentoRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var result = await service.CancelarAsync(id, request);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
        });
    }

}
