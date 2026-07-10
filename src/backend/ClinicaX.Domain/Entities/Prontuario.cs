namespace ClinicaX.Domain.Entities;

public class Prontuario : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid PacienteId { get; set; }
    public Guid? AgendamentoId { get; set; }
    public DateTime Data { get; set; }
    public string? Descricao { get; set; }
    public string? Diagnostico { get; set; }
    public string? Prescricao { get; set; }

    public List<Anexo> Anexos { get; set; } = [];
}
