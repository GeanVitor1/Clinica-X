using ClinicaX.Domain.Entities;
using FluentResults;

namespace ClinicaX.Infrastructure.Services;

public interface IWhatsAppService
{
    Task<Result> SendConfirmacaoAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string servicoNome, string clinicaEndereco, CancellationToken ct = default);
    Task<Result> SendLembreteAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string servicoNome, CancellationToken ct = default);
    Task<Result> SendCancelamentoAsync(Agendamento agendamento, string pacienteNome, string clinicaNome, string motivo, string telefone, CancellationToken ct = default);
    Task<Result> SendRemarcacaoAsync(Agendamento agendamento, DateTime novaData, string pacienteNome, string clinicaNome, string clinicaEndereco, CancellationToken ct = default);
}
