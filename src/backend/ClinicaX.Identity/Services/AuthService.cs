using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
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
    private readonly IClinicaRepository _clinicaRepo;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        SignInManager<ClinicaOwner> signInManager,
        UserManager<ClinicaOwner> userManager,
        IJwtService jwtService,
        IClinicaRepository clinicaRepo,
        IUnitOfWork uow,
        ILogger<AuthService> logger)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _jwtService = jwtService;
        _clinicaRepo = clinicaRepo;
        _uow = uow;
        _logger = logger;
    }

    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Result.Fail("Email ou senha inválidos.");

        // lockoutOnFailure: true — protege contra brute force
        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Senha, lockoutOnFailure: true);
        if (result.IsLockedOut)
            return Result.Fail("Conta temporariamente bloqueada por tentativas inválidas. Tente novamente em alguns minutos.");
        if (!result.Succeeded)
            return Result.Fail("Email ou senha inválidos.");

        var clinica = await _clinicaRepo.GetByIdAsync(user.ClinicaId, ct);
        if (clinica is null || !clinica.Ativo)
            return Result.Fail("Clínica inativa ou não encontrada. Contate o suporte.");

        var token = _jwtService.GenerateToken(user);
        return Result.Ok(new LoginResponse(
            token,
            user.UserName ?? user.Email!,
            user.Email!,
            clinica.IsDemo,
            user.ClinicaId));
    }

    public async Task<Result<LoginResponse>> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
            return Result.Fail("Já existe uma conta com este e-mail.");

        var existingClinica = await _clinicaRepo.GetByEmailAsync(request.Email, ct);
        if (existingClinica is not null && existingClinica.Ativo)
            return Result.Fail("Já existe uma clínica com este e-mail.");

        // Reativa clínica órfã do mesmo e-mail se existir inativa
        Clinica clinica;
        if (existingClinica is not null && !existingClinica.Ativo)
        {
            clinica = existingClinica;
            clinica.Ativo = true;
            clinica.Nome = request.NomeClinica.Trim();
            clinica.Telefone = request.Telefone.Trim();
            clinica.Endereco = string.IsNullOrWhiteSpace(request.Endereco) ? "A definir" : request.Endereco.Trim();
            await _clinicaRepo.UpdateAsync(clinica, ct);
            await _uow.SaveChangesAsync(ct);
        }
        else
        {
            clinica = new Clinica
            {
                Nome = request.NomeClinica.Trim(),
                Email = request.Email.Trim().ToLowerInvariant(),
                Telefone = request.Telefone.Trim(),
                Endereco = string.IsNullOrWhiteSpace(request.Endereco) ? "A definir" : request.Endereco.Trim(),
                Plano = "Mensal",
                HorarioAbertura = new TimeSpan(8, 0, 0),
                HorarioFechamento = new TimeSpan(18, 0, 0),
                DiasFuncionamento = "1,2,3,4,5",
                IsDemo = false
            };

            await _clinicaRepo.AddAsync(clinica, ct);
            await _uow.SaveChangesAsync(ct);
        }

        var owner = new ClinicaOwner
        {
            UserName = clinica.Email,
            Email = clinica.Email,
            EmailConfirmed = true,
            ClinicaId = clinica.Id
        };

        var create = await _userManager.CreateAsync(owner, request.Senha);
        if (!create.Succeeded)
        {
            // Rollback: remove clínica recém-criada se não era reativação de órfã
            if (existingClinica is null)
            {
                clinica.Ativo = false;
                await _clinicaRepo.UpdateAsync(clinica, ct);
                await _uow.SaveChangesAsync(ct);
            }
            return Result.Fail(string.Join("; ", create.Errors.Select(e => e.Description)));
        }

        await _userManager.AddToRoleAsync(owner, "ClinicaOwner");
        _logger.LogInformation("Nova clínica registrada: {Email} ({ClinicaId})", clinica.Email, clinica.Id);

        var token = _jwtService.GenerateToken(owner);
        var nome = string.IsNullOrWhiteSpace(request.NomeResponsavel)
            ? clinica.Nome
            : request.NomeResponsavel.Trim();

        return Result.Ok(new LoginResponse(token, nome, clinica.Email, IsDemo: false, ClinicaId: clinica.Id));
    }

    public async Task<Result<ForgotPasswordResponse>> ForgotPasswordAsync(ForgotPasswordRequest request, bool includeDevToken, CancellationToken ct = default)
    {
        const string generic = "Se o e-mail existir, enviamos as instruções de redefinição.";
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Result.Ok(new ForgotPasswordResponse(generic, null, null));

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var resetUrl = $"/auth/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={Uri.EscapeDataString(token)}";

        // Em produção NÃO logar o token completo
        if (includeDevToken)
            _logger.LogInformation("Reset de senha (dev) para {Email}. URL: {Url}", user.Email, resetUrl);
        else
            _logger.LogInformation("Reset de senha solicitado para {Email}", user.Email);

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
