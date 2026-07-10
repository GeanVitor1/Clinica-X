using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
using FluentResults;
using Moq;

namespace ClinicaX.Tests;

public class AgendamentoServiceTests
{
    private readonly Mock<IAgendamentoRepository> _repoMock = new();
    private readonly Mock<IClinicaRepository> _clinicaRepoMock = new();
    private readonly Mock<IServicoRepository> _servicoRepoMock = new();
    private readonly Mock<IPacienteRepository> _pacienteRepoMock = new();
    private readonly Mock<INotificationDispatcher> _notifMock = new();
    private readonly Mock<IEventoRepository> _eventoRepoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<ICacheService> _cacheMock = new();
    private readonly AgendamentoService _service;

    private readonly Guid _clinicaId = Guid.NewGuid();
    private readonly Guid _pacienteId = Guid.NewGuid();
    private readonly Guid _servicoId = Guid.NewGuid();

    public AgendamentoServiceTests()
    {
        _service = new AgendamentoService(
            _repoMock.Object,
            _clinicaRepoMock.Object,
            _servicoRepoMock.Object,
            _pacienteRepoMock.Object,
            _notifMock.Object,
            _eventoRepoMock.Object,
            _uowMock.Object,
            _cacheMock.Object);
    }

    private void SetupClinica()
    {
        _clinicaRepoMock.Setup(r => r.GetByIdAsync(_clinicaId, default)).ReturnsAsync(new Clinica
        {
            Id = _clinicaId,
            HorarioAbertura = new TimeSpan(8, 0, 0),
            HorarioFechamento = new TimeSpan(18, 0, 0),
            DiasFuncionamento = "0,1,2,3,4,5,6"
        });
    }

    private void SetupServico()
    {
        _servicoRepoMock.Setup(r => r.GetByIdAsync(_servicoId, default)).ReturnsAsync(new Servico
        {
            Id = _servicoId, DuracaoMin = 30, Nome = "Consulta", Cor = "#14b8a6"
        });
    }

    private void SetupPaciente()
    {
        _pacienteRepoMock.Setup(r => r.GetByIdAsync(_pacienteId, default)).ReturnsAsync(new Paciente
        {
            Id = _pacienteId, Nome = "Maria"
        });
    }

