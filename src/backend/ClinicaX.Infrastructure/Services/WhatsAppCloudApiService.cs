using System.Net.Http.Json;
using ClinicaX.Domain.Entities;
using FluentResults;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ClinicaX.Infrastructure.Services;

public class WhatsAppCloudApiService : IWhatsAppService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<WhatsAppCloudApiService> _logger;
    private readonly string _phoneNumberId;
    private readonly string _accessToken;
    private readonly string _baseUrl;

    public WhatsAppCloudApiService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<WhatsAppCloudApiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        var secao = configuration.GetSection("WhatsApp");
        _phoneNumberId = secao["PhoneNumberId"] ?? "";
        _accessToken = secao["AccessToken"] ?? "";
        _baseUrl = secao["BaseUrl"] ?? "https://graph.facebook.com/v21.0";
    }

    public async Task<Result> SendConfirmacaoAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string servicoNome, string clinicaEndereco, CancellationToken ct = default)
    {
        var msg = $"Olá {pacienteNome}! Sua consulta foi agendada na {clinicaNome} 📅\nDia: {agendamento.DataHoraInicio:dd/MM/yyyy} às {agendamento.DataHoraInicio:HH:mm}\nServiço: {servicoNome}\nEndereço: {clinicaEndereco}\nQualquer imprevisto, avisamos por aqui. 😊";
        return await SendAsync(msg, ct);
    }

    public async Task<Result> SendLembreteAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string servicoNome, CancellationToken ct = default)
    {
        var hoje = agendamento.DataHoraInicio.Date == DateTime.UtcNow.Date ? "hoje" : "amanhã";
        var msg = $"Lembrete! Sua consulta na {clinicaNome} é {hoje} às {agendamento.DataHoraInicio:HH:mm} ⏰\nPaciente: {pacienteNome}\nServiço: {servicoNome}\nConfirme presença respondendo \"OK\" ou cancele respondendo \"CANCELAR\".\nEstamos te esperando! 🦷";
        return await SendAsync(msg, ct);
    }

    public async Task<Result> SendCancelamentoAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string motivo, string telefone, CancellationToken ct = default)
    {
        var msg = $"Olá {pacienteNome}, infelizmente sua consulta do dia {agendamento.DataHoraInicio:dd/MM/yyyy} às {agendamento.DataHoraInicio:HH:mm} na {clinicaNome} precisou ser cancelada. ❌\nMotivo: {motivo}\nEntre em contato para reagendar: {telefone}\nDesculpe pelo transtorno!";
        return await SendAsync(msg, ct);
    }

    public async Task<Result> SendRemarcacaoAsync(Agendamento agendamento, DateTime novaData, string pacienteNome, string clinicaNome, string clinicaEndereco, CancellationToken ct = default)
    {
        var msg = $"Olá {pacienteNome}, sua consulta foi reagendada 📅\nNova data: {novaData:dd/MM/yyyy} às {novaData:HH:mm}\nLocal: {clinicaNome} — {clinicaEndereco}\nSe tiver algum problema, é só nos avisar.\nConfirmado? 😊";
        return await SendAsync(msg, ct);
    }

    private async Task<Result> SendAsync(string mensagem, CancellationToken ct)
    {
        try
        {
            if (string.IsNullOrEmpty(_phoneNumberId) || string.IsNullOrEmpty(_accessToken))
            {
                _logger.LogWarning("[WhatsApp] Credenciais não configuradas. Simulando envio.");
                await Task.Delay(100, ct);
                _logger.LogInformation("[WhatsApp SIMULADO] Mensagem: {Msg}", mensagem);
                return Result.Ok();
            }

            var payload = new
            {
                messaging_product = "whatsapp",
                to = "",  // preencher com número do paciente
                type = "text",
                text = new { body = mensagem }
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"{_baseUrl}/{_phoneNumberId}/messages?access_token={_accessToken}",
                payload, ct);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("[WhatsApp REAL] Mensagem enviada com sucesso");
                return Result.Ok();
            }

            var error = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError("[WhatsApp REAL] Falha ao enviar: {Error}", error);
            return Result.Fail($"Erro WhatsApp API: {response.StatusCode}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar WhatsApp");
            return Result.Fail("Erro ao enviar mensagem WhatsApp.");
        }
    }
}
