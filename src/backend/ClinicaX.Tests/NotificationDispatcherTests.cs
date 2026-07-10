using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Domain.Entities;
using ClinicaX.Infrastructure.Services;
using FluentResults;
using Microsoft.Extensions.Logging;
using Moq;

namespace ClinicaX.Tests;

public class NotificationDispatcherTests
{
    private readonly Mock<INotificacaoRepository> _notifRepoMock = new();
    private readonly Mock<IEventoRepository> _eventoRepoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IWhatsAppService> _whatsAppMock = new();
    private readonly Mock<IRealtimeNotifier> _realtimeMock = new();
    private readonly Mock<ILogger<NotificationDispatcher>> _loggerMock = new();
    private readonly NotificationDispatcher _dispatcher;

    private readonly Agendamento _agendamento = new()
    {
        Id = Guid.NewGuid(),
        ClinicaId = Guid.NewGuid(),
        PacienteId = Guid.NewGuid(),
        ServicoId = Guid.NewGuid(),
        DataHoraInicio = DateTime.UtcNow.AddDays(1),
        DataHoraFim = DateTime.UtcNow.AddDays(1).AddHours(1),
    };

    public NotificationDispatcherTests()
    {
        _dispatcher = new NotificationDispatcher(
            _notifRepoMock.Object,
            _eventoRepoMock.Object,
            _uowMock.Object,
            _whatsAppMock.Object,
            _realtimeMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task SendConfirmacaoAsync_DeveEnviarESalvarNotificacao()
    {
        _whatsAppMock.Setup(w => w.SendConfirmacaoAsync(_agendamento, "João", "Clinica", "Consulta", "Rua A", default))
            .ReturnsAsync(Result.Ok());

        var result = await _dispatcher.SendConfirmacaoAsync(_agendamento, "João", "Clinica", "Consulta", "Rua A");

        Assert.True(result.IsSuccess);
        _notifRepoMock.Verify(r => r.AddAsync(It.Is<Notificacao>(n => n.Tipo == TipoNotificacao.Confirmacao), default), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(default), Times.AtLeastOnce);
        _realtimeMock.Verify(r => r.NotifyNotificacaoEnviadaAsync(
            It.Is<NotificacaoRealtimeEvent>(e => e.Sucesso && e.Tipo == "Confirmacao"), default), Times.Once);
    }

    [Fact]
    public async Task SendLembreteAsync_DeveEnviarESalvarNotificacao()
    {
        _whatsAppMock.Setup(w => w.SendLembreteAsync(_agendamento, "Maria", "Clinica", "Limpeza", default))
            .ReturnsAsync(Result.Ok());

        var result = await _dispatcher.SendLembreteAsync(_agendamento, "Maria", "Clinica", "Limpeza");

        Assert.True(result.IsSuccess);
        _notifRepoMock.Verify(r => r.AddAsync(It.Is<Notificacao>(n => n.Tipo == TipoNotificacao.Lembrete), default), Times.Once);
    }

    [Fact]
    public async Task SendCancelamentoAsync_DeveSalvarNotificacao_QuandoFalha()
    {
        _whatsAppMock.Setup(w => w.SendCancelamentoAsync(_agendamento, "Pedro", "Clinica", "Motivo", "9999", default))
            .ReturnsAsync(Result.Fail("Erro"));

        await _dispatcher.SendCancelamentoAsync(_agendamento, "Pedro", "Clinica", "Motivo", "9999");

        _notifRepoMock.Verify(r => r.AddAsync(It.Is<Notificacao>(n => n.Status == StatusNotificacao.Falha), default), Times.Once);
    }
}
