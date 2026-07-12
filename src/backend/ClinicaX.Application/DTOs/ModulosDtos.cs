namespace ClinicaX.Application.DTOs;

// ── Anamnese ──────────────────────────────────────────────────
public record AnamneseDto(
    Guid Id, Guid PacienteId, string? PacienteNome, string Titulo, string? Especialidade, DateTime Data,
    string? QueixaPrincipal, string? HistoricoMedico, string? Alergias,
    string? MedicamentosUso, string? Habitos, string? Observacoes, string? CamposExtrasJson);

public record CreateAnamneseRequest(
    Guid PacienteId, string Titulo, string? Especialidade, DateTime? Data,
    string? QueixaPrincipal, string? HistoricoMedico, string? Alergias,
    string? MedicamentosUso, string? Habitos, string? Observacoes, string? CamposExtrasJson);

// ── Contrato ──────────────────────────────────────────────────
public record ContratoDto(
    Guid Id, Guid? PacienteId, string Titulo, string Conteudo, string Status,
    DateTime? EnviadoEm, DateTime? AssinadoEm, string? AssinaturaNome, DateTime CriadoEm);

public record CreateContratoRequest(Guid? PacienteId, string Titulo, string Conteudo);
public record UpdateContratoRequest(string Titulo, string Conteudo, string Status, string? AssinaturaNome);

// ── WhatsApp ──────────────────────────────────────────────────
public record WhatsAppConversaDto(
    Guid Id, Guid? PacienteId, string Telefone, string NomeContato,
    DateTime UltimaMensagemEm, bool NaoLida, int TotalMensagens);

public record WhatsAppMensagemDto(
    Guid Id, Guid ConversaId, string Direcao, string Conteudo,
    string Status, DateTime EnviadaEm, bool Automatica);

public record CreateWhatsAppConversaRequest(Guid? PacienteId, string Telefone, string NomeContato);
public record EnviarWhatsAppMensagemRequest(string Conteudo, bool Automatica = false);

// ── Injetáveis ────────────────────────────────────────────────
public record PlanoInjetavelDto(
    Guid Id, Guid PacienteId, string? PacienteNome, string Substancia, string Protocolo, string? AreaAplicacao,
    DateTime DataInicio, int TotalSessoes, int SessoesRealizadas, int IntervaloDias,
    DateTime? ProximaSessao, string Status, string? Observacoes);

public record CreatePlanoInjetavelRequest(
    Guid PacienteId, string Substancia, string Protocolo, string? AreaAplicacao,
    DateTime? DataInicio, int TotalSessoes, int IntervaloDias, string? Observacoes);

public record UpdatePlanoInjetavelRequest(
    string Substancia, string Protocolo, string? AreaAplicacao,
    int TotalSessoes, int SessoesRealizadas, int IntervaloDias,
    DateTime? ProximaSessao, string Status, string? Observacoes);

// ── Telemedicina ──────────────────────────────────────────────
public record TeleconsultaDto(
    Guid Id, Guid PacienteId, string? PacienteNome, Guid? AgendamentoId, string LinkSala,
    DateTime DataHoraInicio, DateTime? DataHoraFim, string Status, string? Observacoes);

public record CreateTeleconsultaRequest(
    Guid PacienteId, Guid? AgendamentoId, DateTime DataHoraInicio, string? Observacoes);

// ── Financeiro ────────────────────────────────────────────────
public record LancamentoFinanceiroDto(
    Guid Id, Guid? PacienteId, Guid? AgendamentoId, string Tipo, string Categoria,
    string Descricao, decimal Valor, DateTime Data, DateTime? DataVencimento,
    DateTime? DataPagamento, string Status, string? FormaPagamento);

public record CreateLancamentoRequest(
    Guid? PacienteId, Guid? AgendamentoId, string Tipo, string Categoria,
    string Descricao, decimal Valor, DateTime? Data, DateTime? DataVencimento,
    string? FormaPagamento, string? Status);

public record ResumoFinanceiroDto(
    decimal TotalReceitas, decimal TotalDespesas, decimal Saldo,
    decimal ReceitasPendentes, decimal DespesasPendentes, int QtdLancamentos);

// ── Vendas ────────────────────────────────────────────────────
public record VendaItemDto(Guid Id, Guid? ProdutoId, Guid? ServicoId, string Descricao, int Quantidade, decimal ValorUnitario, decimal Total);
public record VendaDto(
    Guid Id, Guid? PacienteId, DateTime Data, decimal Subtotal, decimal Desconto,
    decimal Total, string Status, string? FormaPagamento, string? Observacoes, List<VendaItemDto> Itens);

