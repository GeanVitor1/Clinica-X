namespace ClinicaX.Domain.Entities;

public enum AgendamentoStatus
{
    Agendado,
    Confirmado,
    Cancelado,
    Realizado,
    Falta
}

public class Agendamento : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid PacienteId { get; set; }
    public Guid ServicoId { get; set; }
    public DateTime DataHoraInicio { get; set; }
    public DateTime DataHoraFim { get; set; }
    public AgendamentoStatus Status { get; set; } = AgendamentoStatus.Agendado;
    public string? Observacao { get; set; }
    public string? MotivoCancelamento { get; set; }

    /// <summary>Profissional responsável (single-tenant: texto livre ou nome do dono).</summary>
    public string? Profissional { get; set; }
    public string? Sala { get; set; }
    public string? Equipamento { get; set; }

    /// <summary>Token público para confirmação em 1 clique (WhatsApp / painel).</summary>
    public string? TokenConfirmacao { get; set; }
    public DateTime? ConfirmadoEm { get; set; }
    public DateTime? RealizadoEm { get; set; }
    public bool LembreteEnviado { get; set; }
    public bool PosConsultaEnviado { get; set; }
}
