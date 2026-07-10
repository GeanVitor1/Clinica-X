using ClinicaX.Application.DTOs;
using ClinicaX.Application.Services;
using FluentValidation;

namespace ClinicaX.API.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Autenticação");

        group.MapPost("/login", async Task<IResult> (LoginRequest request, IAuthService authService, IValidator<LoginRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await authService.LoginAsync(request);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.Unauthorized();
        })
        .AllowAnonymous()
        .WithName("Login");

        group.MapPost("/forgot-password", async Task<IResult> (
            ForgotPasswordRequest request,
            IAuthService authService,
            IValidator<ForgotPasswordRequest> validator,
            IHostEnvironment env) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await authService.ForgotPasswordAsync(request, env.IsDevelopment());
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(string.Join("; ", result.Errors.Select(e => e.Message)));
        })
        .AllowAnonymous()
        .WithName("ForgotPassword");

        group.MapPost("/reset-password", async Task<IResult> (
            ResetPasswordRequest request,
            IAuthService authService,
            IValidator<ResetPasswordRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await authService.ResetPasswordAsync(request);
            return result.IsSuccess
                ? Results.Ok(new { message = "Senha redefinida com sucesso." })
                : Results.BadRequest(string.Join("; ", result.Errors.Select(e => e.Message)));
        })
        .AllowAnonymous()
        .WithName("ResetPassword");
    }
}
