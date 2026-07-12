using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
using ClinicaX.Identity.Models;
using ClinicaX.Identity.Services;
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
    private readonly Mock<IClinicaRepository> _clinicaRepoMock;
    private readonly Mock<IUnitOfWork> _uowMock;
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
        _clinicaRepoMock = new Mock<IClinicaRepository>();
        _uowMock = new Mock<IUnitOfWork>();
        _service = new AuthService(
            _signInManagerMock.Object,
            _userManagerMock.Object,
            _jwtServiceMock.Object,
            _clinicaRepoMock.Object,
            _uowMock.Object,
            Mock.Of<ILogger<AuthService>>());
    }

    [Fact]
    public async Task LoginAsync_DeveRetornarToken_QuandoCredenciaisValidas()
    {
        var email = "demo@clinica.com";
        var senha = "Demo@1234";
        var clinicaId = Guid.NewGuid();
        var user = new ClinicaOwner { UserName = email, Email = email, ClinicaId = clinicaId };
        _userManagerMock.Setup(u => u.FindByEmailAsync(email)).ReturnsAsync(user);
        _signInManagerMock.Setup(s => s.CheckPasswordSignInAsync(user, senha, true))
            .ReturnsAsync(SignInResult.Success);
        _jwtServiceMock.Setup(j => j.GenerateToken(user)).Returns("token-jwt");
        _clinicaRepoMock.Setup(c => c.GetByIdAsync(clinicaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Clinica { Id = clinicaId, Email = email, IsDemo = true, Ativo = true });

        var request = new LoginRequest(email, senha);
        var result = await _service.LoginAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Equal("token-jwt", result.Value.Token);
        Assert.True(result.Value.IsDemo);
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

    [Fact]
    public async Task RegisterAsync_DeveCriarClinicaReal_SemIsDemo()
    {
        var email = "nova@clinica.com";
        _userManagerMock.Setup(u => u.FindByEmailAsync(email)).ReturnsAsync((ClinicaOwner?)null);
        _clinicaRepoMock.Setup(c => c.GetByEmailAsync(email, It.IsAny<CancellationToken>())).ReturnsAsync((Clinica?)null);
        _clinicaRepoMock.Setup(c => c.AddAsync(It.IsAny<Clinica>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask)
            .Callback<Clinica, CancellationToken>((cl, _) => cl.Id = Guid.NewGuid());
        _uowMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _userManagerMock.Setup(u => u.CreateAsync(It.IsAny<ClinicaOwner>(), "Senha@123"))
            .ReturnsAsync(IdentityResult.Success);
        _userManagerMock.Setup(u => u.AddToRoleAsync(It.IsAny<ClinicaOwner>(), "ClinicaOwner"))
            .ReturnsAsync(IdentityResult.Success);
        _jwtServiceMock.Setup(j => j.GenerateToken(It.IsAny<ClinicaOwner>())).Returns("token-novo");

        var result = await _service.RegisterAsync(new RegisterRequest(
            "Clínica Nova", email, "Senha@123", "(11) 99999-0000", "Rua A, 1", "Dr. João"));

        Assert.True(result.IsSuccess);
        Assert.False(result.Value.IsDemo);
        Assert.Equal("token-novo", result.Value.Token);
        _clinicaRepoMock.Verify(c => c.AddAsync(It.Is<Clinica>(x => x.IsDemo == false && x.Nome == "Clínica Nova"), It.IsAny<CancellationToken>()), Times.Once);
    }
}
