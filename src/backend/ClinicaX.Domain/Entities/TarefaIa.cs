namespace ClinicaX.Domain.Entities;

public enum StatusTarefa
{
    Pendente,
    EmAndamento,
    Concluida,
    Cancelada
}

public enum PrioridadeTarefa
{
    Baixa,
    Media,
    Alta,
    Urgente
}

/// <summary>Assistente de tarefas com IA.</summary>
public class TarefaIa : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public StatusTarefa Status { get; set; } = StatusTarefa.Pendente;
    public PrioridadeTarefa Prioridade { get; set; } = PrioridadeTarefa.Media;
    public DateTime? Prazo { get; set; }
    public bool GeradaPorIa { get; set; }
    public Guid? PacienteId { get; set; }
}
