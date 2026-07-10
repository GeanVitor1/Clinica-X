namespace ClinicaX.Domain.Entities;

public class Anexo : BaseEntity
{
    public Guid ProntuarioId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Tamanho { get; set; }
    public byte[] Dados { get; set; } = [];
}
