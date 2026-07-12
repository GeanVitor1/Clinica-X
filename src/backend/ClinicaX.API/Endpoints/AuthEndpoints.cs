using ClinicaX.Application.DTOs;
using ClinicaX.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.RateLimiting;

namespace ClinicaX.API.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Autenticação").RequireRateLimiting("auth");

        group.MapPost("/login", async Task<IResult> (LoginRequest request, IAuthService authService, IValidator<LoginRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await authService.LoginAsync(request);
            if (result.IsSuccess)
                return Results.Ok(result.Value);

            // 401 sem body genérico para não vazar se e-mail existe; mensagem no body para UX
            return Results.Json(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) }, statusCode: 401);
        })
        .AllowAnonymous()
        .WithName("Login");

        group.MapPost("/register", async Task<IResult> (
            RegisterRequest request,
            IAuthService authService,
            IValidator<RegisterRequest> validator) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await authService.RegisterAsync(request);
            return result.IsSuccess
                ? Results.Created("/api/auth/login", result.Value)
                : Results.BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Message)) });
        })
        .AllowAnonymous()
        .WithName("Register");

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
