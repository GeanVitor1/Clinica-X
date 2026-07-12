namespace ClinicaX.Domain.Entities;

public enum StatusTranscricao
{
    Processando,
    Concluida,
    Erro
}

/// <summary>Transcrição de consultas (áudio → texto).</summary>
public class TranscricaoConsulta : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid PacienteId { get; set; }
    public Guid? AgendamentoId { get; set; }
    public DateTime Data { get; set; } = DateTime.UtcNow;
    public string Texto { get; set; } = string.Empty;
    public string? Resumo { get; set; }
    public StatusTranscricao Status { get; set; } = StatusTranscricao.Concluida;
    public int? DuracaoSegundos { get; set; }
}
