namespace ClinicaX.Domain.Entities;

/// <summary>Horário bloqueado (folga, manutenção de sala/equipamento, etc.).</summary>
public class BloqueioAgenda : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public DateTime DataHoraInicio { get; set; }
    public DateTime DataHoraFim { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string? Profissional { get; set; }
    public string? Sala { get; set; }
    public string? Equipamento { get; set; }
}
