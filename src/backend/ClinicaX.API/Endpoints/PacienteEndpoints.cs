using ClinicaX.Application.DTOs;
using ClinicaX.Application.Services;
using FluentValidation;
using static ClinicaX.API.Endpoints.EndpointHelpers;

namespace ClinicaX.API.Endpoints;

public static class PacienteEndpoints
{
    public static void MapPacienteEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/pacientes").WithTags("Pacientes").RequireAuthorization("ClinicaOwner");

        group.MapGet("/", async (
            IPacienteService service,
            HttpContext ctx,
            string? search,
            int page = 1,
            int pageSize = 20,
            bool? ativo = true) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var result = await service.GetAllAsync(clinicaId, search, page, pageSize, ativo);
            return result.IsSuccess
                ? Results.Ok(new { items = result.Value.Items, total = result.Value.Total, page, pageSize })
                : Results.NotFound();
        });

        group.MapGet("/{id:guid}", async (Guid id, IPacienteService service, HttpContext ctx) =>
        {
            var result = await service.GetByIdAsync(GetClinicaId(ctx), id);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { message = "Paciente não encontrado." });
        });

        group.MapGet("/{id:guid}/historico", async (Guid id, IPacienteService service, HttpContext ctx) =>
        {
            var result = await service.GetHistoricoAsync(GetClinicaId(ctx), id);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        group.MapPost("/", async (CreatePacienteRequest request, IPacienteService service, IValidator<CreatePacienteRequest> validator, HttpContext ctx) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var clinicaId = GetClinicaId(ctx);
            var result = await service.CreateAsync(clinicaId, request);
            return result.IsSuccess
                ? Results.Created($"/api/pacientes/{result.Value.Id}", result.Value)
                : Results.BadRequest(result.Errors);
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdatePacienteRequest request, IPacienteService service, IValidator<UpdatePacienteRequest> validator, HttpContext ctx) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var result = await service.UpdateAsync(GetClinicaId(ctx), id, request);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { message = "Paciente não encontrado." });
        });

        group.MapDelete("/{id:guid}", async (Guid id, IPacienteService service, HttpContext ctx) =>
        {
            var result = await service.DeleteAsync(GetClinicaId(ctx), id);
            return result.IsSuccess ? Results.NoContent() : Results.NotFound();
        });
    }
}