    [Fact]
    public async Task CreateAsync_DeveRetornarErro_QuandoClinicaNaoEncontrada()
    {
        _clinicaRepoMock.Setup(r => r.GetByIdAsync(_clinicaId, default)).ReturnsAsync((Clinica?)null);

        var request = new CreateAgendamentoRequest(_pacienteId, _servicoId, DateTime.UtcNow.AddHours(2), null);
        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsFailed);
        Assert.Contains("Clínica não encontrada.", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task CreateAsync_DeveRetornarErro_QuandoServicoNaoEncontrado()
    {
        SetupClinica();
        _servicoRepoMock.Setup(r => r.GetByIdAsync(_servicoId, default)).ReturnsAsync((Servico?)null);

        var request = new CreateAgendamentoRequest(_pacienteId, _servicoId, DateTime.UtcNow.AddHours(2), null);
        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsFailed);
        Assert.Contains("Serviço não encontrado.", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task CreateAsync_DeveRetornarErro_QuandoForaDoHorarioComercial()
    {
        SetupClinica();
        SetupServico();
        SetupPaciente();

        var madrugada = new DateTime(2026, 7, 10, 5, 0, 0, DateTimeKind.Utc);
        var request = new CreateAgendamentoRequest(_pacienteId, _servicoId, madrugada, null);
        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsFailed);
        Assert.Contains("Horário fora do expediente da clínica.", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task CreateAsync_DeveRetornarErro_QuandoDiaNaoFunciona()
    {
        _clinicaRepoMock.Setup(r => r.GetByIdAsync(_clinicaId, default)).ReturnsAsync(new Clinica
        {
            Id = _clinicaId,
            HorarioAbertura = new TimeSpan(8, 0, 0),
            HorarioFechamento = new TimeSpan(18, 0, 0),
            DiasFuncionamento = "1,2,3,4,5" // seg-sex
        });
        SetupServico();
        SetupPaciente();

        // 2026-07-12 = domingo
        var domingo = new DateTime(2026, 7, 12, 10, 0, 0, DateTimeKind.Utc);
        var request = new CreateAgendamentoRequest(_pacienteId, _servicoId, domingo, null);
        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsFailed);
        Assert.Contains("A clínica não funciona neste dia da semana.", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task CreateAsync_DeveRetornarErro_QuandoHaConflito()
    {
        var inicio = new DateTime(2026, 7, 10, 10, 0, 0, DateTimeKind.Utc);
        SetupClinica();
        SetupServico();
        SetupPaciente();
        _repoMock.Setup(r => r.HasConflictAsync(_clinicaId, inicio, inicio.AddMinutes(30), null, default)).ReturnsAsync(true);

        var request = new CreateAgendamentoRequest(_pacienteId, _servicoId, inicio, null);
        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsFailed);
        Assert.Contains("Conflito de horário com outro agendamento.", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task CreateAsync_DeveCriarComSucesso()
    {
        var inicio = new DateTime(2026, 7, 10, 10, 0, 0, DateTimeKind.Utc);
        SetupClinica();
        SetupServico();
        SetupPaciente();
        _repoMock.Setup(r => r.HasConflictAsync(_clinicaId, inicio, inicio.AddMinutes(30), null, default)).ReturnsAsync(false);

        var request = new CreateAgendamentoRequest(_pacienteId, _servicoId, inicio, null);
        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsSuccess);
        Assert.Equal("Maria", result.Value.PacienteNome);
        Assert.Equal("Consulta", result.Value.ServicoNome);
        Assert.Equal("#14b8a6", result.Value.Cor);
    }

    [Fact]
    public async Task GetByClinicaAsync_DevePreencherNomesECor()
    {
        var inicio = new DateTime(2026, 7, 10, 10, 0, 0, DateTimeKind.Utc);
        var agendamento = new Agendamento
        {
            Id = Guid.NewGuid(),
            ClinicaId = _clinicaId,
            PacienteId = _pacienteId,
            ServicoId = _servicoId,
            DataHoraInicio = inicio,
            DataHoraFim = inicio.AddMinutes(30),
            Status = AgendamentoStatus.Agendado
        };
        _repoMock.Setup(r => r.GetByClinicaAsync(_clinicaId, null, null, default)).ReturnsAsync([agendamento]);
        _pacienteRepoMock.Setup(r => r.GetAllAsync(_clinicaId, null, 1, int.MaxValue, default))
            .ReturnsAsync([new Paciente { Id = _pacienteId, Nome = "Maria" }]);
        _servicoRepoMock.Setup(r => r.GetAllAsync(_clinicaId, default))
            .ReturnsAsync([new Servico { Id = _servicoId, Nome = "Consulta", Cor = "#14b8a6" }]);

        var result = await _service.GetByClinicaAsync(_clinicaId);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value);
        Assert.Equal("Maria", result.Value[0].PacienteNome);
        Assert.Equal("Consulta", result.Value[0].ServicoNome);
        Assert.Equal("#14b8a6", result.Value[0].Cor);
    }

    [Fact]
    public async Task CancelarAsync_DeveCancelarComSucesso()
    {
        var agendamento = new Agendamento { Id = Guid.NewGuid(), ClinicaId = _clinicaId, PacienteId = _pacienteId, ServicoId = _servicoId, Status = AgendamentoStatus.Agendado };
        _repoMock.Setup(r => r.GetByIdAsync(agendamento.Id, default)).ReturnsAsync(agendamento);

        var request = new CancelarAgendamentoRequest("Paciente desistiu");
        var result = await _service.CancelarAsync(agendamento.Id, request);

        Assert.True(result.IsSuccess);
        Assert.Equal(AgendamentoStatus.Cancelado, agendamento.Status);
        Assert.Equal("Paciente desistiu", agendamento.MotivoCancelamento);
    }

    [Fact]
    public async Task CancelarAsync_DeveRetornarErro_QuandoNaoEncontrado()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), default)).ReturnsAsync((Agendamento?)null);

        var request = new CancelarAgendamentoRequest("Motivo");
        var result = await _service.CancelarAsync(Guid.NewGuid(), request);

        Assert.True(result.IsFailed);
    }
}
