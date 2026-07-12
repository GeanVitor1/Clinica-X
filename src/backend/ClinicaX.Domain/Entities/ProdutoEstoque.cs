namespace ClinicaX.Domain.Entities;

public enum TipoMovimentacaoEstoque
{
    Entrada,
    Saida,
    Ajuste
}

/// <summary>Produto em estoque da clínica.</summary>
public class ProdutoEstoque : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public string Unidade { get; set; } = "un";
    public int Quantidade { get; set; }
    public int QuantidadeMinima { get; set; }
    public decimal CustoUnitario { get; set; }
    public decimal PrecoVenda { get; set; }
    public string? Categoria { get; set; }
}

public class MovimentacaoEstoque : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid ProdutoId { get; set; }
    public TipoMovimentacaoEstoque Tipo { get; set; }
    public int Quantidade { get; set; }
    public string? Motivo { get; set; }
    public DateTime Data { get; set; } = DateTime.UtcNow;
}
