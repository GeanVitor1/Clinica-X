namespace ClinicaX.Domain.Entities;

public enum TipoNotificacao
{
    Confirmacao,
    Lembrete,
    Cancelamento,
    Remarcacao
}

public enum StatusNotificacao
{
    Pendente,
    Enviada,
    Falha,
    Lida
}

public class Notificacao : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid PacienteId { get; set; }
    public Guid? AgendamentoId { get; set; }
    public TipoNotificacao Tipo { get; set; }
    public string Mensagem { get; set; } = string.Empty;
    public StatusNotificacao Status { get; set; } = StatusNotificacao.Pendente;
    public DateTime? EnviadaEm { get; set; }
    public bool Lida { get; set; }
}
