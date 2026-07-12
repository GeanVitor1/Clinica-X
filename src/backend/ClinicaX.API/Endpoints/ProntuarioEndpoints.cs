using ClinicaX.Application.DTOs;
using ClinicaX.Application.Services;
using FluentValidation;
using static ClinicaX.API.Endpoints.EndpointHelpers;

namespace ClinicaX.API.Endpoints;

public static class ProntuarioEndpoints
{
    public static void MapProntuarioEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/prontuarios").WithTags("Prontuários").RequireAuthorization("ClinicaOwner");

        group.MapGet("/paciente/{pacienteId:guid}", async (Guid pacienteId, IProntuarioService service, HttpContext ctx) =>
        {
            var result = await service.GetByPacienteAsync(GetClinicaId(ctx), pacienteId);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        group.MapPost("/paciente/{pacienteId:guid}", async (Guid pacienteId, CreateProntuarioRequest request, IProntuarioService service, IValidator<CreateProntuarioRequest> validator, HttpContext ctx) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var clinicaId = GetClinicaId(ctx);
            var result = await service.CreateAsync(clinicaId, pacienteId, request);
            return result.IsSuccess
                ? Results.Created($"/api/prontuarios/{result.Value.Id}", result.Value)
                : Results.BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateProntuarioRequest request, IProntuarioService service, IValidator<UpdateProntuarioRequest> validator, HttpContext ctx) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var result = await service.UpdateAsync(GetClinicaId(ctx), id, request);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { message = "Prontuário não encontrado." });
        });

        group.MapDelete("/{id:guid}", async (Guid id, IProntuarioService service, HttpContext ctx) =>
        {
            var result = await service.DeleteAsync(GetClinicaId(ctx), id);
            return result.IsSuccess ? Results.NoContent() : Results.NotFound();
        });

        group.MapPost("/{prontuarioId:guid}/anexos", async (Guid prontuarioId, HttpContext ctx, IProntuarioService service) =>
        {
            var file = ctx.Request.Form.Files.FirstOrDefault();
            if (file is null) return Results.BadRequest(new { message = "Nenhum arquivo enviado." });
            using var stream = file.OpenReadStream();
            var result = await service.UploadAnexoAsync(GetClinicaId(ctx), prontuarioId, file.FileName, file.ContentType, file.Length, stream);
            return result.IsSuccess
                ? Results.Created($"/api/prontuarios/{prontuarioId}/anexos", null)
                : Results.BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        });

        group.MapGet("/anexos/{anexoId:guid}", async (Guid anexoId, IProntuarioService service, HttpContext ctx) =>
        {
            var result = await service.DownloadAnexoAsync(GetClinicaId(ctx), anexoId);
            if (result.IsFailed) return Results.NotFound();
            var (content, contentType, nome) = result.Value;
            return Results.File(content, contentType, nome);
        });

        group.MapDelete("/anexos/{anexoId:guid}", async (Guid anexoId, IProntuarioService service, HttpContext ctx) =>
        {
            var result = await service.RemoveAnexoAsync(GetClinicaId(ctx), anexoId);
            return result.IsSuccess ? Results.NoContent() : Results.NotFound();
        });
    }
}
