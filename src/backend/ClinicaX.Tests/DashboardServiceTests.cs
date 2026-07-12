using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
using Moq;

namespace ClinicaX.Tests;

public class DashboardServiceTests
{
    private readonly Mock<IAgendamentoRepository> _agendamentoRepoMock = new();
    private readonly Mock<INotificacaoRepository> _notificacaoRepoMock = new();
    private readonly Mock<IEventoRepository> _eventoRepoMock = new();
    private readonly Mock<IPacienteRepository> _pacienteRepoMock = new();
    private readonly Mock<IServicoRepository> _servicoRepoMock = new();
    private readonly Mock<ICacheService> _cacheMock = new();
    private readonly DashboardService _service;

    private readonly Guid _clinicaId = Guid.NewGuid();

    public DashboardServiceTests()
    {
        _cacheMock.Setup(c => c.GetAsync<DashboardDataDto>(It.IsAny<string>(), default))
            .ReturnsAsync((DashboardDataDto?)null);
        _service = new DashboardService(
            _agendamentoRepoMock.Object,
            _notificacaoRepoMock.Object,
            _eventoRepoMock.Object,
            _pacienteRepoMock.Object,
            _servicoRepoMock.Object,
            _cacheMock.Object);
    }

    [Fact]
    public async Task GetDashboardAsync_DeveRetornarDashboard()
    {
        var servico = new Servico { Id = Guid.NewGuid(), Nome = "Consulta", Valor = 150 };
        var pacienteId = Guid.NewGuid();
        var agendamento = new Agendamento
        {
            Id = Guid.NewGuid(),
            ClinicaId = _clinicaId,
            ServicoId = servico.Id,
            PacienteId = pacienteId,
            DataHoraInicio = DateTime.Today.AddHours(10),
            DataHoraFim = DateTime.Today.AddHours(11),
            Status = AgendamentoStatus.Agendado
        };

        _agendamentoRepoMock
            .Setup(r => r.GetByClinicaAsync(_clinicaId, It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), default))
            .ReturnsAsync([agendamento]);
        _servicoRepoMock.Setup(r => r.GetAllAsync(_clinicaId, default)).ReturnsAsync([servico]);
        _pacienteRepoMock
            .Setup(r => r.GetByIdAndClinicaAsync(_clinicaId, pacienteId, default))
            .ReturnsAsync(new Paciente { Id = pacienteId, Nome = "Ana" });
        _notificacaoRepoMock.Setup(r => r.CountPendentesAsync(_clinicaId, default)).ReturnsAsync(3);

        var result = await _service.GetDashboardAsync(_clinicaId);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Value.ConsultasHoje);
        Assert.Equal("Ana", result.Value.ConsultasHojeLista[0].PacienteNome);
        Assert.Equal("Consulta", result.Value.ConsultasHojeLista[0].ServicoNome);
    }

    [Fact]
    public async Task GetTimelineAsync_DeveRetornarTimeline()
    {
        var evento = new Evento
        {
            Id = Guid.NewGuid(),
            ClinicaId = _clinicaId,
            Tipo = TipoEvento.PacienteCriado,
            Descricao = "Paciente cadastrado",
            CriadoEm = DateTime.UtcNow
        };
        _eventoRepoMock.Setup(r => r.GetByClinicaAsync(_clinicaId, 30, default)).ReturnsAsync([evento]);

        var result = await _service.GetTimelineAsync(_clinicaId);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value);
        Assert.Equal("Paciente cadastrado", result.Value[0].Descricao);
    }

    [Fact]
    public async Task GetTimelineAsync_DeveIncluirNomePaciente()
    {
        var pacienteId = Guid.NewGuid();
        var evento = new Evento
        {
            Id = Guid.NewGuid(),
            ClinicaId = _clinicaId,
            PacienteId = pacienteId,
            Tipo = TipoEvento.AgendamentoCriado,
            Descricao = "Agendamento criado",
            CriadoEm = DateTime.UtcNow
        };
        _eventoRepoMock.Setup(r => r.GetByClinicaAsync(_clinicaId, 30, default)).ReturnsAsync([evento]);
        _pacienteRepoMock.Setup(r => r.GetByIdAsync(pacienteId, default)).ReturnsAsync(new Paciente
        {
            Id = pacienteId,
            Nome = "Carlos"
        });

        var result = await _service.GetTimelineAsync(_clinicaId);

        Assert.True(result.IsSuccess);
        Assert.Equal("Carlos", result.Value[0].PacienteNome);
    }
}
