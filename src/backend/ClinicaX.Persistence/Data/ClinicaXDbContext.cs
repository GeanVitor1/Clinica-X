using ClinicaX.Application.Interfaces;
using ClinicaX.Domain.Entities;
using ClinicaX.Identity.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ClinicaX.Persistence.Data;

public class ClinicaXDbContext : IdentityDbContext<ClinicaOwner>, IUnitOfWork
{
    public ClinicaXDbContext(DbContextOptions<ClinicaXDbContext> options) : base(options) { }

    public DbSet<Clinica> Clinicas => Set<Clinica>();
    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<Servico> Servicos => Set<Servico>();
    public DbSet<Agendamento> Agendamentos => Set<Agendamento>();
    public DbSet<Prontuario> Prontuarios => Set<Prontuario>();
    public DbSet<Anexo> Anexos => Set<Anexo>();
    public DbSet<Notificacao> Notificacoes => Set<Notificacao>();
    public DbSet<Evento> Eventos => Set<Evento>();
    public DbSet<BloqueioAgenda> BloqueiosAgenda => Set<BloqueioAgenda>();

    // Novos módulos
    public DbSet<Anamnese> Anamneses => Set<Anamnese>();
    public DbSet<Contrato> Contratos => Set<Contrato>();
    public DbSet<WhatsAppConversa> WhatsAppConversas => Set<WhatsAppConversa>();
    public DbSet<WhatsAppMensagem> WhatsAppMensagens => Set<WhatsAppMensagem>();
    public DbSet<PlanoInjetavel> PlanosInjetaveis => Set<PlanoInjetavel>();
    public DbSet<Teleconsulta> Teleconsultas => Set<Teleconsulta>();
    public DbSet<LancamentoFinanceiro> LancamentosFinanceiros => Set<LancamentoFinanceiro>();
    public DbSet<Venda> Vendas => Set<Venda>();
    public DbSet<VendaItem> VendaItens => Set<VendaItem>();
    public DbSet<ProdutoEstoque> ProdutosEstoque => Set<ProdutoEstoque>();
    public DbSet<MovimentacaoEstoque> MovimentacoesEstoque => Set<MovimentacaoEstoque>();
    public DbSet<NotaFiscal> NotasFiscais => Set<NotaFiscal>();
    public DbSet<TranscricaoConsulta> TranscricoesConsulta => Set<TranscricaoConsulta>();
    public DbSet<PortalAcesso> PortalAcessos => Set<PortalAcesso>();
    public DbSet<AvaliacaoFacial> AvaliacoesFaciais => Set<AvaliacaoFacial>();
    public DbSet<TarefaIa> TarefasIa => Set<TarefaIa>();
    public DbSet<TextoIa> TextosIa => Set<TextoIa>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Clinica>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Nome).HasMaxLength(200).IsRequired();
            entity.Property(c => c.Email).HasMaxLength(200).IsRequired();
            entity.HasIndex(c => c.Email).IsUnique();
            entity.Property(c => c.Telefone).HasMaxLength(20).IsRequired();
            entity.Property(c => c.Endereco).HasMaxLength(500).IsRequired();
            entity.Property(c => c.Plano).HasMaxLength(20).IsRequired();
            entity.Property(c => c.HorarioAbertura).IsRequired();
            entity.Property(c => c.HorarioFechamento).IsRequired();
            entity.Property(c => c.DiasFuncionamento).HasMaxLength(20).IsRequired();
            entity.Property(c => c.IsDemo).IsRequired().HasDefaultValue(false);
            entity.Property(c => c.Ativo).IsRequired();
            entity.Property(c => c.CriadoEm).IsRequired();
        });

        modelBuilder.Entity<Paciente>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Nome).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Cpf).HasMaxLength(11).IsRequired();
            entity.HasIndex(p => new { p.ClinicaId, p.Cpf }).IsUnique();
            entity.Property(p => p.Telefone).HasMaxLength(20).IsRequired();
            entity.Property(p => p.Email).HasMaxLength(200);
            entity.Property(p => p.Observacoes).HasMaxLength(1000);
            entity.Property(p => p.Convenio).HasMaxLength(120);
            entity.Property(p => p.NumeroCarteirinha).HasMaxLength(60);
            entity.Property(p => p.Endereco).HasMaxLength(500);
            entity.Property(p => p.ContatoEmergencia).HasMaxLength(200);
            entity.Property(p => p.TelefoneEmergencia).HasMaxLength(20);
            entity.Property(p => p.Ativo).IsRequired();
            entity.Property(p => p.CriadoEm).IsRequired();
        });

        modelBuilder.Entity<Servico>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Nome).HasMaxLength(200).IsRequired();
            entity.Property(s => s.Descricao).HasMaxLength(500);
            entity.Property(s => s.Valor).HasColumnType("decimal(10,2)");
            entity.Property(s => s.PercentualComissao).HasColumnType("decimal(5,2)");
            entity.Property(s => s.Cor).HasMaxLength(7);
            entity.Property(s => s.Ativo).IsRequired();
            entity.Property(s => s.CriadoEm).IsRequired();
        });

        modelBuilder.Entity<Agendamento>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Observacao).HasMaxLength(1000);
            entity.Property(a => a.MotivoCancelamento).HasMaxLength(500);
            entity.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(a => a.Profissional).HasMaxLength(200);
            entity.Property(a => a.Sala).HasMaxLength(100);
            entity.Property(a => a.Equipamento).HasMaxLength(100);
            entity.Property(a => a.TokenConfirmacao).HasMaxLength(64);
            // Índice simples (compatível SQLite + SQL Server; tokens null são raros)
            entity.HasIndex(a => a.TokenConfirmacao);
            entity.Property(a => a.DataHoraInicio).IsRequired();
            entity.Property(a => a.DataHoraFim).IsRequired();
            entity.Property(a => a.Ativo).IsRequired();
            entity.Property(a => a.CriadoEm).IsRequired();
        });

        modelBuilder.Entity<BloqueioAgenda>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Motivo).HasMaxLength(500).IsRequired();
            entity.Property(b => b.Profissional).HasMaxLength(200);
            entity.Property(b => b.Sala).HasMaxLength(100);
            entity.Property(b => b.Equipamento).HasMaxLength(100);
            entity.HasIndex(b => new { b.ClinicaId, b.DataHoraInicio });
        });

        modelBuilder.Entity<Prontuario>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Descricao).HasMaxLength(2000);
            entity.Property(p => p.Diagnostico).HasMaxLength(1000);
            entity.Property(p => p.Prescricao).HasMaxLength(1000);
            entity.Property(p => p.Evolucao).HasMaxLength(4000);
            entity.Property(p => p.Especialidade).HasMaxLength(120);
            entity.Property(p => p.Data).IsRequired();
            entity.Property(p => p.Ativo).IsRequired();
            entity.Property(p => p.CriadoEm).IsRequired();
            entity.HasMany(p => p.Anexos).WithOne().HasForeignKey(a => a.ProntuarioId);
        });

        modelBuilder.Entity<Anexo>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Nome).HasMaxLength(255).IsRequired();
            entity.Property(a => a.ContentType).HasMaxLength(100).IsRequired();
            entity.Property(a => a.Tamanho).IsRequired();
            entity.Property(a => a.Ativo).IsRequired();
            entity.Property(a => a.CriadoEm).IsRequired();
        });

        modelBuilder.Entity<Notificacao>(entity =>
        {
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Mensagem).HasMaxLength(4000).IsRequired();
            entity.Property(n => n.TelefoneDestino).HasMaxLength(20);
            entity.Property(n => n.Template).HasMaxLength(50);
            entity.Property(n => n.ErroDetalhe).HasMaxLength(1000);
            entity.Property(n => n.Tipo).HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(n => n.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(n => n.Ativo).IsRequired();
            entity.Property(n => n.CriadoEm).IsRequired();
        });

        modelBuilder.Entity<Evento>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Tipo).HasConversion<string>().HasMaxLength(30).IsRequired();
            entity.Property(e => e.Descricao).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Ativo).IsRequired();
            entity.Property(e => e.CriadoEm).IsRequired();
        });

        // ── Novos módulos ─────────────────────────────────────────
        modelBuilder.Entity<Anamnese>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            e.Property(x => x.Especialidade).HasMaxLength(120);
            e.Property(x => x.QueixaPrincipal).HasMaxLength(2000);
            e.Property(x => x.HistoricoMedico).HasMaxLength(4000);
            e.Property(x => x.Alergias).HasMaxLength(1000);
            e.Property(x => x.MedicamentosUso).HasMaxLength(1000);
            e.Property(x => x.Habitos).HasMaxLength(1000);
            e.Property(x => x.Observacoes).HasMaxLength(2000);
            e.HasIndex(x => new { x.ClinicaId, x.PacienteId });
        });

        modelBuilder.Entity<Contrato>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            e.Property(x => x.Conteudo).HasMaxLength(8000).IsRequired();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.AssinaturaNome).HasMaxLength(200);
            e.HasIndex(x => x.ClinicaId);
        });

        modelBuilder.Entity<WhatsAppConversa>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Telefone).HasMaxLength(20).IsRequired();
            e.Property(x => x.NomeContato).HasMaxLength(200).IsRequired();
            e.HasMany(x => x.Mensagens).WithOne().HasForeignKey(m => m.ConversaId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.ClinicaId);
        });

        modelBuilder.Entity<WhatsAppMensagem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Conteudo).HasMaxLength(4000).IsRequired();
            e.Property(x => x.Direcao).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        });

        modelBuilder.Entity<PlanoInjetavel>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Substancia).HasMaxLength(200).IsRequired();
            e.Property(x => x.Protocolo).HasMaxLength(500).IsRequired();
            e.Property(x => x.AreaAplicacao).HasMaxLength(200);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Observacoes).HasMaxLength(1000);
            e.HasIndex(x => x.ClinicaId);
        });

        modelBuilder.Entity<Teleconsulta>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.LinkSala).HasMaxLength(500).IsRequired();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Observacoes).HasMaxLength(1000);
            e.HasIndex(x => x.ClinicaId);
        });

        modelBuilder.Entity<LancamentoFinanceiro>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Tipo).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Categoria).HasMaxLength(100).IsRequired();
            e.Property(x => x.Descricao).HasMaxLength(500).IsRequired();
            e.Property(x => x.Valor).HasColumnType("decimal(12,2)");
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.FormaPagamento).HasMaxLength(50);
            e.Property(x => x.ValorComissao).HasColumnType("decimal(12,2)");
            e.Property(x => x.Profissional).HasMaxLength(200);
            e.HasIndex(x => new { x.ClinicaId, x.Data });
        });

        modelBuilder.Entity<Venda>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Subtotal).HasColumnType("decimal(12,2)");
            e.Property(x => x.Desconto).HasColumnType("decimal(12,2)");
            e.Property(x => x.Total).HasColumnType("decimal(12,2)");
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.FormaPagamento).HasMaxLength(50);
            e.Property(x => x.Observacoes).HasMaxLength(500);
            e.HasMany(x => x.Itens).WithOne().HasForeignKey(i => i.VendaId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.ClinicaId);
        });

        modelBuilder.Entity<VendaItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Descricao).HasMaxLength(300).IsRequired();
            e.Property(x => x.ValorUnitario).HasColumnType("decimal(12,2)");
            e.Ignore(x => x.Total);
        });

        modelBuilder.Entity<ProdutoEstoque>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Nome).HasMaxLength(200).IsRequired();
            e.Property(x => x.Sku).HasMaxLength(50);
            e.Property(x => x.Unidade).HasMaxLength(20);
            e.Property(x => x.CustoUnitario).HasColumnType("decimal(12,2)");
            e.Property(x => x.PrecoVenda).HasColumnType("decimal(12,2)");
            e.Property(x => x.Categoria).HasMaxLength(100);
            e.HasIndex(x => x.ClinicaId);
        });

        modelBuilder.Entity<MovimentacaoEstoque>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Tipo).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Motivo).HasMaxLength(500);
            e.HasIndex(x => x.ClinicaId);
        });

        modelBuilder.Entity<NotaFiscal>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Numero).HasMaxLength(50).IsRequired();
            e.Property(x => x.Serie).HasMaxLength(10);
            e.Property(x => x.ChaveAcesso).HasMaxLength(60);
            e.Property(x => x.Valor).HasColumnType("decimal(12,2)");
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.DescricaoServico).HasMaxLength(500);
            e.Property(x => x.Observacoes).HasMaxLength(1000);
            e.HasIndex(x => x.ClinicaId);
        });

        modelBuilder.Entity<TranscricaoConsulta>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Texto).HasMaxLength(16000).IsRequired();
            e.Property(x => x.Resumo).HasMaxLength(2000);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(x => x.ClinicaId);
        });

        modelBuilder.Entity<PortalAcesso>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Email).HasMaxLength(200).IsRequired();
            e.Property(x => x.TokenAcesso).HasMaxLength(100).IsRequired();
            e.Property(x => x.Observacoes).HasMaxLength(500);
            e.Property(x => x.ExpiraEm);
            e.HasIndex(x => new { x.ClinicaId, x.PacienteId }).IsUnique();
            e.HasIndex(x => x.TokenAcesso).IsUnique();
        });

        modelBuilder.Entity<AvaliacaoFacial>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.ResultadoJson).HasMaxLength(8000).IsRequired();
            e.Property(x => x.Observacoes).HasMaxLength(2000);
            e.Property(x => x.Recomendacoes).HasMaxLength(2000);
            e.Property(x => x.ScoreGeral).HasColumnType("decimal(5,2)");
            e.HasIndex(x => x.ClinicaId);
        });

        modelBuilder.Entity<TarefaIa>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Titulo).HasMaxLength(300).IsRequired();
            e.Property(x => x.Descricao).HasMaxLength(2000);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Prioridade).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(x => x.ClinicaId);
        });

        modelBuilder.Entity<TextoIa>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Tipo).HasMaxLength(50).IsRequired();
            e.Property(x => x.Prompt).HasMaxLength(4000).IsRequired();
            e.Property(x => x.Resultado).HasMaxLength(16000).IsRequired();
            e.HasIndex(x => x.ClinicaId);
        });
    }
}