public record CreateVendaItemRequest(Guid? ProdutoId, Guid? ServicoId, string Descricao, int Quantidade, decimal ValorUnitario);
public record CreateVendaRequest(Guid? PacienteId, decimal Desconto, string? FormaPagamento, string? Observacoes, List<CreateVendaItemRequest> Itens);

// ── Estoque ───────────────────────────────────────────────────
public record ProdutoEstoqueDto(
    Guid Id, string Nome, string? Sku, string Unidade, int Quantidade, int QuantidadeMinima,
    decimal CustoUnitario, decimal PrecoVenda, string? Categoria, bool AbaixoMinimo);

public record CreateProdutoEstoqueRequest(
    string Nome, string? Sku, string Unidade, int Quantidade, int QuantidadeMinima,
    decimal CustoUnitario, decimal PrecoVenda, string? Categoria);

public record MovimentacaoEstoqueDto(Guid Id, Guid ProdutoId, string Tipo, int Quantidade, string? Motivo, DateTime Data);
public record CreateMovimentacaoRequest(Guid ProdutoId, string Tipo, int Quantidade, string? Motivo);

// ── Notas fiscais ─────────────────────────────────────────────
public record NotaFiscalDto(
    Guid Id, Guid? PacienteId, Guid? VendaId, string Numero, string? Serie,
    string? ChaveAcesso, decimal Valor, DateTime DataEmissao, string Status,
    string? DescricaoServico, string? Observacoes);

public record CreateNotaFiscalRequest(
    Guid? PacienteId, Guid? VendaId, decimal Valor, string? DescricaoServico, string? Observacoes);

// ── Transcrição ───────────────────────────────────────────────
public record TranscricaoDto(
    Guid Id, Guid PacienteId, Guid? AgendamentoId, DateTime Data,
    string Texto, string? Resumo, string Status, int? DuracaoSegundos);

public record CreateTranscricaoRequest(
    Guid PacienteId, Guid? AgendamentoId, string Texto, string? Resumo, int? DuracaoSegundos);

// ── Portal paciente ───────────────────────────────────────────
public record PortalAcessoDto(
    Guid Id, Guid PacienteId, string Email, string? TokenAcesso,
    bool Habilitado, DateTime? UltimoAcesso, DateTime? ExpiraEm, string? Observacoes,
    string? LinkAcesso = null);

public record CreatePortalAcessoRequest(Guid PacienteId, string Email, string? Observacoes, int? ValidadeDias = 30);

// ── Estoque update ────────────────────────────────────────────
public record UpdateProdutoEstoqueRequest(
    string Nome, string? Sku, string Unidade, int QuantidadeMinima,
    decimal CustoUnitario, decimal PrecoVenda, string? Categoria);

public record PortalPacienteViewDto(
    string NomePaciente, string NomeClinica, List<AgendamentoResumoPortal> ProximosAgendamentos,
    List<string> DocumentosDisponiveis);

public record AgendamentoResumoPortal(DateTime DataHora, string Servico, string Status);

// ── Avaliação facial ──────────────────────────────────────────
public record AvaliacaoFacialDto(
    Guid Id, Guid PacienteId, DateTime Data, string ResultadoJson,
    string? Observacoes, string? Recomendacoes, decimal? ScoreGeral);

public record CreateAvaliacaoFacialRequest(
    Guid PacienteId, string? Observacoes);

// ── Tarefas IA ────────────────────────────────────────────────
public record TarefaIaDto(
    Guid Id, string Titulo, string? Descricao, string Status, string Prioridade,
    DateTime? Prazo, bool GeradaPorIa, Guid? PacienteId, DateTime CriadoEm);

public record CreateTarefaIaRequest(
    string Titulo, string? Descricao, string? Prioridade, DateTime? Prazo, Guid? PacienteId);

public record UpdateTarefaIaRequest(string Titulo, string? Descricao, string Status, string Prioridade, DateTime? Prazo);

// ── Agente de textos ──────────────────────────────────────────
public record TextoIaDto(Guid Id, string Tipo, string Prompt, string Resultado, DateTime CriadoEm);
public record GerarTextoIaRequest(string Tipo, string Prompt);
public record EnviarTextoIaRequest(string Tipo, string Resultado, string? PacienteTelefone);

// ── Register ──────────────────────────────────────────────────
public record RegisterRequest(
    string NomeClinica,
    string Email,
    string Senha,
    string Telefone,
    string? Endereco,
    string? NomeResponsavel);

public record RegisterResponse(string Token, string Nome, string Email, bool IsDemo, Guid ClinicaId);
