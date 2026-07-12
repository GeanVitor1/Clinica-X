using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
using Moq;

namespace ClinicaX.Tests;

public class PacienteServiceTests
{
    private readonly Mock<IPacienteRepository> _repoMock = new();
    private readonly Mock<IAgendamentoRepository> _agendamentoRepoMock = new();
    private readonly Mock<IServicoRepository> _servicoRepoMock = new();
    private readonly Mock<IEventoRepository> _eventoRepoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly PacienteService _service;

    private readonly Guid _clinicaId = Guid.NewGuid();
    private readonly Guid _pacienteId = Guid.NewGuid();

    public PacienteServiceTests()
    {
        _agendamentoRepoMock
            .Setup(r => r.GetUltimoPorPacientesAsync(It.IsAny<IEnumerable<Guid>>(), default))
            .ReturnsAsync(new Dictionary<Guid, Agendamento>());
        _service = new PacienteService(
            _repoMock.Object,
            _agendamentoRepoMock.Object,
            _servicoRepoMock.Object,
            _eventoRepoMock.Object,
            _uowMock.Object);
    }

    [Fact]
    public async Task GetByIdAsync_DeveRetornarPaciente_QuandoEncontrado()
    {
        var paciente = new Paciente { Id = _pacienteId, ClinicaId = _clinicaId, Nome = "João", Cpf = "123" };
        _repoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, _pacienteId, default)).ReturnsAsync(paciente);

        var result = await _service.GetByIdAsync(_clinicaId, _pacienteId);

        Assert.True(result.IsSuccess);
        Assert.Equal("João", result.Value.Nome);
    }

    [Fact]
    public async Task GetByIdAsync_DeveRetornarErro_QuandoNaoEncontrado()
    {
        _repoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, It.IsAny<Guid>(), default)).ReturnsAsync((Paciente?)null);

        var result = await _service.GetByIdAsync(_clinicaId, Guid.NewGuid());

        Assert.True(result.IsFailed);
        Assert.Contains("Paciente não encontrado.", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task CreateAsync_DeveCriarComSucesso()
    {
        var request = new CreatePacienteRequest("Maria", "456", "99999", null, null, null, null, null, null, null, null);
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Paciente>(), default)).Returns(Task.CompletedTask);
        _uowMock.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsSuccess);
        Assert.Equal("Maria", result.Value.Nome);
    }

    [Fact]
    public async Task UpdateAsync_DeveAtualizarComSucesso()
    {
        var paciente = new Paciente { Id = _pacienteId, ClinicaId = _clinicaId, Nome = "Antigo" };
        _repoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, _pacienteId, default)).ReturnsAsync(paciente);
        _uowMock.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var request = new UpdatePacienteRequest("Novo", "123", "88888", null, null, null, "Unimed", null, null, null, null, true);
        var result = await _service.UpdateAsync(_clinicaId, _pacienteId, request);

        Assert.True(result.IsSuccess);
        Assert.Equal("Novo", paciente.Nome);
        Assert.Equal("Unimed", paciente.Convenio);
    }

    [Fact]
    public async Task DeleteAsync_DeveDesativarComSucesso()
    {
        var paciente = new Paciente { Id = _pacienteId, ClinicaId = _clinicaId, Ativo = true };
        _repoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, _pacienteId, default)).ReturnsAsync(paciente);
        _uowMock.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var result = await _service.DeleteAsync(_clinicaId, _pacienteId);

        Assert.True(result.IsSuccess);
        Assert.False(paciente.Ativo);
    }
}
