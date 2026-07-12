namespace ClinicaX.Domain.Entities;

public class Paciente : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public DateTime? DataNascimento { get; set; }
    public string? Observacoes { get; set; }
    public string? Convenio { get; set; }
    public string? NumeroCarteirinha { get; set; }
    public string? Endereco { get; set; }
    public string? ContatoEmergencia { get; set; }
    public string? TelefoneEmergencia { get; set; }
}
