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
            entity.Property(p => p.Observacoes).HasMaxLength(1000);
            entity.Property(p => p.Ativo).IsRequired();
            entity.Property(p => p.CriadoEm).IsRequired();
        });

        modelBuilder.Entity<Servico>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Nome).HasMaxLength(200).IsRequired();
            entity.Property(s => s.Descricao).HasMaxLength(500);
            entity.Property(s => s.Valor).HasColumnType("decimal(10,2)");
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
            entity.Property(a => a.DataHoraInicio).IsRequired();
            entity.Property(a => a.DataHoraFim).IsRequired();
            entity.Property(a => a.Ativo).IsRequired();
            entity.Property(a => a.CriadoEm).IsRequired();
        });

        modelBuilder.Entity<Prontuario>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Descricao).HasMaxLength(2000);
            entity.Property(p => p.Diagnostico).HasMaxLength(1000);
            entity.Property(p => p.Prescricao).HasMaxLength(1000);
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
            entity.Property(n => n.Mensagem).HasMaxLength(2000).IsRequired();
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
    }
}
