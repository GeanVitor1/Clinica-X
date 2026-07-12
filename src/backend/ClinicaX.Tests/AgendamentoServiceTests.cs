using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
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
    private readonly Mock<IModulosRepository> _modulosMock = new();
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
            _modulosMock.Object,
            _uowMock.Object,
            _cacheMock.Object);
    }

    private void SetupClinica()
    {
        _clinicaRepoMock.Setup(r => r.GetByIdAsync(_clinicaId, default)).ReturnsAsync(new Clinica
        {
            Id = _clinicaId,
            Nome = "Clinica",
            Endereco = "Rua A",
            HorarioAbertura = new TimeSpan(8, 0, 0),
            HorarioFechamento = new TimeSpan(18, 0, 0),
            DiasFuncionamento = "0,1,2,3,4,5,6"
        });
    }

    private void SetupServico()
    {
        _servicoRepoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, _servicoId, default)).ReturnsAsync(new Servico
        {
            Id = _servicoId, ClinicaId = _clinicaId, DuracaoMin = 30, Nome = "Consulta", Cor = "#14b8a6"
        });
    }

    private void SetupPaciente()
    {
        _pacienteRepoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, _pacienteId, default)).ReturnsAsync(new Paciente
        {
            Id = _pacienteId, ClinicaId = _clinicaId, Nome = "Maria", Ativo = true
        });
    }

    [Fact]
    public async Task CreateAsync_DeveRetornarErro_QuandoClinicaNaoEncontrada()
    {
        _clinicaRepoMock.Setup(r => r.GetByIdAsync(_clinicaId, default)).ReturnsAsync((Clinica?)null);

        var request = new CreateAgendamentoRequest(_pacienteId, _servicoId, DateTime.UtcNow.AddHours(2), null, null, null, null);
        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsFailed);
        Assert.Contains("Clínica não encontrada.", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task CreateAsync_DeveRetornarErro_QuandoServicoNaoEncontrado()
    {
        SetupClinica();
        _servicoRepoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, _servicoId, default)).ReturnsAsync((Servico?)null);

        var request = new CreateAgendamentoRequest(_pacienteId, _servicoId, DateTime.UtcNow.AddHours(2), null, null, null, null);
        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsFailed);
        Assert.Contains("Serviço não encontrado nesta clínica.", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task CreateAsync_DeveRetornarErro_QuandoForaDoHorarioComercial()
    {
        SetupClinica();
        SetupServico();
        SetupPaciente();

        var madrugada = DateTime.Today.AddDays(1).Date.AddHours(5);
        var request = new CreateAgendamentoRequest(_pacienteId, _servicoId, madrugada, null, null, null, null);
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
            DiasFuncionamento = "1,2,3,4,5"
        });
        SetupServico();
        SetupPaciente();

        // Próximo domingo
        var domingo = DateTime.Today.AddDays(1);
        while (domingo.DayOfWeek != DayOfWeek.Sunday)
            domingo = domingo.AddDays(1);
        domingo = domingo.Date.AddHours(10);
        var request = new CreateAgendamentoRequest(_pacienteId, _servicoId, domingo, null, null, null, null);
        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsFailed);
        Assert.Contains("A clínica não funciona neste dia da semana.", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task CreateAsync_DeveRetornarErro_QuandoHaConflito()
    {
        var inicio = DateTime.Today.AddDays(1).AddHours(10);
        SetupClinica();
        SetupServico();
        SetupPaciente();
        _repoMock.Setup(r => r.HasBloqueioAsync(_clinicaId, inicio, inicio.AddMinutes(30), null, null, null, default)).ReturnsAsync(false);
        _repoMock.Setup(r => r.HasConflictAsync(_clinicaId, inicio, inicio.AddMinutes(30), null, null, null, null, default)).ReturnsAsync(true);

        var request = new CreateAgendamentoRequest(_pacienteId, _servicoId, inicio, null, null, null, null);
        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsFailed);
        Assert.Contains("Conflito de horário", result.Errors.Select(e => e.Message).First());
    }

    [Fact]
    public async Task CreateAsync_DeveCriarComSucesso()
    {
        var inicio = DateTime.Today.AddDays(1).AddHours(10);
        SetupClinica();
        SetupServico();
        SetupPaciente();
        _repoMock.Setup(r => r.HasBloqueioAsync(_clinicaId, inicio, inicio.AddMinutes(30), null, null, null, default)).ReturnsAsync(false);
        _repoMock.Setup(r => r.HasConflictAsync(_clinicaId, inicio, inicio.AddMinutes(30), null, null, null, null, default)).ReturnsAsync(false);

        var request = new CreateAgendamentoRequest(_pacienteId, _servicoId, inicio, null, null, null, null);
        var result = await _service.CreateAsync(_clinicaId, request);

        Assert.True(result.IsSuccess);
        Assert.Equal("Maria", result.Value.PacienteNome);
        Assert.Equal("Consulta", result.Value.ServicoNome);
        Assert.Equal("#14b8a6", result.Value.Cor);
        // Token de confirmação não é exposto no DTO da API
        Assert.Null(result.Value.TokenConfirmacao);
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
        _pacienteRepoMock.Setup(r => r.GetAllAsync(_clinicaId, null, 1, 200, null, default))
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
        _repoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, agendamento.Id, default)).ReturnsAsync(agendamento);

        var request = new CancelarAgendamentoRequest("Paciente desistiu");
        var result = await _service.CancelarAsync(_clinicaId, agendamento.Id, request);

        Assert.True(result.IsSuccess);
        Assert.Equal(AgendamentoStatus.Cancelado, agendamento.Status);
        Assert.Equal("Paciente desistiu", agendamento.MotivoCancelamento);
    }

    [Fact]
    public async Task CancelarAsync_DeveRetornarErro_QuandoNaoEncontrado()
    {
        _repoMock.Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, It.IsAny<Guid>(), default)).ReturnsAsync((Agendamento?)null);

        var request = new CancelarAgendamentoRequest("Motivo");
        var result = await _service.CancelarAsync(_clinicaId, Guid.NewGuid(), request);

        Assert.True(result.IsFailed);
    }

    [Fact]
    public async Task ConfirmarPorTokenAsync_DeveConfirmar()
    {
        var agendamento = new Agendamento
        {
            Id = Guid.NewGuid(),
            ClinicaId = _clinicaId,
            PacienteId = _pacienteId,
            Status = AgendamentoStatus.Agendado,
            TokenConfirmacao = "abc123",
            DataHoraInicio = DateTime.UtcNow.AddDays(1)
        };
        _repoMock.Setup(r => r.GetByTokenConfirmacaoAsync("abc123", default)).ReturnsAsync(agendamento);
        _pacienteRepoMock.Setup(r => r.GetByIdAsync(_pacienteId, default)).ReturnsAsync(new Paciente { Id = _pacienteId, Nome = "Maria" });

        var result = await _service.ConfirmarPorTokenAsync("abc123");

        Assert.True(result.IsSuccess);
        Assert.True(result.Value.Sucesso);
        Assert.Equal(AgendamentoStatus.Confirmado, agendamento.Status);
    }
}
