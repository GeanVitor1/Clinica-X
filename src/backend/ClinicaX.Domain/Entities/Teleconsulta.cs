namespace ClinicaX.Domain.Entities;

public enum StatusTeleconsulta
{
    Agendada,
    EmAndamento,
    Concluida,
    Cancelada,
    Falta
}

/// <summary>Sessões de telemedicina.</summary>
public class Teleconsulta : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid PacienteId { get; set; }
    public Guid? AgendamentoId { get; set; }
    public string LinkSala { get; set; } = string.Empty;
    public DateTime DataHoraInicio { get; set; }
    public DateTime? DataHoraFim { get; set; }
    public StatusTeleconsulta Status { get; set; } = StatusTeleconsulta.Agendada;
    public string? Observacoes { get; set; }
}
