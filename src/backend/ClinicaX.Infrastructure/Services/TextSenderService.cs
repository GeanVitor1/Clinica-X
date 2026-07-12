using ClinicaX.Application.Interfaces;
using FluentResults;
using Microsoft.Extensions.Logging;

namespace ClinicaX.Infrastructure.Services;

public class TextSenderService : ITextSenderService
{
    private readonly IWhatsAppService _whatsapp;
    private readonly ILogger<TextSenderService> _logger;

    public TextSenderService(IWhatsAppService whatsapp, ILogger<TextSenderService> logger)
    {
        _whatsapp = whatsapp;
        _logger = logger;
    }

    public async Task<bool> SendWhatsAppAsync(string telefone, string mensagem, CancellationToken ct = default)
    {
        try
        {
            var result = await _whatsapp.SendMensagemCustomAsync(telefone, mensagem, ct);
            if (result.IsSuccess)
            {
                _logger.LogInformation("[TextSender] WhatsApp enviado para {Telefone}", telefone);
                return true;
            }
            _logger.LogWarning("[TextSender] Falha ao enviar WhatsApp: {Errors}", string.Join("; ", result.Errors.Select(e => e.Message)));
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[TextSender] Erro ao enviar WhatsApp para {Telefone}", telefone);
            return false;
        }
    }
}
