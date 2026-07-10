using ClinicaX.Domain.Entities;

namespace ClinicaX.Application.Interfaces;

public interface INotificacaoRepository
{
    Task<List<Notificacao>> GetByClinicaAsync(Guid clinicaId, int take = 20, CancellationToken ct = default);
    Task<List<Notificacao>> GetByPacienteAsync(Guid pacienteId, CancellationToken ct = default);
    Task AddAsync(Notificacao notificacao, CancellationToken ct = default);
    Task<int> CountPendentesAsync(Guid clinicaId, CancellationToken ct = default);
    /// <summary>
    /// True se já existe notificação do tipo para o agendamento (exceto Falha, para permitir retry).
    /// </summary>
    Task<bool> ExistsForAgendamentoAsync(Guid agendamentoId, TipoNotificacao tipo, CancellationToken ct = default);
}
