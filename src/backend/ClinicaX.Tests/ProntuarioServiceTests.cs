using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
using Moq;

namespace ClinicaX.Tests;

public class ProntuarioServiceTests
{
    private readonly Mock<IProntuarioRepository> _repoMock = new();
    private readonly Mock<IPacienteRepository> _pacienteRepoMock = new();
    private readonly Mock<IEventoRepository> _eventoRepoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly ProntuarioService _service;

    private readonly Guid _clinicaId = Guid.NewGuid();
    private readonly Guid _pacienteId = Guid.NewGuid();
    private readonly Guid _prontuarioId = Guid.NewGuid();

    public ProntuarioServiceTests()
    {
        _service = new ProntuarioService(_repoMock.Object, _pacienteRepoMock.Object, _eventoRepoMock.Object, _uowMock.Object);
    }

    [Fact]
    public async Task CreateAsync_DeveCriarComSucesso()
    {
        _pacienteRepoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, _pacienteId, default))
            .ReturnsAsync(new Paciente { Id = _pacienteId, ClinicaId = _clinicaId, Nome = "Ana" });
        var request = new CreateProntuarioRequest(null, DateTime.UtcNow, "Descrição", "Diagnóstico", "Prescrição", "Evolução", "Dermatologia");
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Prontuario>(), default)).Returns(Task.CompletedTask);
        _uowMock.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var result = await _service.CreateAsync(_clinicaId, _pacienteId, request);

        Assert.True(result.IsSuccess);
        Assert.Equal("Descrição", result.Value.Descricao);
        Assert.Equal("Evolução", result.Value.Evolucao);
    }

    [Fact]
    public async Task GetByPacienteAsync_DeveRetornarLista()
    {
        _pacienteRepoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, _pacienteId, default))
            .ReturnsAsync(new Paciente { Id = _pacienteId, ClinicaId = _clinicaId, Nome = "Ana" });
        var prontuarios = new List<Prontuario>
        {
            new() { Id = _prontuarioId, ClinicaId = _clinicaId, PacienteId = _pacienteId, Descricao = "Atendimento" }
        };
        _repoMock.Setup(r => r.GetByPacienteAsync(_clinicaId, _pacienteId, default)).ReturnsAsync(prontuarios);

        var result = await _service.GetByPacienteAsync(_clinicaId, _pacienteId);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value);
    }

    [Fact]
    public async Task UploadAnexoAsync_DeveRetornarErro_QuandoTipoNaoPermitido()
    {
        using var stream = new MemoryStream();
        var result = await _service.UploadAnexoAsync(_clinicaId, _prontuarioId, "file.txt", "text/plain", 100, stream);

        Assert.True(result.IsFailed);
        Assert.Contains("Tipo de arquivo não permitido", result.Errors.Select(e => e.Message).First());
    }

    [Fact]
    public async Task UploadAnexoAsync_DeveRetornarErro_QuandoProntuarioNaoEncontrado()
    {
        _repoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, _prontuarioId, default)).ReturnsAsync((Prontuario?)null);

        using var stream = new MemoryStream();
        var result = await _service.UploadAnexoAsync(_clinicaId, _prontuarioId, "doc.pdf", "application/pdf", 5000, stream);

        Assert.True(result.IsFailed);
        Assert.Contains("Prontuário não encontrado.", result.Errors.Select(e => e.Message));
    }
}
