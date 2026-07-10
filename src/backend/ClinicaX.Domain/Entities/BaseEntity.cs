namespace ClinicaX.Domain.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public bool Ativo { get; set; } = true;
}
