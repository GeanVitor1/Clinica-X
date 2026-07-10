using ClinicaX.Application.DTOs;
using FluentResults;

namespace ClinicaX.Application.Services;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<Result<ForgotPasswordResponse>> ForgotPasswordAsync(ForgotPasswordRequest request, bool includeDevToken, CancellationToken ct = default);
    Task<Result> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default);
}
