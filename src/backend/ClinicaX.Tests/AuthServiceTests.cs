using ClinicaX.Application.DTOs;
using ClinicaX.Application.Services;
using ClinicaX.Identity.Models;
using ClinicaX.Identity.Services;
using FluentResults;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Moq;

namespace ClinicaX.Tests;

public class AuthServiceTests
{
    private readonly Mock<SignInManager<ClinicaOwner>> _signInManagerMock;
    private readonly Mock<UserManager<ClinicaOwner>> _userManagerMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        _userManagerMock = new Mock<UserManager<ClinicaOwner>>(
            Mock.Of<IUserStore<ClinicaOwner>>(), null!, null!, null!, null!, null!, null!, null!, null!);
        _signInManagerMock = new Mock<SignInManager<ClinicaOwner>>(
            _userManagerMock.Object,
            Mock.Of<IHttpContextAccessor>(),
            Mock.Of<IUserClaimsPrincipalFactory<ClinicaOwner>>(),
            null!, null!, null!, null!);
        _jwtServiceMock = new Mock<IJwtService>();
        _service = new AuthService(
            _signInManagerMock.Object,
            _userManagerMock.Object,
            _jwtServiceMock.Object,
            Mock.Of<ILogger<AuthService>>());
    }

    [Fact]
    public async Task LoginAsync_DeveRetornarToken_QuandoCredenciaisValidas()
    {
        var email = "demo@clinica.com";
        var senha = "1234";
        var user = new ClinicaOwner { UserName = email, Email = email };
        _userManagerMock.Setup(u => u.FindByEmailAsync(email)).ReturnsAsync(user);
        _signInManagerMock.Setup(s => s.CheckPasswordSignInAsync(user, senha, false))
            .ReturnsAsync(SignInResult.Success);
        _jwtServiceMock.Setup(j => j.GenerateToken(user)).Returns("token-jwt");

        var request = new LoginRequest(email, senha);
        var result = await _service.LoginAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Equal("token-jwt", result.Value.Token);
    }

    [Fact]
    public async Task LoginAsync_DeveRetornarErro_QuandoEmailNaoEncontrado()
    {
        _userManagerMock.Setup(u => u.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync((ClinicaOwner?)null);

        var request = new LoginRequest("nao@existe.com", "senha");
        var result = await _service.LoginAsync(request);

        Assert.True(result.IsFailed);
        Assert.Contains("Email ou senha inválidos.", result.Errors.Select(e => e.Message));
    }
}
