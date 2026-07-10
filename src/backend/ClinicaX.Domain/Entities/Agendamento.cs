namespace ClinicaX.Domain.Entities;

public enum AgendamentoStatus
{
    Agendado,
    Confirmado,
    Cancelado,
    Realizado
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
}
