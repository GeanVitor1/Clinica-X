namespace ClinicaX.Domain.Entities;

public enum TipoEvento
{
    PacienteCriado,
    PacienteEditado,
    AgendamentoCriado,
    AgendamentoCancelado,
    AgendamentoRemarcado,
    NotificacaoEnviada
}

public class Evento : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid? PacienteId { get; set; }
    public TipoEvento Tipo { get; set; }
    public string Descricao { get; set; } = string.Empty;
}
