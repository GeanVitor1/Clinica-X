using ClinicaX.Application.DTOs;
using ClinicaX.Application.Services;
using FluentValidation;
using static ClinicaX.API.Endpoints.EndpointHelpers;

namespace ClinicaX.API.Endpoints;

public static class ServicoEndpoints
{
    public static void MapServicoEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/servicos").WithTags("Serviços").RequireAuthorization("ClinicaOwner");

        group.MapGet("/", async (IServicoService service, HttpContext ctx) =>
        {
            var clinicaId = GetClinicaId(ctx);
            var result = await service.GetAllAsync(clinicaId);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
        });

        group.MapPost("/", async (CreateServicoRequest request, IServicoService service, IValidator<CreateServicoRequest> validator, HttpContext ctx) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var clinicaId = GetClinicaId(ctx);
            var result = await service.CreateAsync(clinicaId, request);
            return result.IsSuccess ? Results.Created($"/api/servicos/{result.Value.Id}", result.Value) : Results.BadRequest(result.Errors);
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateServicoRequest request, IServicoService service, IValidator<UpdateServicoRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var result = await service.UpdateAsync(id, request);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
        });

        group.MapDelete("/{id:guid}", async (Guid id, IServicoService service) =>
        {
            var result = await service.DeleteAsync(id);
            return result.IsSuccess ? Results.NoContent() : Results.NotFound();
        });
    }

}
