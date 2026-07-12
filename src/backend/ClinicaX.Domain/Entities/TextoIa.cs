namespace ClinicaX.Domain.Entities;

/// <summary>Histórico do agente de IA para textos (e-mails, posts, contratos, etc.).</summary>
public class TextoIa : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public string Tipo { get; set; } = "geral";
    public string Prompt { get; set; } = string.Empty;
    public string Resultado { get; set; } = string.Empty;
}
