namespace ClinicaX.Domain.Entities;

public enum StatusPlanoInjetavel
{
    Ativo,
    Pausado,
    Concluido,
    Cancelado
}

/// <summary>Planejador de injetáveis / protocolos de aplicação.</summary>
public class PlanoInjetavel : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid PacienteId { get; set; }
    public string Substancia { get; set; } = string.Empty;
    public string Protocolo { get; set; } = string.Empty;
    public string? AreaAplicacao { get; set; }
    public DateTime DataInicio { get; set; } = DateTime.UtcNow;
    public int TotalSessoes { get; set; }
    public int SessoesRealizadas { get; set; }
    public int IntervaloDias { get; set; } = 30;
    public DateTime? ProximaSessao { get; set; }
    public StatusPlanoInjetavel Status { get; set; } = StatusPlanoInjetavel.Ativo;
    public string? Observacoes { get; set; }
}
