using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
using Moq;

namespace ClinicaX.Tests;

public class ServicoServiceTests
{
    private readonly Mock<IServicoRepository> _repoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly ServicoService _service;

    private readonly Guid _clinicaId = Guid.NewGuid();
    private readonly Guid _servicoId = Guid.NewGuid();

    public ServicoServiceTests()
    {
        _service = new ServicoService(_repoMock.Object, _uowMock.Object);
    }

    [Fact]
    public async Task GetAllAsync_DeveRetornarLista()
    {
        var servicos = new List<Servico>
        {
            new() { Id = _servicoId, Nome = "Consulta", Valor = 150, PercentualComissao = 10 }
        };
        _repoMock.Setup(r => r.GetAllAsync(_clinicaId, default)).ReturnsAsync(servicos);

        var result = await _service.GetAllAsync(_clinicaId);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value);
        Assert.Equal("Consulta", result.Value[0].Nome);
        Assert.Equal(10, result.Value[0].PercentualComissao);
    }

    [Fact]
    public async Task CreateAsync_DeveCriarComSucesso()
    {
        var request = new CreateServicoRequest("Exame", null, 60, 200, null, 15);
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Servico>(), default)).Returns(Task.CompletedTask);
        _uowMock.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsSuccess);
        Assert.Equal("Exame", result.Value.Nome);
        Assert.Equal(15, result.Value.PercentualComissao);
    }

    [Fact]
    public async Task UpdateAsync_DeveAtualizarComSucesso()
    {
        var servico = new Servico { Id = _servicoId, ClinicaId = _clinicaId, Nome = "Antigo", Valor = 100 };
        _repoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, _servicoId, default)).ReturnsAsync(servico);
        _uowMock.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var request = new UpdateServicoRequest("Atualizado", null, 30, 250, null, 20);
        var result = await _service.UpdateAsync(_clinicaId, _servicoId, request);

        Assert.True(result.IsSuccess);
        Assert.Equal("Atualizado", servico.Nome);
        Assert.Equal(250, servico.Valor);
        Assert.Equal(20, servico.PercentualComissao);
    }

    [Fact]
    public async Task DeleteAsync_DeveDesativarComSucesso()
    {
        var servico = new Servico { Id = _servicoId, ClinicaId = _clinicaId, Ativo = true };
        _repoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, _servicoId, default)).ReturnsAsync(servico);
        _uowMock.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var result = await _service.DeleteAsync(_clinicaId, _servicoId);

        Assert.True(result.IsSuccess);
        Assert.False(servico.Ativo);
    }
}
