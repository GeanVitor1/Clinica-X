using ClinicaX.Domain.Entities;
using FluentResults;
using Microsoft.Extensions.Logging;

namespace ClinicaX.Infrastructure.Services;

/// <summary>
/// Implementação de desenvolvimento: grava no log e simula sucesso.
/// Ative WhatsApp:ModoReal=true para Cloud API.
/// </summary>
public class WhatsAppSimuladoService : IWhatsAppService
{
    private readonly ILogger<WhatsAppSimuladoService> _logger;

    public WhatsAppSimuladoService(ILogger<WhatsAppSimuladoService> logger) => _logger = logger;

    public Task<Result> SendConfirmacaoAsync(Agendamento agendamento, string telefoneDestino, string pacienteNome, string clinicaNome, string servicoNome, string clinicaEndereco, string? linkConfirmacao = null, CancellationToken ct = default)
    {
        var msg = BuildConfirmacao(pacienteNome, clinicaNome, servicoNome, agendamento.DataHoraInicio, clinicaEndereco, linkConfirmacao);
        _logger.LogInformation("[WhatsApp SIMULADO] Confirmação → {Telefone} {Paciente}: {Msg}", telefoneDestino, pacienteNome, msg);
        return Task.FromResult(Result.Ok());
    }

    public Task<Result> SendLembreteAsync(Agendamento agendamento, string telefoneDestino, string pacienteNome, string clinicaNome, string servicoNome, string? linkConfirmacao = null, CancellationToken ct = default)
    {
        var msg = BuildLembrete(pacienteNome, clinicaNome, servicoNome, agendamento.DataHoraInicio, linkConfirmacao);
        _logger.LogInformation("[WhatsApp SIMULADO] Lembrete → {Telefone} {Paciente}: {Msg}", telefoneDestino, pacienteNome, msg);
        return Task.FromResult(Result.Ok());
    }

    public Task<Result> SendCancelamentoAsync(Agendamento agendamento, string telefoneDestino, string pacienteNome, string clinicaNome, string motivo, string telefoneClinica, CancellationToken ct = default)
    {
        var msg = $"Olá {pacienteNome}, sua consulta em {clinicaNome} ({agendamento.DataHoraInicio:dd/MM/yyyy HH:mm}) foi cancelada. Motivo: {motivo}. Dúvidas: {telefoneClinica}";
        _logger.LogInformation("[WhatsApp SIMULADO] Cancelamento → {Telefone} {Paciente}: {Msg}", telefoneDestino, pacienteNome, msg);
        return Task.FromResult(Result.Ok());
    }

    public Task<Result> SendRemarcacaoAsync(Agendamento agendamento, string telefoneDestino, DateTime novaData, string pacienteNome, string clinicaNome, string clinicaEndereco, string? linkConfirmacao = null, CancellationToken ct = default)
    {
        var msg = $"Olá {pacienteNome}, sua consulta em {clinicaNome} foi remarcada para {novaData:dd/MM/yyyy HH:mm}. Local: {clinicaEndereco}."
                  + (string.IsNullOrEmpty(linkConfirmacao) ? "" : $" Confirme: {linkConfirmacao}");
        _logger.LogInformation("[WhatsApp SIMULADO] Remarcação → {Telefone} {Paciente}: {Msg}", telefoneDestino, pacienteNome, msg);
        return Task.FromResult(Result.Ok());
    }

    public Task<Result> SendPosConsultaAsync(Agendamento agendamento, string telefoneDestino, string pacienteNome, string clinicaNome, string servicoNome, CancellationToken ct = default)
    {
        var msg = $"Olá {pacienteNome}! Obrigado por comparecer à {clinicaNome} ({servicoNome}). Como se sentiu? Em caso de dúvidas, responda esta mensagem. Cuide-se!";
        _logger.LogInformation("[WhatsApp SIMULADO] Pós-consulta → {Telefone} {Paciente}: {Msg}", telefoneDestino, pacienteNome, msg);
        return Task.FromResult(Result.Ok());
    }

    public Task<Result> SendMensagemCustomAsync(string telefone, string mensagem, CancellationToken ct = default)
    {
        _logger.LogInformation("[WhatsApp SIMULADO] Custom → {Telefone}: {Mensagem}", telefone, mensagem);
        return Task.FromResult(Result.Ok());
    }

    internal static string BuildConfirmacao(string paciente, string clinica, string servico, DateTime data, string endereco, string? link)
        => $"Olá {paciente}! Sua consulta em {clinica} foi agendada.\nServiço: {servico}\nData: {data:dd/MM/yyyy HH:mm}\nLocal: {endereco}"
           + (string.IsNullOrEmpty(link) ? "" : $"\n✅ Confirme em 1 clique: {link}");

    internal static string BuildLembrete(string paciente, string clinica, string servico, DateTime data, string? link)
        => $"Olá {paciente}! Lembrete: consulta em {clinica} amanhã/em breve.\n{servico} — {data:dd/MM/yyyy HH:mm}"
           + (string.IsNullOrEmpty(link) ? "" : $"\n✅ Confirme: {link}");
}
