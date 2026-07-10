using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
using Moq;

namespace ClinicaX.Tests;

public class ReportServiceTests
{
    private readonly Mock<IAgendamentoRepository> _agendamentoRepoMock = new();
    private readonly Mock<IServicoRepository> _servicoRepoMock = new();
    private readonly Mock<IPacienteRepository> _pacienteRepoMock = new();
    private readonly ReportService _service;

    private readonly Guid _clinicaId = Guid.NewGuid();

    public ReportServiceTests()
    {
        _service = new ReportService(_agendamentoRepoMock.Object, _servicoRepoMock.Object, _pacienteRepoMock.Object);
    }

    [Fact]
    public async Task GetRelatorioFinanceiroAsync_DeveRetornarFaturamento()
    {
        var servico = new Servico { Id = Guid.NewGuid(), Nome = "Consulta", Valor = 150 };
        var agendamentos = new List<Agendamento>
        {
            new() { Id = Guid.NewGuid(), ClinicaId = _clinicaId, ServicoId = servico.Id, DataHoraInicio = DateTime.UtcNow, DataHoraFim = DateTime.UtcNow.AddHours(1), Status = AgendamentoStatus.Realizado },
            new() { Id = Guid.NewGuid(), ClinicaId = _clinicaId, ServicoId = servico.Id, DataHoraInicio = DateTime.UtcNow.AddDays(1), DataHoraFim = DateTime.UtcNow.AddDays(1).AddHours(1), Status = AgendamentoStatus.Realizado },
        };

        _agendamentoRepoMock.Setup(r => r.GetByClinicaAsync(_clinicaId, It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), default)).ReturnsAsync(agendamentos);
        _servicoRepoMock.Setup(r => r.GetAllAsync(_clinicaId, default)).ReturnsAsync(new List<Servico> { servico });

        var result = await _service.GetRelatorioFinanceiroAsync(_clinicaId, DateTime.UtcNow.AddDays(-1), DateTime.UtcNow.AddDays(2));

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value.PorServico);
        Assert.Equal(300, result.Value.PorServico[0].Total);
    }

    [Fact]
    public async Task GetRelatorioOcupacaoAsync_DeveRetornarOcupacao()
    {
        var servico = new Servico { Id = Guid.NewGuid(), Nome = "Consulta", DuracaoMin = 60 };
        var agendamentos = new List<Agendamento>
        {
            new() { Id = Guid.NewGuid(), ClinicaId = _clinicaId, ServicoId = servico.Id, DataHoraInicio = DateTime.UtcNow, DataHoraFim = DateTime.UtcNow.AddHours(1), Status = AgendamentoStatus.Agendado },
        };

        _agendamentoRepoMock.Setup(r => r.GetByClinicaAsync(_clinicaId, It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), default)).ReturnsAsync(agendamentos);
        _servicoRepoMock.Setup(r => r.GetAllAsync(_clinicaId, default)).ReturnsAsync(new List<Servico> { servico });

        var result = await _service.GetRelatorioOcupacaoAsync(_clinicaId, DateTime.UtcNow.AddDays(-1), DateTime.UtcNow.AddDays(2));

        Assert.True(result.IsSuccess);
        Assert.NotEmpty(result.Value.HorariosPico);
    }
}
