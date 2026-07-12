using ClinicaX.Application.DTOs;
using FluentResults;

namespace ClinicaX.Application.Services;

public interface IModulosService
{
    // Anamnese
    Task<Result<List<AnamneseDto>>> ListAnamnesesAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default);
    Task<Result<AnamneseDto>> CreateAnamneseAsync(Guid clinicaId, CreateAnamneseRequest req, CancellationToken ct = default);
    Task<Result> DeleteAnamneseAsync(Guid clinicaId, Guid id, CancellationToken ct = default);

    // Contratos
    Task<Result<List<ContratoDto>>> ListContratosAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Result<ContratoDto>> CreateContratoAsync(Guid clinicaId, CreateContratoRequest req, CancellationToken ct = default);
    Task<Result<ContratoDto>> UpdateContratoAsync(Guid clinicaId, Guid id, UpdateContratoRequest req, CancellationToken ct = default);
    Task<Result> DeleteContratoAsync(Guid clinicaId, Guid id, CancellationToken ct = default);

    // WhatsApp
    Task<Result<List<WhatsAppConversaDto>>> ListConversasAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Result<List<WhatsAppMensagemDto>>> GetMensagensAsync(Guid clinicaId, Guid conversaId, CancellationToken ct = default);
    Task<Result<WhatsAppConversaDto>> CreateConversaAsync(Guid clinicaId, CreateWhatsAppConversaRequest req, CancellationToken ct = default);
    Task<Result<WhatsAppMensagemDto>> EnviarMensagemAsync(Guid clinicaId, Guid conversaId, EnviarWhatsAppMensagemRequest req, CancellationToken ct = default);

    // Injetáveis
    Task<Result<List<PlanoInjetavelDto>>> ListPlanosAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default);
    Task<Result<PlanoInjetavelDto>> CreatePlanoAsync(Guid clinicaId, CreatePlanoInjetavelRequest req, CancellationToken ct = default);
    Task<Result<PlanoInjetavelDto>> UpdatePlanoAsync(Guid clinicaId, Guid id, UpdatePlanoInjetavelRequest req, CancellationToken ct = default);
    Task<Result> DeletePlanoAsync(Guid clinicaId, Guid id, CancellationToken ct = default);

    // Telemedicina
    Task<Result<List<TeleconsultaDto>>> ListTeleconsultasAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Result<TeleconsultaDto>> CreateTeleconsultaAsync(Guid clinicaId, CreateTeleconsultaRequest req, CancellationToken ct = default);
    Task<Result<TeleconsultaDto>> UpdateStatusTeleconsultaAsync(Guid clinicaId, Guid id, string status, CancellationToken ct = default);

    // Financeiro
    Task<Result<List<LancamentoFinanceiroDto>>> ListLancamentosAsync(Guid clinicaId, DateTime? inicio, DateTime? fim, CancellationToken ct = default);
    Task<Result<ResumoFinanceiroDto>> ResumoFinanceiroAsync(Guid clinicaId, DateTime? inicio, DateTime? fim, CancellationToken ct = default);
    Task<Result<LancamentoFinanceiroDto>> CreateLancamentoAsync(Guid clinicaId, CreateLancamentoRequest req, CancellationToken ct = default);
    Task<Result> DeleteLancamentoAsync(Guid clinicaId, Guid id, CancellationToken ct = default);

    // Vendas
    Task<Result<List<VendaDto>>> ListVendasAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Result<VendaDto>> CreateVendaAsync(Guid clinicaId, CreateVendaRequest req, CancellationToken ct = default);
    Task<Result<VendaDto>> PagarVendaAsync(Guid clinicaId, Guid id, string? formaPagamento, CancellationToken ct = default);
    Task<Result> DeleteVendaAsync(Guid clinicaId, Guid id, CancellationToken ct = default);

    // Estoque
    Task<Result<List<ProdutoEstoqueDto>>> ListProdutosAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Result<ProdutoEstoqueDto>> CreateProdutoAsync(Guid clinicaId, CreateProdutoEstoqueRequest req, CancellationToken ct = default);
    Task<Result<ProdutoEstoqueDto>> UpdateProdutoAsync(Guid clinicaId, Guid id, UpdateProdutoEstoqueRequest req, CancellationToken ct = default);
    Task<Result> DeleteProdutoAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task<Result<MovimentacaoEstoqueDto>> MovimentarEstoqueAsync(Guid clinicaId, CreateMovimentacaoRequest req, CancellationToken ct = default);
    Task<Result<List<MovimentacaoEstoqueDto>>> ListMovimentacoesAsync(Guid clinicaId, Guid? produtoId, CancellationToken ct = default);

    // Notas
    Task<Result<List<NotaFiscalDto>>> ListNotasAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Result<NotaFiscalDto>> EmitirNotaAsync(Guid clinicaId, CreateNotaFiscalRequest req, CancellationToken ct = default);

    // Transcrição
    Task<Result<List<TranscricaoDto>>> ListTranscricoesAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default);
    Task<Result<TranscricaoDto>> CreateTranscricaoAsync(Guid clinicaId, CreateTranscricaoRequest req, CancellationToken ct = default);

    // Portal
    Task<Result<List<PortalAcessoDto>>> ListPortalAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Result<PortalAcessoDto>> CreatePortalAsync(Guid clinicaId, CreatePortalAcessoRequest req, CancellationToken ct = default);
    Task<Result<PortalPacienteViewDto>> GetPortalByTokenAsync(string token, CancellationToken ct = default);

    // Avaliação facial
    Task<Result<List<AvaliacaoFacialDto>>> ListAvaliacoesAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default);
    Task<Result<AvaliacaoFacialDto>> CreateAvaliacaoAsync(Guid clinicaId, CreateAvaliacaoFacialRequest req, CancellationToken ct = default);

    // Tarefas IA
    Task<Result<List<TarefaIaDto>>> ListTarefasAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Result<TarefaIaDto>> CreateTarefaAsync(Guid clinicaId, CreateTarefaIaRequest req, CancellationToken ct = default);
    Task<Result<TarefaIaDto>> UpdateTarefaAsync(Guid clinicaId, Guid id, UpdateTarefaIaRequest req, CancellationToken ct = default);
    Task<Result> DeleteTarefaAsync(Guid clinicaId, Guid id, CancellationToken ct = default);
    Task<Result<List<TarefaIaDto>>> SugerirTarefasIaAsync(Guid clinicaId, CancellationToken ct = default);

    // Agente textos
    Task<Result<List<TextoIaDto>>> ListTextosAsync(Guid clinicaId, CancellationToken ct = default);
    Task<Result<TextoIaDto>> GerarTextoAsync(Guid clinicaId, GerarTextoIaRequest req, CancellationToken ct = default);
    Task<Result> EnviarTextoAsync(Guid clinicaId, EnviarTextoIaRequest req, CancellationToken ct = default);
}
