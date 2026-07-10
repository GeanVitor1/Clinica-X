using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
using FluentResults;
using Moq;

namespace ClinicaX.Tests;

public class ProntuarioServiceTests
{
    private readonly Mock<IProntuarioRepository> _repoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly ProntuarioService _service;

    private readonly Guid _clinicaId = Guid.NewGuid();
    private readonly Guid _pacienteId = Guid.NewGuid();
    private readonly Guid _prontuarioId = Guid.NewGuid();

    public ProntuarioServiceTests()
    {
        _service = new ProntuarioService(_repoMock.Object, _uowMock.Object);
    }

    [Fact]
    public async Task CreateAsync_DeveCriarComSucesso()
    {
        var request = new CreateProntuarioRequest(null, DateTime.UtcNow, "Descrição", "Diagnóstico", "Prescrição");
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Prontuario>(), default)).Returns(Task.CompletedTask);
        _uowMock.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var result = await _service.CreateAsync(_clinicaId, _pacienteId, request);

        Assert.True(result.IsSuccess);
        Assert.Equal("Descrição", result.Value.Descricao);
    }

    [Fact]
    public async Task GetByPacienteAsync_DeveRetornarLista()
    {
        var prontuarios = new List<Prontuario>
        {
            new() { Id = _prontuarioId, Descricao = "Atendimento" }
        };
        _repoMock.Setup(r => r.GetByPacienteAsync(_pacienteId, default)).ReturnsAsync(prontuarios);

        var result = await _service.GetByPacienteAsync(_pacienteId);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value);
    }

    [Fact]
    public async Task UploadAnexoAsync_DeveRetornarErro_QuandoTipoNaoPermitido()
    {
        using var stream = new MemoryStream();
        var result = await _service.UploadAnexoAsync(_prontuarioId, "file.txt", "text/plain", 100, stream);

        Assert.True(result.IsFailed);
        Assert.Contains("Tipo de arquivo não permitido. Apenas PDF, JPG e PNG.", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task UploadAnexoAsync_DeveRetornarErro_QuandoProntuarioNaoEncontrado()
    {
        _repoMock.Setup(r => r.GetByIdAsync(_prontuarioId, default)).ReturnsAsync((Prontuario?)null);

        using var stream = new MemoryStream();
        var result = await _service.UploadAnexoAsync(_prontuarioId, "doc.pdf", "application/pdf", 5000, stream);

        Assert.True(result.IsFailed);
        Assert.Contains("Prontuário não encontrado.", result.Errors.Select(e => e.Message));
    }
}
