namespace ClinicaX.Domain.Entities;

/// <summary>Acesso do paciente ao painel (portal do paciente).</summary>
public class PortalAcesso : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid PacienteId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string TokenAcesso { get; set; } = string.Empty;
    public bool Habilitado { get; set; } = true;
    public DateTime? UltimoAcesso { get; set; }
    /// <summary>Expiração do link de acesso. Null = sem expiração (legado).</summary>
    public DateTime? ExpiraEm { get; set; }
    public string? Observacoes { get; set; }

    public bool EstaValido => Habilitado && Ativo && (ExpiraEm is null || ExpiraEm > DateTime.UtcNow);
}
