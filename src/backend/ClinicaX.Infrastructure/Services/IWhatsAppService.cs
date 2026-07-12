using ClinicaX.Domain.Entities;
using FluentResults;

namespace ClinicaX.Infrastructure.Services;

public interface IWhatsAppService
{
    Task<Result> SendConfirmacaoAsync(Agendamento agendamento, string telefoneDestino, string pacienteNome, string clinicaNome, string servicoNome, string clinicaEndereco, string? linkConfirmacao = null, CancellationToken ct = default);
    Task<Result> SendLembreteAsync(Agendamento agendamento, string telefoneDestino, string pacienteNome, string clinicaNome, string servicoNome, string? linkConfirmacao = null, CancellationToken ct = default);
    Task<Result> SendCancelamentoAsync(Agendamento agendamento, string telefoneDestino, string pacienteNome, string clinicaNome, string motivo, string telefoneClinica, CancellationToken ct = default);
    Task<Result> SendRemarcacaoAsync(Agendamento agendamento, string telefoneDestino, DateTime novaData, string pacienteNome, string clinicaNome, string clinicaEndereco, string? linkConfirmacao = null, CancellationToken ct = default);
    Task<Result> SendPosConsultaAsync(Agendamento agendamento, string telefoneDestino, string pacienteNome, string clinicaNome, string servicoNome, CancellationToken ct = default);
    Task<Result> SendMensagemCustomAsync(string telefone, string mensagem, CancellationToken ct = default);
}
