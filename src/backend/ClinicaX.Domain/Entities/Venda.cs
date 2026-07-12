namespace ClinicaX.Domain.Entities;

public enum StatusVenda
{
    Aberta,
    Paga,
    Cancelada,
    Parcial
}

/// <summary>Vendas de produtos/serviços.</summary>
public class Venda : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid? PacienteId { get; set; }
    public DateTime Data { get; set; } = DateTime.UtcNow;
    public decimal Subtotal { get; set; }
    public decimal Desconto { get; set; }
    public decimal Total { get; set; }
    public StatusVenda Status { get; set; } = StatusVenda.Aberta;
    public string? FormaPagamento { get; set; }
    public string? Observacoes { get; set; }
    public ICollection<VendaItem> Itens { get; set; } = new List<VendaItem>();
}

public class VendaItem : BaseEntity
{
    public Guid VendaId { get; set; }
    public Guid? ProdutoId { get; set; }
    public Guid? ServicoId { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public int Quantidade { get; set; } = 1;
    public decimal ValorUnitario { get; set; }
    public decimal Total => Quantidade * ValorUnitario;
}
