namespace ClinicaX.Domain.Entities;

/// <summary>Ficha de anamnese clínica (personalizável por especialidade).</summary>
public class Anamnese : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid PacienteId { get; set; }
    public string Titulo { get; set; } = "Anamnese";
    public string? Especialidade { get; set; }
    public DateTime Data { get; set; } = DateTime.UtcNow;
    public string? QueixaPrincipal { get; set; }
    public string? HistoricoMedico { get; set; }
    public string? Alergias { get; set; }
    public string? MedicamentosUso { get; set; }
    public string? Habitos { get; set; }
    public string? Observacoes { get; set; }
    /// <summary>Campos extras em JSON (templates por especialidade).</summary>
    public string? CamposExtrasJson { get; set; }
}
