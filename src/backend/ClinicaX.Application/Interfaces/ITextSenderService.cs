namespace ClinicaX.Application.Interfaces;

public interface ITextSenderService
{
    Task<bool> SendWhatsAppAsync(string telefone, string mensagem, CancellationToken ct = default);
}
