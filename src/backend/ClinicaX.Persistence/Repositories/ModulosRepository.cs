using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using ClinicaX.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicaX.Persistence.Repositories;

public class ModulosRepository : IModulosRepository
{
    private readonly ClinicaXDbContext _db;

    public ModulosRepository(ClinicaXDbContext db) => _db = db;

    // Anamnese
    public Task<List<Anamnese>> GetAnamnesesAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default)
    {
        var q = _db.Anamneses.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo);
        if (pacienteId.HasValue) q = q.Where(x => x.PacienteId == pacienteId);
        return q.OrderByDescending(x => x.Data).ToListAsync(ct);
    }

    public Task<Anamnese?> GetAnamneseAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => _db.Anamneses.FirstOrDefaultAsync(x => x.Id == id && x.ClinicaId == clinicaId && x.Ativo, ct);

    public async Task AddAnamneseAsync(Anamnese entity, CancellationToken ct = default)
        => await _db.Anamneses.AddAsync(entity, ct);

    public Task DeleteAnamneseAsync(Anamnese entity, CancellationToken ct = default)
    {
        entity.Ativo = false;
        return Task.CompletedTask;
    }

    // Contrato
    public Task<List<Contrato>> GetContratosAsync(Guid clinicaId, CancellationToken ct = default)
        => _db.Contratos.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo)
            .OrderByDescending(x => x.CriadoEm).ToListAsync(ct);

    public Task<Contrato?> GetContratoAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => _db.Contratos.FirstOrDefaultAsync(x => x.Id == id && x.ClinicaId == clinicaId && x.Ativo, ct);

    public async Task AddContratoAsync(Contrato entity, CancellationToken ct = default)
        => await _db.Contratos.AddAsync(entity, ct);

    public Task UpdateContratoAsync(Contrato entity, CancellationToken ct = default)
    {
        _db.Contratos.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteContratoAsync(Contrato entity, CancellationToken ct = default)
    {
        entity.Ativo = false;
        return Task.CompletedTask;
    }

    // WhatsApp
    public Task<List<WhatsAppConversa>> GetConversasAsync(Guid clinicaId, CancellationToken ct = default)
        => _db.WhatsAppConversas.AsNoTracking()
            .Where(x => x.ClinicaId == clinicaId && x.Ativo)
            .OrderByDescending(x => x.UltimaMensagemEm)
            .ToListAsync(ct);

    public Task<WhatsAppConversa?> GetConversaAsync(Guid clinicaId, Guid id, bool includeMensagens, CancellationToken ct = default)
    {
        IQueryable<WhatsAppConversa> q = _db.WhatsAppConversas;
        if (includeMensagens)
            q = q.Include(c => c.Mensagens.Where(m => m.Ativo).OrderBy(m => m.EnviadaEm));
        return q.FirstOrDefaultAsync(x => x.Id == id && x.ClinicaId == clinicaId && x.Ativo, ct);
    }

    public async Task AddConversaAsync(WhatsAppConversa entity, CancellationToken ct = default)
        => await _db.WhatsAppConversas.AddAsync(entity, ct);

    public async Task AddMensagemAsync(WhatsAppMensagem entity, CancellationToken ct = default)
        => await _db.WhatsAppMensagens.AddAsync(entity, ct);

    public Task UpdateConversaAsync(WhatsAppConversa entity, CancellationToken ct = default)
    {
        _db.WhatsAppConversas.Update(entity);
        return Task.CompletedTask;
    }

    // Injetáveis
    public Task<List<PlanoInjetavel>> GetPlanosInjetaveisAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default)
    {
        var q = _db.PlanosInjetaveis.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo);
        if (pacienteId.HasValue) q = q.Where(x => x.PacienteId == pacienteId);
        return q.OrderByDescending(x => x.DataInicio).ToListAsync(ct);
    }

    public Task<PlanoInjetavel?> GetPlanoInjetavelAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => _db.PlanosInjetaveis.FirstOrDefaultAsync(x => x.Id == id && x.ClinicaId == clinicaId && x.Ativo, ct);

    public async Task AddPlanoInjetavelAsync(PlanoInjetavel entity, CancellationToken ct = default)
        => await _db.PlanosInjetaveis.AddAsync(entity, ct);

    public Task UpdatePlanoInjetavelAsync(PlanoInjetavel entity, CancellationToken ct = default)
    {
        _db.PlanosInjetaveis.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeletePlanoInjetavelAsync(PlanoInjetavel entity, CancellationToken ct = default)
    {
        entity.Ativo = false;
        return Task.CompletedTask;
    }

    // Telemedicina
    public Task<List<Teleconsulta>> GetTeleconsultasAsync(Guid clinicaId, CancellationToken ct = default)
        => _db.Teleconsultas.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo)
            .OrderByDescending(x => x.DataHoraInicio).ToListAsync(ct);

    public Task<Teleconsulta?> GetTeleconsultaAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => _db.Teleconsultas.FirstOrDefaultAsync(x => x.Id == id && x.ClinicaId == clinicaId && x.Ativo, ct);

    public async Task AddTeleconsultaAsync(Teleconsulta entity, CancellationToken ct = default)
        => await _db.Teleconsultas.AddAsync(entity, ct);

    public Task UpdateTeleconsultaAsync(Teleconsulta entity, CancellationToken ct = default)
    {
        _db.Teleconsultas.Update(entity);
        return Task.CompletedTask;
    }

    // Financeiro
    public Task<List<LancamentoFinanceiro>> GetLancamentosAsync(Guid clinicaId, DateTime? inicio, DateTime? fim, CancellationToken ct = default)
    {
        var q = _db.LancamentosFinanceiros.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo);
        if (inicio.HasValue) q = q.Where(x => x.Data >= inicio.Value);
        if (fim.HasValue) q = q.Where(x => x.Data <= fim.Value);
        return q.OrderByDescending(x => x.Data).ToListAsync(ct);
    }

    public Task<LancamentoFinanceiro?> GetLancamentoAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => _db.LancamentosFinanceiros.FirstOrDefaultAsync(x => x.Id == id && x.ClinicaId == clinicaId && x.Ativo, ct);

    public async Task AddLancamentoAsync(LancamentoFinanceiro entity, CancellationToken ct = default)
        => await _db.LancamentosFinanceiros.AddAsync(entity, ct);

    public Task UpdateLancamentoAsync(LancamentoFinanceiro entity, CancellationToken ct = default)
    {
        _db.LancamentosFinanceiros.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteLancamentoAsync(LancamentoFinanceiro entity, CancellationToken ct = default)
    {
        entity.Ativo = false;
        return Task.CompletedTask;
    }

    // Vendas
    public Task<List<Venda>> GetVendasAsync(Guid clinicaId, CancellationToken ct = default)
        => _db.Vendas.AsNoTracking()
            .Include(v => v.Itens)
            .Where(x => x.ClinicaId == clinicaId && x.Ativo)
            .OrderByDescending(x => x.Data)
            .AsSplitQuery()
            .ToListAsync(ct);

    public Task<Venda?> GetVendaAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => _db.Vendas.Include(v => v.Itens).FirstOrDefaultAsync(x => x.Id == id && x.ClinicaId == clinicaId && x.Ativo, ct);

    public async Task AddVendaAsync(Venda entity, CancellationToken ct = default)
        => await _db.Vendas.AddAsync(entity, ct);

    public Task UpdateVendaAsync(Venda entity, CancellationToken ct = default)
    {
        _db.Vendas.Update(entity);
        return Task.CompletedTask;
    }
    public Task DeleteVendaAsync(Venda entity, CancellationToken ct = default)
    {
        entity.Ativo = false;
        return Task.CompletedTask;
    }

    // Estoque
    public Task<List<ProdutoEstoque>> GetProdutosAsync(Guid clinicaId, CancellationToken ct = default)
        => _db.ProdutosEstoque.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo)
            .OrderBy(x => x.Nome).ToListAsync(ct);

    public Task<ProdutoEstoque?> GetProdutoAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => _db.ProdutosEstoque.FirstOrDefaultAsync(x => x.Id == id && x.ClinicaId == clinicaId && x.Ativo, ct);

    public async Task AddProdutoAsync(ProdutoEstoque entity, CancellationToken ct = default)
        => await _db.ProdutosEstoque.AddAsync(entity, ct);

    public Task UpdateProdutoAsync(ProdutoEstoque entity, CancellationToken ct = default)
    {
        _db.ProdutosEstoque.Update(entity);
        return Task.CompletedTask;
    }

    public async Task AddMovimentacaoAsync(MovimentacaoEstoque entity, CancellationToken ct = default)
        => await _db.MovimentacoesEstoque.AddAsync(entity, ct);

    public Task<List<MovimentacaoEstoque>> GetMovimentacoesAsync(Guid clinicaId, Guid? produtoId, CancellationToken ct = default)
    {
        var q = _db.MovimentacoesEstoque.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo);
        if (produtoId.HasValue) q = q.Where(x => x.ProdutoId == produtoId);
        return q.OrderByDescending(x => x.Data).ToListAsync(ct);
    }

    // Notas
    public Task<List<NotaFiscal>> GetNotasAsync(Guid clinicaId, CancellationToken ct = default)
        => _db.NotasFiscais.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo)
            .OrderByDescending(x => x.DataEmissao).ToListAsync(ct);

    public Task<NotaFiscal?> GetNotaAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => _db.NotasFiscais.FirstOrDefaultAsync(x => x.Id == id && x.ClinicaId == clinicaId && x.Ativo, ct);

    public async Task AddNotaAsync(NotaFiscal entity, CancellationToken ct = default)
        => await _db.NotasFiscais.AddAsync(entity, ct);

    public Task UpdateNotaAsync(NotaFiscal entity, CancellationToken ct = default)
    {
        _db.NotasFiscais.Update(entity);
        return Task.CompletedTask;
    }

    // Transcrição
    public Task<List<TranscricaoConsulta>> GetTranscricoesAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default)
    {
        var q = _db.TranscricoesConsulta.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo);
        if (pacienteId.HasValue) q = q.Where(x => x.PacienteId == pacienteId);
        return q.OrderByDescending(x => x.Data).ToListAsync(ct);
    }

    public async Task AddTranscricaoAsync(TranscricaoConsulta entity, CancellationToken ct = default)
        => await _db.TranscricoesConsulta.AddAsync(entity, ct);

    // Portal
    public Task<List<PortalAcesso>> GetPortalAcessosAsync(Guid clinicaId, CancellationToken ct = default)
        => _db.PortalAcessos.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo)
            .OrderByDescending(x => x.CriadoEm).ToListAsync(ct);

    public Task<PortalAcesso?> GetPortalPorTokenAsync(string token, CancellationToken ct = default)
        => _db.PortalAcessos.FirstOrDefaultAsync(x => x.TokenAcesso == token && x.Ativo && x.Habilitado, ct);

    public Task<PortalAcesso?> GetPortalAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => _db.PortalAcessos.FirstOrDefaultAsync(x => x.Id == id && x.ClinicaId == clinicaId && x.Ativo, ct);

    public async Task AddPortalAsync(PortalAcesso entity, CancellationToken ct = default)
        => await _db.PortalAcessos.AddAsync(entity, ct);

    public Task UpdatePortalAsync(PortalAcesso entity, CancellationToken ct = default)
    {
        _db.PortalAcessos.Update(entity);
        return Task.CompletedTask;
    }

    // Avaliação facial
    public Task<List<AvaliacaoFacial>> GetAvaliacoesFaciaisAsync(Guid clinicaId, Guid? pacienteId, CancellationToken ct = default)
    {
        var q = _db.AvaliacoesFaciais.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo);
        if (pacienteId.HasValue) q = q.Where(x => x.PacienteId == pacienteId);
        return q.OrderByDescending(x => x.Data).ToListAsync(ct);
    }

    public async Task AddAvaliacaoFacialAsync(AvaliacaoFacial entity, CancellationToken ct = default)
        => await _db.AvaliacoesFaciais.AddAsync(entity, ct);

    // Tarefas
    public Task<List<TarefaIa>> GetTarefasAsync(Guid clinicaId, CancellationToken ct = default)
        => _db.TarefasIa.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo)
            .OrderByDescending(x => x.CriadoEm).ToListAsync(ct);

    public Task<TarefaIa?> GetTarefaAsync(Guid clinicaId, Guid id, CancellationToken ct = default)
        => _db.TarefasIa.FirstOrDefaultAsync(x => x.Id == id && x.ClinicaId == clinicaId && x.Ativo, ct);

    public async Task AddTarefaAsync(TarefaIa entity, CancellationToken ct = default)
        => await _db.TarefasIa.AddAsync(entity, ct);

    public Task UpdateTarefaAsync(TarefaIa entity, CancellationToken ct = default)
    {
        _db.TarefasIa.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteTarefaAsync(TarefaIa entity, CancellationToken ct = default)
    {
        entity.Ativo = false;
        return Task.CompletedTask;
    }

    // Textos IA
    public Task<List<TextoIa>> GetTextosIaAsync(Guid clinicaId, CancellationToken ct = default)
        => _db.TextosIa.AsNoTracking().Where(x => x.ClinicaId == clinicaId && x.Ativo)
            .OrderByDescending(x => x.CriadoEm).Take(50).ToListAsync(ct);

    public async Task AddTextoIaAsync(TextoIa entity, CancellationToken ct = default)
        => await _db.TextosIa.AddAsync(entity, ct);

    public async Task ClearModulosByClinicaAsync(Guid clinicaId, CancellationToken ct = default)
    {
        _db.WhatsAppMensagens.RemoveRange(
            _db.WhatsAppMensagens.Where(m => _db.WhatsAppConversas.Any(c => c.Id == m.ConversaId && c.ClinicaId == clinicaId)));
        _db.WhatsAppConversas.RemoveRange(_db.WhatsAppConversas.Where(x => x.ClinicaId == clinicaId));
        _db.VendaItens.RemoveRange(
            _db.VendaItens.Where(i => _db.Vendas.Any(v => v.Id == i.VendaId && v.ClinicaId == clinicaId)));
        _db.Vendas.RemoveRange(_db.Vendas.Where(x => x.ClinicaId == clinicaId));
        _db.MovimentacoesEstoque.RemoveRange(_db.MovimentacoesEstoque.Where(x => x.ClinicaId == clinicaId));
        _db.ProdutosEstoque.RemoveRange(_db.ProdutosEstoque.Where(x => x.ClinicaId == clinicaId));
        _db.Anamneses.RemoveRange(_db.Anamneses.Where(x => x.ClinicaId == clinicaId));
        _db.Contratos.RemoveRange(_db.Contratos.Where(x => x.ClinicaId == clinicaId));
        _db.PlanosInjetaveis.RemoveRange(_db.PlanosInjetaveis.Where(x => x.ClinicaId == clinicaId));
        _db.Teleconsultas.RemoveRange(_db.Teleconsultas.Where(x => x.ClinicaId == clinicaId));
        _db.LancamentosFinanceiros.RemoveRange(_db.LancamentosFinanceiros.Where(x => x.ClinicaId == clinicaId));
        _db.NotasFiscais.RemoveRange(_db.NotasFiscais.Where(x => x.ClinicaId == clinicaId));
        _db.TranscricoesConsulta.RemoveRange(_db.TranscricoesConsulta.Where(x => x.ClinicaId == clinicaId));
        _db.PortalAcessos.RemoveRange(_db.PortalAcessos.Where(x => x.ClinicaId == clinicaId));
        _db.AvaliacoesFaciais.RemoveRange(_db.AvaliacoesFaciais.Where(x => x.ClinicaId == clinicaId));
        _db.TarefasIa.RemoveRange(_db.TarefasIa.Where(x => x.ClinicaId == clinicaId));
        _db.TextosIa.RemoveRange(_db.TextosIa.Where(x => x.ClinicaId == clinicaId));
        await Task.CompletedTask;
    }
}
