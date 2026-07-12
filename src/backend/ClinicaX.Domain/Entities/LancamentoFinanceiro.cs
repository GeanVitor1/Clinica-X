namespace ClinicaX.Domain.Entities;

public enum TipoLancamento
{
    Receita,
    Despesa
}

public enum StatusLancamento
{
    Pendente,
    Pago,
    Cancelado,
    Atrasado
}

/// <summary>Gestão financeira — receitas e despesas da clínica.</summary>
public class LancamentoFinanceiro : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid? PacienteId { get; set; }
    public Guid? AgendamentoId { get; set; }
    public TipoLancamento Tipo { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public DateTime Data { get; set; } = DateTime.UtcNow;
    public DateTime? DataVencimento { get; set; }
    public DateTime? DataPagamento { get; set; }
    public StatusLancamento Status { get; set; } = StatusLancamento.Pendente;
    public string? FormaPagamento { get; set; }
    /// <summary>Valor de comissão gerado (despesa vinculada opcionalmente).</summary>
    public decimal? ValorComissao { get; set; }
    public string? Profissional { get; set; }
}
