namespace ClinicaX.Domain.Entities;

public enum StatusNotaFiscal
{
    Rascunho,
    Emitida,
    Cancelada,
    Erro
}

/// <summary>Emissão de notas fiscais (NFS-e / NF-e).</summary>
public class NotaFiscal : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid? PacienteId { get; set; }
    public Guid? VendaId { get; set; }
    public string Numero { get; set; } = string.Empty;
    public string? Serie { get; set; }
    public string? ChaveAcesso { get; set; }
    public decimal Valor { get; set; }
    public DateTime DataEmissao { get; set; } = DateTime.UtcNow;
    public StatusNotaFiscal Status { get; set; } = StatusNotaFiscal.Rascunho;
    public string? DescricaoServico { get; set; }
    public string? Observacoes { get; set; }
}
