using System.Text.Json;
using ClinicaX.Application.DTOs;
using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using FluentResults;
using Microsoft.Extensions.Logging;

namespace ClinicaX.Application.Services;

public class ModulosService : IModulosService
{
    private readonly IModulosRepository _repo;
    private readonly IPacienteRepository _pacientes;
    private readonly IAgendamentoRepository _agendamentos;
    private readonly IClinicaRepository _clinicas;
    private readonly IServicoRepository _servicos;
    private readonly IUnitOfWork _uow;
    private readonly ITextSenderService _textSender;
    private readonly ILogger<ModulosService> _logger;

    public ModulosService(
        IModulosRepository repo,
        IPacienteRepository pacientes,
        IAgendamentoRepository agendamentos,
        IClinicaRepository clinicas,
        IServicoRepository servicos,
        IUnitOfWork uow,
        ITextSenderService textSender,
        ILogger<ModulosService> logger)
    {
        _repo = repo;
        _pacientes = pacientes;
        _agendamentos = agendamentos;
        _clinicas = clinicas;
        _servicos = servicos;
        _uow = uow;
        _textSender = textSender;
        _logger = logger;
    }

    // ── Anamnese ──────────────────────────────────────────────
    public async Task<Result<List<AnamneseDto>>> ListAnamnesesAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default)
    {
        var list = await _repo.GetAnamnesesAsync(clinicaId, pacienteId, ct);
        var pacientes = await _pacientes.GetAllAsync(clinicaId, pageSize: 200, ativo: null, ct: ct);
        var pacDict = pacientes.ToDictionary(p => p.Id, p => p.Nome);
        return Result.Ok(list.Select(x => ToAnamneseDto(x, pacDict)).ToList());
    }

    public async Task<Result<AnamneseDto>> CreateAnamneseAsync(Guid clinicaId, CreateAnamneseRequest req, CancellationToken ct = default)
    {
        var pac = await _pacientes.GetByIdAndClinicaAsync(clinicaId, req.PacienteId, ct);
        if (pac is null) return Result.Fail("Paciente não encontrado nesta clínica.");

        var entity = new Anamnese
        {
            ClinicaId = clinicaId,
            PacienteId = req.PacienteId,
            Titulo = string.IsNullOrWhiteSpace(req.Titulo) ? "Anamnese" : req.Titulo,
            Especialidade = req.Especialidade,
            Data = req.Data ?? DateTime.UtcNow,
            QueixaPrincipal = req.QueixaPrincipal,
            HistoricoMedico = req.HistoricoMedico,
            Alergias = req.Alergias,
            MedicamentosUso = req.MedicamentosUso,
            Habitos = req.Habitos,
            Observacoes = req.Observacoes,
            CamposExtrasJson = req.CamposExtrasJson
        };
        await _repo.AddAnamneseAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToAnamneseDto(entity, new Dictionary<Guid, string> { [pac.Id] = pac.Nome }));
    }

    public async Task<Result> DeleteAnamneseAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetAnamneseAsync(clinicaId, id, ct);
        if (e is null) return Result.Fail("Anamnese não encontrada.");
        await _repo.DeleteAnamneseAsync(e, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    // ── Contratos ─────────────────────────────────────────────
    public async Task<Result<List<ContratoDto>>> ListContratosAsync(Guid clinicaId, CancellationToken ct = default)
    {
        var list = await _repo.GetContratosAsync(clinicaId, ct);
        return Result.Ok(list.Select(ToContratoDto).ToList());
    }

    public async Task<Result<ContratoDto>> CreateContratoAsync(Guid clinicaId, CreateContratoRequest req, CancellationToken ct = default)
    {
        if (req.PacienteId.HasValue)
        {
            var pac = await _pacientes.GetByIdAndClinicaAsync(clinicaId, req.PacienteId.Value, ct);
            if (pac is null) return Result.Fail("Paciente não encontrado nesta clínica.");
        }

        var entity = new Contrato
        {
            ClinicaId = clinicaId,
            PacienteId = req.PacienteId,
            Titulo = req.Titulo,
            Conteudo = req.Conteudo,
            Status = StatusContrato.Rascunho
        };
        await _repo.AddContratoAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToContratoDto(entity));
    }

    public async Task<Result<ContratoDto>> UpdateContratoAsync(Guid clinicaId, Guid id, UpdateContratoRequest req, CancellationToken ct = default)
    {
        var e = await _repo.GetContratoAsync(clinicaId, id, ct);
        if (e is null) return Result.Fail("Contrato não encontrado.");
        e.Titulo = req.Titulo;
        e.Conteudo = req.Conteudo;
        if (Enum.TryParse<StatusContrato>(req.Status, true, out var st)) e.Status = st;
        e.AssinaturaNome = req.AssinaturaNome;
        if (e.Status == StatusContrato.Enviado && e.EnviadoEm is null) e.EnviadoEm = DateTime.UtcNow;
        if (e.Status == StatusContrato.Assinado && e.AssinadoEm is null) e.AssinadoEm = DateTime.UtcNow;
        await _repo.UpdateContratoAsync(e, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToContratoDto(e));
    }

    public async Task<Result> DeleteContratoAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetContratoAsync(clinicaId, id, ct);
        if (e is null) return Result.Fail("Contrato não encontrado.");
        await _repo.DeleteContratoAsync(e, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    // ── WhatsApp ──────────────────────────────────────────────
    public async Task<Result<List<WhatsAppConversaDto>>> ListConversasAsync(Guid clinicaId, CancellationToken ct = default)
    {
        var list = await _repo.GetConversasAsync(clinicaId, ct);
        return Result.Ok(list.Select(c => new WhatsAppConversaDto(
            c.Id, c.PacienteId, c.Telefone, c.NomeContato, c.UltimaMensagemEm, c.NaoLida, c.Mensagens?.Count ?? 0)).ToList());
    }

    public async Task<Result<List<WhatsAppMensagemDto>>> GetMensagensAsync(Guid clinicaId, Guid conversaId, CancellationToken ct = default)
    {
        var c = await _repo.GetConversaAsync(clinicaId, conversaId, includeMensagens: true, ct);
        if (c is null) return Result.Fail("Conversa não encontrada.");
        c.NaoLida = false;
        await _repo.UpdateConversaAsync(c, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(c.Mensagens.OrderBy(m => m.EnviadaEm).Select(ToMsgDto).ToList());
    }

    public async Task<Result<WhatsAppConversaDto>> CreateConversaAsync(Guid clinicaId, CreateWhatsAppConversaRequest req, CancellationToken ct = default)
    {
        if (req.PacienteId.HasValue)
        {
            var pac = await _pacientes.GetByIdAndClinicaAsync(clinicaId, req.PacienteId.Value, ct);
            if (pac is null) return Result.Fail("Paciente não encontrado nesta clínica.");
        }

        var entity = new WhatsAppConversa
        {
            ClinicaId = clinicaId,
            PacienteId = req.PacienteId,
            Telefone = req.Telefone,
            NomeContato = req.NomeContato,
            UltimaMensagemEm = DateTime.UtcNow
        };
        await _repo.AddConversaAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(new WhatsAppConversaDto(entity.Id, entity.PacienteId, entity.Telefone, entity.NomeContato, entity.UltimaMensagemEm, false, 0));
    }

    public async Task<Result<WhatsAppMensagemDto>> EnviarMensagemAsync(Guid clinicaId, Guid conversaId, EnviarWhatsAppMensagemRequest req, CancellationToken ct = default)
    {
        var c = await _repo.GetConversaAsync(clinicaId, conversaId, false, ct);
        if (c is null) return Result.Fail("Conversa não encontrada.");
        if (string.IsNullOrWhiteSpace(req.Conteudo))
            return Result.Fail("Mensagem vazia.");

        var enviado = await _textSender.SendWhatsAppAsync(c.Telefone, req.Conteudo, ct);
        var msg = new WhatsAppMensagem
        {
            ConversaId = conversaId,
            Direcao = DirecaoMensagem.Saida,
            Conteudo = req.Conteudo,
            Status = enviado ? StatusMensagemWhatsApp.Enviada : StatusMensagemWhatsApp.Falha,
            EnviadaEm = DateTime.UtcNow,
            Automatica = req.Automatica
        };
        await _repo.AddMensagemAsync(msg, ct);
        c.UltimaMensagemEm = msg.EnviadaEm;
        await _repo.UpdateConversaAsync(c, ct);
        await _uow.SaveChangesAsync(ct);
        return enviado ? Result.Ok(ToMsgDto(msg)) : Result.Fail("Falha ao enviar mensagem WhatsApp.");
    }

    // ── Injetáveis ────────────────────────────────────────────
    public async Task<Result<List<PlanoInjetavelDto>>> ListPlanosAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default)
    {
        var list = await _repo.GetPlanosInjetaveisAsync(clinicaId, pacienteId, ct);
        var pacientes = await _pacientes.GetAllAsync(clinicaId, pageSize: 200, ativo: null, ct: ct);
        var pacDict = pacientes.ToDictionary(p => p.Id, p => p.Nome);
        return Result.Ok(list.Select(x => ToPlanoDto(x, pacDict)).ToList());
    }

    public async Task<Result<PlanoInjetavelDto>> CreatePlanoAsync(Guid clinicaId, CreatePlanoInjetavelRequest req, CancellationToken ct = default)
    {
        var pac = await _pacientes.GetByIdAndClinicaAsync(clinicaId, req.PacienteId, ct);
        if (pac is null) return Result.Fail("Paciente não encontrado nesta clínica.");

        var inicio = req.DataInicio ?? DateTime.UtcNow;
        var entity = new PlanoInjetavel
        {
            ClinicaId = clinicaId,
            PacienteId = req.PacienteId,
            Substancia = req.Substancia,
            Protocolo = req.Protocolo,
            AreaAplicacao = req.AreaAplicacao,
            DataInicio = inicio,
            TotalSessoes = req.TotalSessoes,
            IntervaloDias = req.IntervaloDias > 0 ? req.IntervaloDias : 30,
            ProximaSessao = inicio.AddDays(req.IntervaloDias > 0 ? req.IntervaloDias : 30),
            Observacoes = req.Observacoes
        };
        await _repo.AddPlanoInjetavelAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToPlanoDto(entity, new Dictionary<Guid, string> { [pac.Id] = pac.Nome }));
    }

    public async Task<Result<PlanoInjetavelDto>> UpdatePlanoAsync(Guid clinicaId, Guid id, UpdatePlanoInjetavelRequest req, CancellationToken ct = default)
    {
        var e = await _repo.GetPlanoInjetavelAsync(clinicaId, id, ct);
        if (e is null) return Result.Fail("Plano não encontrado.");
        e.Substancia = req.Substancia;
        e.Protocolo = req.Protocolo;
        e.AreaAplicacao = req.AreaAplicacao;
        e.TotalSessoes = req.TotalSessoes;
        e.SessoesRealizadas = req.SessoesRealizadas;
        e.IntervaloDias = req.IntervaloDias;
        e.ProximaSessao = req.ProximaSessao;
        e.Observacoes = req.Observacoes;
        if (Enum.TryParse<StatusPlanoInjetavel>(req.Status, true, out var st)) e.Status = st;
        await _repo.UpdatePlanoInjetavelAsync(e, ct);
        await _uow.SaveChangesAsync(ct);
        var pac = await _pacientes.GetByIdAndClinicaAsync(clinicaId, e.PacienteId, ct);
        return Result.Ok(ToPlanoDto(e, pac is not null ? new Dictionary<Guid, string> { [pac.Id] = pac.Nome } : null));
    }

    public async Task<Result> DeletePlanoAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetPlanoInjetavelAsync(clinicaId, id, ct);
        if (e is null) return Result.Fail("Plano não encontrado.");
        await _repo.DeletePlanoInjetavelAsync(e, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    // ── Telemedicina ──────────────────────────────────────────
    public async Task<Result<List<TeleconsultaDto>>> ListTeleconsultasAsync(Guid clinicaId, CancellationToken ct = default)
    {
        var list = await _repo.GetTeleconsultasAsync(clinicaId, ct);
        var pacientes = await _pacientes.GetAllAsync(clinicaId, pageSize: 200, ativo: null, ct: ct);
        var pacDict = pacientes.ToDictionary(p => p.Id, p => p.Nome);
        return Result.Ok(list.Select(x => ToTeleDto(x, pacDict)).ToList());
    }

    public async Task<Result<TeleconsultaDto>> CreateTeleconsultaAsync(Guid clinicaId, CreateTeleconsultaRequest req, CancellationToken ct = default)
    {
        var pac = await _pacientes.GetByIdAndClinicaAsync(clinicaId, req.PacienteId, ct);
        if (pac is null) return Result.Fail("Paciente não encontrado nesta clínica.");

        var room = Guid.NewGuid().ToString("N")[..12];
        var entity = new Teleconsulta
        {
            ClinicaId = clinicaId,
            PacienteId = req.PacienteId,
            AgendamentoId = req.AgendamentoId,
            LinkSala = $"https://meet.clinicax.app/sala/{room}",
            DataHoraInicio = req.DataHoraInicio,
            Observacoes = req.Observacoes
        };
        await _repo.AddTeleconsultaAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToTeleDto(entity, new Dictionary<Guid, string> { [pac.Id] = pac.Nome }));
    }

    public async Task<Result<TeleconsultaDto>> UpdateStatusTeleconsultaAsync(Guid clinicaId, Guid id, string status, CancellationToken ct = default)
    {
        var e = await _repo.GetTeleconsultaAsync(clinicaId, id, ct);
        if (e is null) return Result.Fail("Teleconsulta não encontrada.");
        if (Enum.TryParse<StatusTeleconsulta>(status, true, out var st)) e.Status = st;
        if (st == StatusTeleconsulta.Concluida) e.DataHoraFim = DateTime.UtcNow;
        await _repo.UpdateTeleconsultaAsync(e, ct);
        await _uow.SaveChangesAsync(ct);
        var pac = await _pacientes.GetByIdAndClinicaAsync(clinicaId, e.PacienteId, ct);
        return Result.Ok(ToTeleDto(e, pac is not null ? new Dictionary<Guid, string> { [pac.Id] = pac.Nome } : null));
    }

    // ── Financeiro ────────────────────────────────────────────
    public async Task<Result<List<LancamentoFinanceiroDto>>> ListLancamentosAsync(Guid clinicaId, DateTime? inicio, DateTime? fim, CancellationToken ct = default)
    {
        var list = await _repo.GetLancamentosAsync(clinicaId, inicio, fim, ct);
        return Result.Ok(list.Select(ToLancDto).ToList());
    }

    public async Task<Result<ResumoFinanceiroDto>> ResumoFinanceiroAsync(Guid clinicaId, DateTime? inicio, DateTime? fim, CancellationToken ct = default)
    {
        var list = await _repo.GetLancamentosAsync(clinicaId, inicio, fim, ct);
        var receitas = list.Where(x => x.Tipo == TipoLancamento.Receita && x.Status != StatusLancamento.Cancelado).Sum(x => x.Valor);
        var despesas = list.Where(x => x.Tipo == TipoLancamento.Despesa && x.Status != StatusLancamento.Cancelado).Sum(x => x.Valor);
        var recPend = list.Where(x => x.Tipo == TipoLancamento.Receita && x.Status == StatusLancamento.Pendente).Sum(x => x.Valor);
        var desPend = list.Where(x => x.Tipo == TipoLancamento.Despesa && x.Status == StatusLancamento.Pendente).Sum(x => x.Valor);
        return Result.Ok(new ResumoFinanceiroDto(receitas, despesas, receitas - despesas, recPend, desPend, list.Count));
    }

    public async Task<Result<LancamentoFinanceiroDto>> CreateLancamentoAsync(Guid clinicaId, CreateLancamentoRequest req, CancellationToken ct = default)
    {
        if (!Enum.TryParse<TipoLancamento>(req.Tipo, true, out var tipo))
            return Result.Fail("Tipo inválido. Use Receita ou Despesa.");
        if (req.PacienteId.HasValue)
        {
            var pac = await _pacientes.GetByIdAndClinicaAsync(clinicaId, req.PacienteId.Value, ct);
            if (pac is null) return Result.Fail("Paciente não encontrado nesta clínica.");
        }
        var status = StatusLancamento.Pendente;
        if (!string.IsNullOrWhiteSpace(req.Status) && Enum.TryParse<StatusLancamento>(req.Status, true, out var st))
            status = st;

        var entity = new LancamentoFinanceiro
        {
            ClinicaId = clinicaId,
            PacienteId = req.PacienteId,
            AgendamentoId = req.AgendamentoId,
            Tipo = tipo,
            Categoria = req.Categoria,
            Descricao = req.Descricao,
            Valor = req.Valor,
            Data = req.Data ?? DateTime.UtcNow,
            DataVencimento = req.DataVencimento,
            DataPagamento = status == StatusLancamento.Pago ? DateTime.UtcNow : null,
            Status = status,
            FormaPagamento = req.FormaPagamento
        };
        await _repo.AddLancamentoAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToLancDto(entity));
    }

    public async Task<Result> DeleteLancamentoAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetLancamentoAsync(clinicaId, id, ct);
        if (e is null) return Result.Fail("Lançamento não encontrado.");
        await _repo.DeleteLancamentoAsync(e, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    // ── Vendas ────────────────────────────────────────────────
    public async Task<Result<List<VendaDto>>> ListVendasAsync(Guid clinicaId, CancellationToken ct = default)
    {
        var list = await _repo.GetVendasAsync(clinicaId, ct);
        return Result.Ok(list.Select(ToVendaDto).ToList());
    }

    public async Task<Result<VendaDto>> CreateVendaAsync(Guid clinicaId, CreateVendaRequest req, CancellationToken ct = default)
    {
        if (req.Itens is null || req.Itens.Count == 0)
            return Result.Fail("Informe ao menos um item na venda.");
        if (req.PacienteId.HasValue)
        {
            var pac = await _pacientes.GetByIdAndClinicaAsync(clinicaId, req.PacienteId.Value, ct);
            if (pac is null) return Result.Fail("Paciente não encontrado nesta clínica.");
        }

        var itens = req.Itens.Select(i => new VendaItem
        {
            ProdutoId = i.ProdutoId,
            ServicoId = i.ServicoId,
            Descricao = i.Descricao,
            Quantidade = i.Quantidade <= 0 ? 1 : i.Quantidade,
            ValorUnitario = i.ValorUnitario
        }).ToList();

        var subtotal = itens.Sum(i => i.Quantidade * i.ValorUnitario);
        var entity = new Venda
        {
            ClinicaId = clinicaId,
            PacienteId = req.PacienteId,
            Data = DateTime.UtcNow,
            Subtotal = subtotal,
            Desconto = req.Desconto,
            Total = Math.Max(0, subtotal - req.Desconto),
            FormaPagamento = req.FormaPagamento,
            Observacoes = req.Observacoes,
            Itens = itens
        };
        await _repo.AddVendaAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToVendaDto(entity));
    }

    public async Task<Result<VendaDto>> PagarVendaAsync(Guid clinicaId, Guid id, string? formaPagamento, CancellationToken ct = default)
    {
        var e = await _repo.GetVendaAsync(clinicaId, id, ct);
        if (e is null) return Result.Fail("Venda não encontrada.");
        if (e.Status == StatusVenda.Paga)
            return Result.Ok(ToVendaDto(e));

        e.Status = StatusVenda.Paga;
        if (!string.IsNullOrWhiteSpace(formaPagamento)) e.FormaPagamento = formaPagamento;
        await _repo.UpdateVendaAsync(e, ct);

        // Lançamento financeiro da venda
        await _repo.AddLancamentoAsync(new LancamentoFinanceiro
        {
            ClinicaId = clinicaId,
            PacienteId = e.PacienteId,
            Tipo = TipoLancamento.Receita,
            Categoria = "Venda",
            Descricao = $"Venda {e.Id.ToString()[..8]} — {e.Total:C}",
            Valor = e.Total,
            Data = DateTime.UtcNow,
            DataPagamento = DateTime.UtcNow,
            Status = StatusLancamento.Pago,
            FormaPagamento = e.FormaPagamento
        }, ct);

        // Baixa de estoque por item com produto
        if (e.Itens is not null)
        {
            foreach (var item in e.Itens.Where(i => i.ProdutoId.HasValue))
            {
                var produto = await _repo.GetProdutoAsync(clinicaId, item.ProdutoId!.Value, ct);
                if (produto is null) continue;
                if (produto.Quantidade < item.Quantidade)
                    return Result.Fail($"Estoque insuficiente para '{produto.Nome}'.");
                produto.Quantidade -= item.Quantidade;
                await _repo.UpdateProdutoAsync(produto, ct);
                await _repo.AddMovimentacaoAsync(new MovimentacaoEstoque
                {
                    ClinicaId = clinicaId,
                    ProdutoId = produto.Id,
                    Tipo = TipoMovimentacaoEstoque.Saida,
                    Quantidade = item.Quantidade,
                    Motivo = $"Venda {e.Id.ToString()[..8]}",
                    Data = DateTime.UtcNow
                }, ct);
            }
        }

        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToVendaDto(e));
    }

    public async Task<Result> DeleteVendaAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetVendaAsync(clinicaId, id, ct);
        if (e is null) return Result.Fail("Venda não encontrada.");
        await _repo.DeleteVendaAsync(e, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    // ── Estoque ───────────────────────────────────────────────
    public async Task<Result<List<ProdutoEstoqueDto>>> ListProdutosAsync(Guid clinicaId, CancellationToken ct = default)
    {
        var list = await _repo.GetProdutosAsync(clinicaId, ct);
        return Result.Ok(list.Select(ToProdutoDto).ToList());
    }

    public async Task<Result<ProdutoEstoqueDto>> CreateProdutoAsync(Guid clinicaId, CreateProdutoEstoqueRequest req, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(req.Nome))
            return Result.Fail("Nome do produto é obrigatório.");
        if (req.Quantidade < 0 || req.QuantidadeMinima < 0)
            return Result.Fail("Quantidades não podem ser negativas.");

        var entity = new ProdutoEstoque
        {
            ClinicaId = clinicaId,
            Nome = req.Nome.Trim(),
            Sku = req.Sku?.Trim(),
            Unidade = string.IsNullOrWhiteSpace(req.Unidade) ? "un" : req.Unidade,
            Quantidade = req.Quantidade,
            QuantidadeMinima = req.QuantidadeMinima,
            CustoUnitario = req.CustoUnitario,
            PrecoVenda = req.PrecoVenda,
            Categoria = req.Categoria
        };
        await _repo.AddProdutoAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToProdutoDto(entity));
    }

    public async Task<Result<ProdutoEstoqueDto>> UpdateProdutoAsync(Guid clinicaId, Guid id, UpdateProdutoEstoqueRequest req, CancellationToken ct = default)
    {
        var entity = await _repo.GetProdutoAsync(clinicaId, id, ct);
        if (entity is null) return Result.Fail("Produto não encontrado.");
        if (string.IsNullOrWhiteSpace(req.Nome))
            return Result.Fail("Nome do produto é obrigatório.");

        entity.Nome = req.Nome.Trim();
        entity.Sku = req.Sku?.Trim();
        entity.Unidade = string.IsNullOrWhiteSpace(req.Unidade) ? "un" : req.Unidade;
        entity.QuantidadeMinima = Math.Max(0, req.QuantidadeMinima);
        entity.CustoUnitario = req.CustoUnitario;
        entity.PrecoVenda = req.PrecoVenda;
        entity.Categoria = req.Categoria;
        await _repo.UpdateProdutoAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToProdutoDto(entity));
    }

    public async Task<Result> DeleteProdutoAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var entity = await _repo.GetProdutoAsync(clinicaId, id, ct);
        if (entity is null) return Result.Fail("Produto não encontrado.");
        entity.Ativo = false;
        await _repo.UpdateProdutoAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    public async Task<Result<MovimentacaoEstoqueDto>> MovimentarEstoqueAsync(Guid clinicaId, CreateMovimentacaoRequest req, CancellationToken ct = default)
    {
        var produto = await _repo.GetProdutoAsync(clinicaId, req.ProdutoId, ct);
        if (produto is null)
            return Result.Fail("Produto não encontrado.");
        if (!Enum.TryParse<TipoMovimentacaoEstoque>(req.Tipo, true, out var tipo))
            return Result.Fail("Tipo inválido.");

        if (tipo == TipoMovimentacaoEstoque.Entrada)
            produto.Quantidade += req.Quantidade;
        else if (tipo == TipoMovimentacaoEstoque.Saida)
        {
            if (produto.Quantidade < req.Quantidade)
                return Result.Fail("Estoque insuficiente.");
            produto.Quantidade -= req.Quantidade;
        }
        else
            produto.Quantidade = req.Quantidade; // ajuste

        var mov = new MovimentacaoEstoque
        {
            ClinicaId = clinicaId,
            ProdutoId = req.ProdutoId,
            Tipo = tipo,
            Quantidade = req.Quantidade,
            Motivo = req.Motivo,
            Data = DateTime.UtcNow
        };
        await _repo.AddMovimentacaoAsync(mov, ct);
        await _repo.UpdateProdutoAsync(produto, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(new MovimentacaoEstoqueDto(mov.Id, mov.ProdutoId, mov.Tipo.ToString(), mov.Quantidade, mov.Motivo, mov.Data));
    }

    public async Task<Result<List<MovimentacaoEstoqueDto>>> ListMovimentacoesAsync(Guid clinicaId, Guid? produtoId, CancellationToken ct = default)
    {
        var list = await _repo.GetMovimentacoesAsync(clinicaId, produtoId, ct);
        return Result.Ok(list.Select(m => new MovimentacaoEstoqueDto(m.Id, m.ProdutoId, m.Tipo.ToString(), m.Quantidade, m.Motivo, m.Data)).ToList());
    }

    // ── Notas ─────────────────────────────────────────────────
    public async Task<Result<List<NotaFiscalDto>>> ListNotasAsync(Guid clinicaId, CancellationToken ct = default)
    {
        var list = await _repo.GetNotasAsync(clinicaId, ct);
        return Result.Ok(list.Select(ToNotaDto).ToList());
    }

    public async Task<Result<NotaFiscalDto>> EmitirNotaAsync(Guid clinicaId, CreateNotaFiscalRequest req, CancellationToken ct = default)
    {
        var numero = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var entity = new NotaFiscal
        {
            ClinicaId = clinicaId,
            PacienteId = req.PacienteId,
            VendaId = req.VendaId,
            Numero = numero,
            Serie = "1",
            ChaveAcesso = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N")[..12],
            Valor = req.Valor,
            DataEmissao = DateTime.UtcNow,
            Status = StatusNotaFiscal.Emitida,
            DescricaoServico = req.DescricaoServico,
            Observacoes = req.Observacoes
        };
        await _repo.AddNotaAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToNotaDto(entity));
    }

    // ── Transcrição ───────────────────────────────────────────
    public async Task<Result<List<TranscricaoDto>>> ListTranscricoesAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default)
    {
        var list = await _repo.GetTranscricoesAsync(clinicaId, pacienteId, ct);
        return Result.Ok(list.Select(ToTransDto).ToList());
    }

    public async Task<Result<TranscricaoDto>> CreateTranscricaoAsync(Guid clinicaId, CreateTranscricaoRequest req, CancellationToken ct = default)
    {
        var pac = await _pacientes.GetByIdAndClinicaAsync(clinicaId, req.PacienteId, ct);
        if (pac is null) return Result.Fail("Paciente não encontrado nesta clínica.");

        var entity = new TranscricaoConsulta
        {
            ClinicaId = clinicaId,
            PacienteId = req.PacienteId,
            AgendamentoId = req.AgendamentoId,
            Texto = req.Texto,
            Resumo = req.Resumo ?? GerarResumoSimples(req.Texto),
            DuracaoSegundos = req.DuracaoSegundos,
            Status = StatusTranscricao.Concluida,
            Data = DateTime.UtcNow
        };
        await _repo.AddTranscricaoAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToTransDto(entity));
    }

    // ── Portal ────────────────────────────────────────────────
    public async Task<Result<List<PortalAcessoDto>>> ListPortalAsync(Guid clinicaId, CancellationToken ct = default)
    {
        var list = await _repo.GetPortalAcessosAsync(clinicaId, ct);
        // Lista não expõe o token completo (apenas status e link parcial mascarado)
        return Result.Ok(list.Select(p => ToPortalDto(p, includeToken: false)).ToList());
    }

    public async Task<Result<PortalAcessoDto>> CreatePortalAsync(Guid clinicaId, CreatePortalAcessoRequest req, CancellationToken ct = default)
    {
        var pac = await _pacientes.GetByIdAndClinicaAsync(clinicaId, req.PacienteId, ct);
        if (pac is null) return Result.Fail("Paciente não encontrado nesta clínica.");

        var tokenBytes = new byte[32];
        System.Security.Cryptography.RandomNumberGenerator.Fill(tokenBytes);
        var token = Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
        var validadeDias = req.ValidadeDias is > 0 and <= 365 ? req.ValidadeDias.Value : 30;

        var entity = new PortalAcesso
        {
            ClinicaId = clinicaId,
            PacienteId = req.PacienteId,
            Email = req.Email,
            TokenAcesso = token,
            Habilitado = true,
            ExpiraEm = DateTime.UtcNow.AddDays(validadeDias),
            Observacoes = req.Observacoes
        };
        await _repo.AddPortalAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        // Token completo só na criação
        return Result.Ok(ToPortalDto(entity, includeToken: true));
    }

    public async Task<Result<PortalPacienteViewDto>> GetPortalByTokenAsync(string token, CancellationToken ct = default)
    {
        var acesso = await _repo.GetPortalPorTokenAsync(token, ct);
        if (acesso is null || !acesso.EstaValido)
            return Result.Fail("Acesso inválido, desabilitado ou expirado.");

        var paciente = await _pacientes.GetByIdAndClinicaAsync(acesso.ClinicaId, acesso.PacienteId, ct);
        var clinica = await _clinicas.GetByIdAsync(acesso.ClinicaId, ct);
        if (paciente is null || clinica is null) return Result.Fail("Dados do portal indisponíveis.");

        acesso.UltimoAcesso = DateTime.UtcNow;
        await _repo.UpdatePortalAsync(acesso, ct);
        await _uow.SaveChangesAsync(ct);

        var start = DateTime.Today;
        var end = start.AddDays(60);
        var ags = await _agendamentos.GetByClinicaAsync(acesso.ClinicaId, start, end, ct);
        var doPaciente = ags.Where(a => a.PacienteId == paciente.Id && a.Status != AgendamentoStatus.Cancelado)
            .OrderBy(a => a.DataHoraInicio).Take(10).ToList();

        var servicos = await _servicos.GetAllAsync(acesso.ClinicaId, ct);
        var servDict = servicos.ToDictionary(s => s.Id, s => s.Nome);

        var resumos = doPaciente.Select(a => new AgendamentoResumoPortal(
            a.DataHoraInicio,
            servDict.GetValueOrDefault(a.ServicoId, "Consulta"),
            a.Status.ToString())).ToList();

        return Result.Ok(new PortalPacienteViewDto(
            paciente.Nome,
            clinica.Nome,
            resumos,
            new List<string> { "Termo de consentimento", "Orientações pós-procedimento", "Receituário digital" }));
    }

    // ── Avaliação facial ──────────────────────────────────────
    public async Task<Result<List<AvaliacaoFacialDto>>> ListAvaliacoesAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default)
    {
        var list = await _repo.GetAvaliacoesFaciaisAsync(clinicaId, pacienteId, ct);
        return Result.Ok(list.Select(ToAvalDto).ToList());
    }

    public async Task<Result<AvaliacaoFacialDto>> CreateAvaliacaoAsync(Guid clinicaId, CreateAvaliacaoFacialRequest req, CancellationToken ct = default)
    {
        var pacCheck = await _pacientes.GetByIdAndClinicaAsync(clinicaId, req.PacienteId, ct);
        if (pacCheck is null) return Result.Fail("Paciente não encontrado nesta clínica.");

        var rnd = Random.Shared;
        var simetria = Math.Round(70 + rnd.NextDouble() * 25, 1);
        var hidratacao = Math.Round(60 + rnd.NextDouble() * 30, 1);
        var volume = Math.Round(65 + rnd.NextDouble() * 25, 1);
        var rugas = Math.Round(50 + rnd.NextDouble() * 40, 1);
        var score = Math.Round((simetria + hidratacao + volume + (100 - rugas * 0.3)) / 3.5, 1);

        var resultado = JsonSerializer.Serialize(new
        {
            simetria,
            hidratacao,
            volume,
            rugas,
            areas = new[] { "testa", "olheiras", "malar", "mandíbula" },
            geradoPor = "IA ClinicaX (simulado)"
        });

        var entity = new AvaliacaoFacial
        {
            ClinicaId = clinicaId,
            PacienteId = req.PacienteId,
            Data = DateTime.UtcNow,
            ResultadoJson = resultado,
            Observacoes = req.Observacoes,
            Recomendacoes = "Protocolo sugerido: hidratação profunda + bioestimulador na região malar. Reavaliar em 30 dias.",
            ScoreGeral = (decimal)score
        };
        await _repo.AddAvaliacaoFacialAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToAvalDto(entity));
    }

    // ── Tarefas IA ────────────────────────────────────────────
    public async Task<Result<List<TarefaIaDto>>> ListTarefasAsync(Guid clinicaId, CancellationToken ct = default)
    {
        var list = await _repo.GetTarefasAsync(clinicaId, ct);
        return Result.Ok(list.Select(ToTarefaDto).ToList());
    }

    public async Task<Result<TarefaIaDto>> CreateTarefaAsync(Guid clinicaId, CreateTarefaIaRequest req, CancellationToken ct = default)
    {
        if (req.PacienteId.HasValue)
        {
            var pac = await _pacientes.GetByIdAndClinicaAsync(clinicaId, req.PacienteId.Value, ct);
            if (pac is null) return Result.Fail("Paciente não encontrado nesta clínica.");
        }

        var prio = PrioridadeTarefa.Media;
        if (!string.IsNullOrWhiteSpace(req.Prioridade) && Enum.TryParse<PrioridadeTarefa>(req.Prioridade, true, out var pr))
            prio = pr;

        var entity = new TarefaIa
        {
            ClinicaId = clinicaId,
            Titulo = req.Titulo,
            Descricao = req.Descricao,
            Prioridade = prio,
            Prazo = req.Prazo,
            PacienteId = req.PacienteId,
            GeradaPorIa = false
        };
        await _repo.AddTarefaAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToTarefaDto(entity));
    }

    public async Task<Result<TarefaIaDto>> UpdateTarefaAsync(Guid clinicaId, Guid id, UpdateTarefaIaRequest req, CancellationToken ct = default)
    {
        var e = await _repo.GetTarefaAsync(clinicaId, id, ct);
        if (e is null) return Result.Fail("Tarefa não encontrada.");
        e.Titulo = req.Titulo;
        e.Descricao = req.Descricao;
        e.Prazo = req.Prazo;
        if (Enum.TryParse<StatusTarefa>(req.Status, true, out var st)) e.Status = st;
        if (Enum.TryParse<PrioridadeTarefa>(req.Prioridade, true, out var pr)) e.Prioridade = pr;
        await _repo.UpdateTarefaAsync(e, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(ToTarefaDto(e));
    }

    public async Task<Result> DeleteTarefaAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
    {
        var e = await _repo.GetTarefaAsync(clinicaId, id, ct);
        if (e is null) return Result.Fail("Tarefa não encontrada.");
        await _repo.DeleteTarefaAsync(e, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok();
    }

    public async Task<Result<List<TarefaIaDto>>> SugerirTarefasIaAsync(Guid clinicaId, CancellationToken ct = default)
    {
        var existentes = await _repo.GetTarefasAsync(clinicaId, ct);
        var titulosExistentes = existentes
            .Where(t => t.GeradaPorIa && t.Status != StatusTarefa.Concluida)
            .Select(t => t.Titulo)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var sugestoes = new[]
        {
            new TarefaIa { ClinicaId = clinicaId, Titulo = "Confirmar consultas de amanhã via WhatsApp", Descricao = "Enviar lembrete automático para todos os agendamentos do dia seguinte.", Prioridade = PrioridadeTarefa.Alta, GeradaPorIa = true, Prazo = DateTime.UtcNow.Date.AddDays(1) },
            new TarefaIa { ClinicaId = clinicaId, Titulo = "Revisar estoque de toxina botulínica", Descricao = "Produto abaixo do mínimo sugerido pela IA.", Prioridade = PrioridadeTarefa.Media, GeradaPorIa = true, Prazo = DateTime.UtcNow.Date.AddDays(3) },
            new TarefaIa { ClinicaId = clinicaId, Titulo = "Emitir notas fiscais pendentes da semana", Descricao = "Há vendas pagas sem NFS-e vinculada.", Prioridade = PrioridadeTarefa.Alta, GeradaPorIa = true, Prazo = DateTime.UtcNow.Date.AddDays(2) },
            new TarefaIa { ClinicaId = clinicaId, Titulo = "Atualizar anamneses desatualizadas (>6 meses)", Descricao = "Pacientes com retorno sem ficha recente.", Prioridade = PrioridadeTarefa.Baixa, GeradaPorIa = true, Prazo = DateTime.UtcNow.Date.AddDays(7) },
        };

        var criadas = new List<TarefaIa>();
        foreach (var t in sugestoes)
        {
            if (titulosExistentes.Contains(t.Titulo)) continue;
            await _repo.AddTarefaAsync(t, ct);
            criadas.Add(t);
        }
        if (criadas.Count > 0)
            await _uow.SaveChangesAsync(ct);
        return Result.Ok(criadas.Select(ToTarefaDto).ToList());
    }

    // ── Agente textos ─────────────────────────────────────────
    public async Task<Result<List<TextoIaDto>>> ListTextosAsync(Guid clinicaId, CancellationToken ct = default)
    {
        var list = await _repo.GetTextosIaAsync(clinicaId, ct);
        return Result.Ok(list.Select(t => new TextoIaDto(t.Id, t.Tipo, t.Prompt, t.Resultado, t.CriadoEm)).ToList());
    }

    public async Task<Result<TextoIaDto>> GerarTextoAsync(Guid clinicaId, GerarTextoIaRequest req, CancellationToken ct = default)
    {
        var tipo = string.IsNullOrWhiteSpace(req.Tipo) ? "geral" : req.Tipo.ToLowerInvariant();
        var resultado = GerarTextoTemplate(tipo, req.Prompt);

        var entity = new TextoIa
        {
            ClinicaId = clinicaId,
            Tipo = tipo,
            Prompt = req.Prompt,
            Resultado = resultado
        };
        await _repo.AddTextoIaAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Ok(new TextoIaDto(entity.Id, entity.Tipo, entity.Prompt, entity.Resultado, entity.CriadoEm));
    }

    private static string GerarTextoTemplate(string tipo, string prompt) => tipo switch
    {
        "email" => $"""
            Assunto: {prompt}

            Prezado(a) paciente,

            Esperamos que esteja bem.

            Escrevemos para informá-lo(a) sobre: {prompt}.

            Caso tenha alguma dúvida ou precise de esclarecimentos adicionais, não hesite em entrar em contato conosco pelo telefone (XX) XXXX-XXXX ou responder este e-mail.

            Ficamos à disposição para ajudá-lo(a) no que for necessário.

            Atenciosamente,
            Equipe Clínica
            """,

        "whatsapp" => $"Olá! Aqui é da clínica.\n\n{prompt}\n\nPosso ajudar com mais alguma informação? Responda esta mensagem quando puder.",

        "contrato" => $"""
            TERMO DE CONSENTIMENTO INFORMADO

            {prompt}

            Declaro que fui devidamente informado(a) sobre o procedimento, seus riscos, benefícios e alternativas. Autorizo a realização conforme orientação da equipe clínica.

            Local e data: ____/____/________
            Assinatura: _________________________
            """,

        "post" => $"""
             {prompt}

            Agende sua avaliação e descubra o protocolo ideal para você!

            #estetica #saude #clinicax
            """,

        "prontuario" => $"""
            EVOLUÇÃO CLÍNICA

            Queixa principal: {prompt}

            Exame: Paciente em bom estado geral. Conduta alinhada ao plano terapêutico. Orientações reforçadas. Retorno conforme protocolo.
            """,

        _ => $"""
            Com base no seu pedido, segue um texto profissional para uso na clínica:

            {prompt}

            — Gerado pelo Agente de IA ClinicaX
            """
    };

    public async Task<Result> EnviarTextoAsync(Guid clinicaId, EnviarTextoIaRequest req, CancellationToken ct = default)
    {
        var tipo = string.IsNullOrWhiteSpace(req.Tipo) ? "geral" : req.Tipo.ToLowerInvariant();

        if (tipo == "whatsapp")
        {
            if (string.IsNullOrWhiteSpace(req.PacienteTelefone))
                return Result.Fail("Telefone do paciente é obrigatório para envio via WhatsApp.");

            // Só envia se o telefone pertencer a um paciente da clínica (anti-relay)
            var pacientes = await _pacientes.GetAllAsync(clinicaId, pageSize: 200, ativo: true, ct: ct);
            var phoneDigits = new string(req.PacienteTelefone.Where(char.IsDigit).ToArray());
            var autorizado = pacientes.Any(p =>
            {
                var d = new string((p.Telefone ?? "").Where(char.IsDigit).ToArray());
                return d.Length >= 8 && (d.EndsWith(phoneDigits) || phoneDigits.EndsWith(d) || d == phoneDigits);
            });
            if (!autorizado)
                return Result.Fail("Telefone não corresponde a nenhum paciente ativo desta clínica.");

            var enviado = await _textSender.SendWhatsAppAsync(req.PacienteTelefone, req.Resultado, ct);
            if (!enviado)
                return Result.Fail("Falha ao enviar mensagem via WhatsApp.");

            return Result.Ok();
        }

        if (tipo == "email")
        {
            _logger.LogInformation("[Email] Clínica {ClinicaId} — texto pronto: {Length} caracteres", clinicaId, req.Resultado?.Length ?? 0);
            return Result.Ok();
        }

        return Result.Fail($"Envio automático não disponível para o tipo '{tipo}'.");
    }

    private static string GerarResumoSimples(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto)) return "Sem conteúdo.";
        var clean = texto.Replace("\n", " ").Trim();
        return clean.Length <= 180 ? clean : clean[..177] + "...";
    }

    // ── Mappers ───────────────────────────────────────────────
    private static AnamneseDto ToAnamneseDto(Anamnese x, Dictionary<Guid, string>? pacDict = null)
    {
        string? nome = null;
        pacDict?.TryGetValue(x.PacienteId, out nome);
        return new(x.Id, x.PacienteId, nome, x.Titulo, x.Especialidade, x.Data, x.QueixaPrincipal, x.HistoricoMedico, x.Alergias, x.MedicamentosUso, x.Habitos, x.Observacoes, x.CamposExtrasJson);
    }
    private static ContratoDto ToContratoDto(Contrato x) => new(x.Id, x.PacienteId, x.Titulo, x.Conteudo, x.Status.ToString(), x.EnviadoEm, x.AssinadoEm, x.AssinaturaNome, x.CriadoEm);
    private static WhatsAppMensagemDto ToMsgDto(WhatsAppMensagem m) => new(m.Id, m.ConversaId, m.Direcao.ToString(), m.Conteudo, m.Status.ToString(), m.EnviadaEm, m.Automatica);
    private static PlanoInjetavelDto ToPlanoDto(PlanoInjetavel x, Dictionary<Guid, string>? pacDict = null)
    {
        string? nome = null;
        pacDict?.TryGetValue(x.PacienteId, out nome);
        return new(x.Id, x.PacienteId, nome, x.Substancia, x.Protocolo, x.AreaAplicacao, x.DataInicio, x.TotalSessoes, x.SessoesRealizadas, x.IntervaloDias, x.ProximaSessao, x.Status.ToString(), x.Observacoes);
    }
    private static TeleconsultaDto ToTeleDto(Teleconsulta x, Dictionary<Guid, string>? pacDict = null)
    {
        string? nome = null;
        pacDict?.TryGetValue(x.PacienteId, out nome);
        return new(x.Id, x.PacienteId, nome, x.AgendamentoId, x.LinkSala, x.DataHoraInicio, x.DataHoraFim, x.Status.ToString(), x.Observacoes);
    }
    private static LancamentoFinanceiroDto ToLancDto(LancamentoFinanceiro x) => new(x.Id, x.PacienteId, x.AgendamentoId, x.Tipo.ToString(), x.Categoria, x.Descricao, x.Valor, x.Data, x.DataVencimento, x.DataPagamento, x.Status.ToString(), x.FormaPagamento);
    private static VendaDto ToVendaDto(Venda v) => new(v.Id, v.PacienteId, v.Data, v.Subtotal, v.Desconto, v.Total, v.Status.ToString(), v.FormaPagamento, v.Observacoes,
        v.Itens?.Select(i => new VendaItemDto(i.Id, i.ProdutoId, i.ServicoId, i.Descricao, i.Quantidade, i.ValorUnitario, i.Quantidade * i.ValorUnitario)).ToList() ?? new());
    private static ProdutoEstoqueDto ToProdutoDto(ProdutoEstoque p) => new(p.Id, p.Nome, p.Sku, p.Unidade, p.Quantidade, p.QuantidadeMinima, p.CustoUnitario, p.PrecoVenda, p.Categoria, p.Quantidade <= p.QuantidadeMinima);
    private static NotaFiscalDto ToNotaDto(NotaFiscal n) => new(n.Id, n.PacienteId, n.VendaId, n.Numero, n.Serie, n.ChaveAcesso, n.Valor, n.DataEmissao, n.Status.ToString(), n.DescricaoServico, n.Observacoes);
    private static TranscricaoDto ToTransDto(TranscricaoConsulta t) => new(t.Id, t.PacienteId, t.AgendamentoId, t.Data, t.Texto, t.Resumo, t.Status.ToString(), t.DuracaoSegundos);
    private static PortalAcessoDto ToPortalDto(PortalAcesso p, bool includeToken)
    {
        var token = includeToken ? p.TokenAcesso : null;
        var link = includeToken ? $"/portal/{p.TokenAcesso}" : null;
        return new(p.Id, p.PacienteId, p.Email, token, p.Habilitado, p.UltimoAcesso, p.ExpiraEm, p.Observacoes, link);
    }
    private static AvaliacaoFacialDto ToAvalDto(AvaliacaoFacial a) => new(a.Id, a.PacienteId, a.Data, a.ResultadoJson, a.Observacoes, a.Recomendacoes, a.ScoreGeral);
    private static TarefaIaDto ToTarefaDto(TarefaIa t) => new(t.Id, t.Titulo, t.Descricao, t.Status.ToString(), t.Prioridade.ToString(), t.Prazo, t.GeradaPorIa, t.PacienteId, t.CriadoEm);
}
