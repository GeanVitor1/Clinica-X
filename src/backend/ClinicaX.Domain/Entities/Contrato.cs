namespace ClinicaX.Domain.Entities;

public enum StatusContrato
{
    Rascunho,
    Enviado,
    Assinado,
    Cancelado
}

/// <summary>Termos e contratos com pacientes.</summary>
public class Contrato : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid? PacienteId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Conteudo { get; set; } = string.Empty;
    public StatusContrato Status { get; set; } = StatusContrato.Rascunho;
    public DateTime? EnviadoEm { get; set; }
    public DateTime? AssinadoEm { get; set; }
    public string? AssinaturaNome { get; set; }
}
