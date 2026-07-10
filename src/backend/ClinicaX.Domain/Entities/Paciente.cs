namespace ClinicaX.Domain.Entities;

public class Paciente : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public DateTime? DataNascimento { get; set; }
    public string? Observacoes { get; set; }
}
