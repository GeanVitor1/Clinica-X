using ClinicaX.Application.DTOs;
using ClinicaX.Application.Services;
using ClinicaX.Identity.Models;
using FluentResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace ClinicaX.Identity.Services;

public class AuthService : IAuthService
{
    private readonly SignInManager<ClinicaOwner> _signInManager;
    private readonly UserManager<ClinicaOwner> _userManager;
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        SignInManager<ClinicaOwner> signInManager,
        UserManager<ClinicaOwner> userManager,
        IJwtService jwtService,
        ILogger<AuthService> logger)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _jwtService = jwtService;
        _logger = logger;
    }

    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Result.Fail("Email ou senha inválidos.");

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Senha, false);
        if (!result.Succeeded)
            return Result.Fail("Email ou senha inválidos.");

        var token = _jwtService.GenerateToken(user);
        return Result.Ok(new LoginResponse(token, user.UserName ?? user.Email!, user.Email!));
    }

    public async Task<Result<ForgotPasswordResponse>> ForgotPasswordAsync(ForgotPasswordRequest request, bool includeDevToken, CancellationToken ct = default)
    {
        const string generic = "Se o e-mail existir, enviamos as instruções de redefinição.";
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Result.Ok(new ForgotPasswordResponse(generic, null, null));

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var resetUrl = $"/auth/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={Uri.EscapeDataString(token)}";

        _logger.LogInformation(
            "Reset de senha solicitado para {Email}. Token gerado (dev). URL: {Url}",
            user.Email, resetUrl);

        // Em produção: enviar e-mail com resetUrl. Em dev, devolvemos o token para facilitar testes.
        return Result.Ok(includeDevToken
            ? new ForgotPasswordResponse(generic, token, resetUrl)
            : new ForgotPasswordResponse(generic, null, null));
    }

    public async Task<Result> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Result.Fail("Não foi possível redefinir a senha.");

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NovaSenha);
        if (!result.Succeeded)
            return Result.Fail(string.Join("; ", result.Errors.Select(e => e.Description)));

        return Result.Ok();
    }
}
