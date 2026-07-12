namespace ClinicaX.Domain.Entities;

public class Servico : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public int DuracaoMin { get; set; }
    public decimal Valor { get; set; }
    public string? Cor { get; set; }
    /// <summary>Percentual de comissão do profissional (0–100).</summary>
    public decimal PercentualComissao { get; set; }
}
