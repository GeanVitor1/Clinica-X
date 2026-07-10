using ClinicaX.Domain.Entities;
using FluentResults;
using Microsoft.Extensions.Logging;

namespace ClinicaX.Infrastructure.Services;

public class WhatsAppSimuladoService : IWhatsAppService
{
    private readonly ILogger<WhatsAppSimuladoService> _logger;

    public WhatsAppSimuladoService(ILogger<WhatsAppSimuladoService> logger) => _logger = logger;

    public Task<Result> SendConfirmacaoAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string servicoNome, string clinicaEndereco, CancellationToken ct = default)
    {
        _logger.LogInformation("[WhatsApp SIMULADO] Confirmação para {Paciente}: {Servico} em {Data}", pacienteNome, servicoNome, agendamento.DataHoraInicio);
        return Task.FromResult(Result.Ok());
    }

    public Task<Result> SendLembreteAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string servicoNome, CancellationToken ct = default)
    {
        _logger.LogInformation("[WhatsApp SIMULADO] Lembrete para {Paciente}: {Servico} em {Data}", pacienteNome, servicoNome, agendamento.DataHoraInicio);
        return Task.FromResult(Result.Ok());
    }

    public Task<Result> SendCancelamentoAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string motivo, string telefone, CancellationToken ct = default)
    {
        _logger.LogInformation("[WhatsApp SIMULADO] Cancelamento para {Paciente}: {Motivo}", pacienteNome, motivo);
        return Task.FromResult(Result.Ok());
    }

    public Task<Result> SendRemarcacaoAsync(Agendamento agendamento, DateTime novaData, string pacienteNome, string clinicaNome, string clinicaEndereco, CancellationToken ct = default)
    {
        _logger.LogInformation("[WhatsApp SIMULADO] Remarcação para {Paciente}: nova data {Data}", pacienteNome, novaData);
        return Task.FromResult(Result.Ok());
    }
}
