using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.RegularExpressions;
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

    public Task<Result> SendConfirmacaoAsync(Agendamento agendamento, string telefoneDestino, string pacienteNome, string clinicaNome, string servicoNome, string clinicaEndereco, string? linkConfirmacao = null, CancellationToken ct = default)
    {
        var msg = WhatsAppSimuladoService.BuildConfirmacao(pacienteNome, clinicaNome, servicoNome, agendamento.DataHoraInicio, clinicaEndereco, linkConfirmacao);
        return SendAsync(telefoneDestino, msg, ct);
    }

    public Task<Result> SendLembreteAsync(Agendamento agendamento, string telefoneDestino, string pacienteNome, string clinicaNome, string servicoNome, string? linkConfirmacao = null, CancellationToken ct = default)
    {
        var msg = WhatsAppSimuladoService.BuildLembrete(pacienteNome, clinicaNome, servicoNome, agendamento.DataHoraInicio, linkConfirmacao);
        return SendAsync(telefoneDestino, msg, ct);
    }

    public Task<Result> SendCancelamentoAsync(Agendamento agendamento, string telefoneDestino, string pacienteNome, string clinicaNome, string motivo, string telefoneClinica, CancellationToken ct = default)
    {
        var msg = $"Olá {pacienteNome}, consulta do dia {agendamento.DataHoraInicio:dd/MM/yyyy HH:mm} em {clinicaNome} cancelada. Motivo: {motivo}. Contato: {telefoneClinica}";
        return SendAsync(telefoneDestino, msg, ct);
    }

    public Task<Result> SendRemarcacaoAsync(Agendamento agendamento, string telefoneDestino, DateTime novaData, string pacienteNome, string clinicaNome, string clinicaEndereco, string? linkConfirmacao = null, CancellationToken ct = default)
    {
        var msg = $"Olá {pacienteNome}, consulta remarcada para {novaData:dd/MM/yyyy HH:mm} em {clinicaNome} — {clinicaEndereco}."
                  + (string.IsNullOrEmpty(linkConfirmacao) ? "" : $" Confirme: {linkConfirmacao}");
        return SendAsync(telefoneDestino, msg, ct);
    }

    public Task<Result> SendPosConsultaAsync(Agendamento agendamento, string telefoneDestino, string pacienteNome, string clinicaNome, string servicoNome, CancellationToken ct = default)
    {
        var msg = $"Olá {pacienteNome}! Obrigado por comparecer à {clinicaNome} ({servicoNome}). Como se sentiu? Responda se tiver dúvidas.";
        return SendAsync(telefoneDestino, msg, ct);
    }

    public Task<Result> SendMensagemCustomAsync(string telefone, string mensagem, CancellationToken ct = default)
        => SendAsync(telefone, mensagem, ct);

    private async Task<Result> SendAsync(string? telefone, string mensagem, CancellationToken ct)
    {
        try
        {
            if (string.IsNullOrEmpty(_phoneNumberId) || string.IsNullOrEmpty(_accessToken))
            {
                _logger.LogWarning("[WhatsApp] Credenciais não configuradas. Simulando envio para {Telefone}.", telefone ?? "(sem telefone)");
                _logger.LogInformation("[WhatsApp FALLBACK] {Msg}", mensagem);
                return Result.Ok();
            }

            var to = NormalizePhone(telefone);
            if (string.IsNullOrEmpty(to))
            {
                _logger.LogError("[WhatsApp REAL] Telefone de destino ausente ou inválido: {Telefone}", telefone);
                return Result.Fail("Telefone de destino inválido para envio WhatsApp.");
            }

            var payload = new
            {
                messaging_product = "whatsapp",
                to,
                type = "text",
                text = new { body = mensagem }
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/{_phoneNumberId}/messages");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
            request.Content = JsonContent.Create(payload);

            var response = await _httpClient.SendAsync(request, ct);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("[WhatsApp REAL] Mensagem enviada para {To}", to);
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

    /// <summary>Remove máscara e garante DDI 55 se número BR de 10/11 dígitos.</summary>
    internal static string? NormalizePhone(string? telefone)
    {
        if (string.IsNullOrWhiteSpace(telefone)) return null;
        var digits = Regex.Replace(telefone, @"\D", "");
        if (digits.Length is 10 or 11)
            digits = "55" + digits;
        return digits.Length >= 12 ? digits : null;
    }
}
