using ClinicaX.Domain.Entities;

namespace ClinicaX.Application.Interfaces;

/// <summary>
/// Acesso unificado aos módulos operacionais. Toda leitura por id exige ClinicaId (anti-IDOR).
/// </summary>
public interface IModulosRepository
{
    // Anamnese
    Task<List<Anamnese>> GetAnamnesesAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default);
    Task<Anamnese?> GetAnamneseAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task AddAnamneseAsync(Anamnese entity, CancellationToken ct = default);
    Task DeleteAnamneseAsync(Anamnese entity, CancellationToken ct = default);

    // Contrato
    Task<List<Contrato>> GetContratosAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Contrato?> GetContratoAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task AddContratoAsync(Contrato entity, CancellationToken ct = default);
    Task UpdateContratoAsync(Contrato entity, CancellationToken ct = default);
    Task DeleteContratoAsync(Contrato entity, CancellationToken ct = default);

    // WhatsApp
    Task<List<WhatsAppConversa>> GetConversasAsync(Guid clinicaId, CancellationToken ct = default);
    Task<WhatsAppConversa?> GetConversaAsync(Guid clinicaId, Guid id, bool includeMensagens, CancellationToken ct = default);
    Task AddConversaAsync(WhatsAppConversa entity, CancellationToken ct = default);
    Task AddMensagemAsync(WhatsAppMensagem entity, CancellationToken ct = default);
    Task UpdateConversaAsync(WhatsAppConversa entity, CancellationToken ct = default);

    // Injetáveis
    Task<List<PlanoInjetavel>> GetPlanosInjetaveisAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default);
    Task<PlanoInjetavel?> GetPlanoInjetavelAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task AddPlanoInjetavelAsync(PlanoInjetavel entity, CancellationToken ct = default);
    Task UpdatePlanoInjetavelAsync(PlanoInjetavel entity, CancellationToken ct = default);
    Task DeletePlanoInjetavelAsync(PlanoInjetavel entity, CancellationToken ct = default);

    // Telemedicina
    Task<List<Teleconsulta>> GetTeleconsultasAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Teleconsulta?> GetTeleconsultaAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task AddTeleconsultaAsync(Teleconsulta entity, CancellationToken ct = default);
    Task UpdateTeleconsultaAsync(Teleconsulta entity, CancellationToken ct = default);

    // Financeiro
    Task<List<LancamentoFinanceiro>> GetLancamentosAsync(Guid clinicaId, DateTime? inicio, DateTime? fim, CancellationToken ct = default);
    Task<LancamentoFinanceiro?> GetLancamentoAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task AddLancamentoAsync(LancamentoFinanceiro entity, CancellationToken ct = default);
    Task UpdateLancamentoAsync(LancamentoFinanceiro entity, CancellationToken ct = default);
    Task DeleteLancamentoAsync(LancamentoFinanceiro entity, CancellationToken ct = default);

    // Vendas
    Task<List<Venda>> GetVendasAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Venda?> GetVendaAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task AddVendaAsync(Venda entity, CancellationToken ct = default);
    Task UpdateVendaAsync(Venda entity, CancellationToken ct = default);
    Task DeleteVendaAsync(Venda entity, CancellationToken ct = default);

    // Estoque
    Task<List<ProdutoEstoque>> GetProdutosAsync(Guid clinicaId, CancellationToken ct = default);
    Task<ProdutoEstoque?> GetProdutoAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task AddProdutoAsync(ProdutoEstoque entity, CancellationToken ct = default);
    Task UpdateProdutoAsync(ProdutoEstoque entity, CancellationToken ct = default);
    Task AddMovimentacaoAsync(MovimentacaoEstoque entity, CancellationToken ct = default);
    Task<List<MovimentacaoEstoque>> GetMovimentacoesAsync(Guid clinicaId, Guid? produtoId, CancellationToken ct = default);

    // Notas
    Task<List<NotaFiscal>> GetNotasAsync(Guid clinicaId, CancellationToken ct = default);
    Task<NotaFiscal?> GetNotaAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task AddNotaAsync(NotaFiscal entity, CancellationToken ct = default);
    Task UpdateNotaAsync(NotaFiscal entity, CancellationToken ct = default);

    // Transcrição
    Task<List<TranscricaoConsulta>> GetTranscricoesAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default);
    Task AddTranscricaoAsync(TranscricaoConsulta entity, CancellationToken ct = default);

    // Portal
    Task<List<PortalAcesso>> GetPortalAcessosAsync(Guid clinicaId, CancellationToken ct = default);
    Task<PortalAcesso?> GetPortalPorTokenAsync(string token, CancellationToken ct = default);
    Task<PortalAcesso?> GetPortalAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task AddPortalAsync(PortalAcesso entity, CancellationToken ct = default);
    Task UpdatePortalAsync(PortalAcesso entity, CancellationToken ct = default);

    // Avaliação facial
    Task<List<AvaliacaoFacial>> GetAvaliacoesFaciaisAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default);
    Task AddAvaliacaoFacialAsync(AvaliacaoFacial entity, CancellationToken ct = default);

    // Tarefas IA
    Task<List<TarefaIa>> GetTarefasAsync(Guid clinicaId, CancellationToken ct = default);
    Task<TarefaIa?> GetTarefaAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task AddTarefaAsync(TarefaIa entity, CancellationToken ct = default);
    Task UpdateTarefaAsync(TarefaIa entity, CancellationToken ct = default);
    Task DeleteTarefaAsync(TarefaIa entity, CancellationToken ct = default);

    // Textos IA
    Task<List<TextoIa>> GetTextosIaAsync(Guid clinicaId, CancellationToken ct = default);
    Task AddTextoIaAsync(TextoIa entity, CancellationToken ct = default);

    // Limpeza (reset demo)
    Task ClearModulosByClinicaAsync(Guid clinicaId, CancellationToken ct = default);
}
