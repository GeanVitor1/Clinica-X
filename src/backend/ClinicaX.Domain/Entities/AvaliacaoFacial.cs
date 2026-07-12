namespace ClinicaX.Domain.Entities;

/// <summary>Avaliação facial com IA — scores e recomendações.</summary>
public class AvaliacaoFacial : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid PacienteId { get; set; }
    public DateTime Data { get; set; } = DateTime.UtcNow;
    /// <summary>JSON com métricas (simetria, rugas, volume, etc.).</summary>
    public string ResultadoJson { get; set; } = "{}";
    public string? Observacoes { get; set; }
    public string? Recomendacoes { get; set; }
    public decimal? ScoreGeral { get; set; }
}
