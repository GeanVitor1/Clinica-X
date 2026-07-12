using ClinicaX.Domain.Entities;
using ClinicaX.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ClinicaX.Persistence.Data;

public static class SeedData
{
    public const string DemoEmail = "demo@clinica.com";
    /// <summary>Senha demo alinhada à política Identity (8+ com complexidade).</summary>
    public const string DemoPassword = "Demo@1234";

    public static async Task InitializeAsync(IServiceProvider serviceProvider, bool enableDemo = true)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ClinicaXDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ClinicaOwner>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("SeedData");

        // SQL Server: migrations. SQLite zero-config: EnsureCreated (schema do model, sem scripts SQL Server).
        try
        {
            if (context.Database.IsSqlite())
            {
                logger.LogInformation("Provider SQLite → EnsureCreated (deploy zero-config).");
                await context.Database.EnsureCreatedAsync();
            }
            else
            {
                logger.LogInformation("Provider SQL Server → ApplyMigrations.");
                await context.Database.MigrateAsync();
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Falha ao criar/migrar banco. Tentando EnsureCreated como fallback…");
            await context.Database.EnsureCreatedAsync();
        }

        if (!await roleManager.RoleExistsAsync("ClinicaOwner"))
            await roleManager.CreateAsync(new IdentityRole("ClinicaOwner"));

        if (!enableDemo)
        {
            logger.LogInformation("Seed demo desabilitado (Seed:EnableDemo=false).");
            return;
        }

        Clinica clinica;
        if (!context.Clinicas.Any(c => c.Email == DemoEmail))
        {
            clinica = new Clinica
            {
                Nome = "Clínica Sorriso & Saúde",
                Email = DemoEmail,
                Telefone = "(11) 3456-7890",
                Endereco = "Av. Paulista, 1500 — Sala 1204 — Bela Vista, São Paulo/SP",
                Plano = "Profissional",
                HorarioAbertura = new TimeSpan(8, 0, 0),
                HorarioFechamento = new TimeSpan(18, 0, 0),
                DiasFuncionamento = "1,2,3,4,5",
                IsDemo = true
            };
            context.Clinicas.Add(clinica);
            await context.SaveChangesAsync();
            logger.LogInformation("Clínica demo criada.");
        }
        else
        {
            clinica = context.Clinicas.First(c => c.Email == DemoEmail);
            if (!clinica.IsDemo)
            {
                clinica.IsDemo = true;
                await context.SaveChangesAsync();
            }
            if (clinica.Nome is "Clínica Demo" or "")
            {
                clinica.Nome = "Clínica Sorriso & Saúde";
                clinica.Telefone = "(11) 3456-7890";
                clinica.Endereco = "Av. Paulista, 1500 — Sala 1204 — Bela Vista, São Paulo/SP";
                clinica.Plano = "Profissional";
                await context.SaveChangesAsync();
            }
        }

        await EnsureDemoUserAsync(userManager, clinica.Id, logger);
        await PopulateDemoDataAsync(context);
        logger.LogInformation("Seed demo concluído.");
    }

    private static async Task EnsureDemoUserAsync(
        UserManager<ClinicaOwner> userManager,
        Guid clinicaId,
        ILogger logger)
    {
        var existing = await userManager.FindByEmailAsync(DemoEmail);
        if (existing is null)
        {
            var owner = new ClinicaOwner
            {
                UserName = DemoEmail,
                Email = DemoEmail,
                EmailConfirmed = true,
                ClinicaId = clinicaId
            };

            var result = await userManager.CreateAsync(owner, DemoPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                logger.LogError("Falha ao criar usuário demo: {Errors}", errors);
                return;
            }

            await userManager.AddToRoleAsync(owner, "ClinicaOwner");
            logger.LogInformation("Usuário demo criado: {Email}", DemoEmail);
            return;
        }

        if (existing.ClinicaId != clinicaId)
        {
            existing.ClinicaId = clinicaId;
            await userManager.UpdateAsync(existing);
        }

        if (!await userManager.IsInRoleAsync(existing, "ClinicaOwner"))
            await userManager.AddToRoleAsync(existing, "ClinicaOwner");

        if (!await userManager.CheckPasswordAsync(existing, DemoPassword))
        {
            var token = await userManager.GeneratePasswordResetTokenAsync(existing);
            var reset = await userManager.ResetPasswordAsync(existing, token, DemoPassword);
            if (!reset.Succeeded)
                logger.LogError("Falha ao redefinir senha demo: {Errors}",
                    string.Join("; ", reset.Errors.Select(e => e.Description)));
        }
    }

    /// <summary>
    /// Populates demo data. Safe to call after reset-demo or on empty DB.
    /// Fills missing operational data (agenda, prontuários, módulos, etc.) even if patients already exist.
    /// Only applies to the demo clinic (IsDemo / demo@clinica.com).
    /// </summary>
    public static async Task PopulateDemoDataAsync(ClinicaXDbContext context)
    {
        // Somente a clínica demo recebe dados mockados — contas reais ficam vazias até o uso.
        var clinica = context.Clinicas.FirstOrDefault(c => c.Email == DemoEmail)
                      ?? context.Clinicas.FirstOrDefault(c => c.IsDemo);
        if (clinica is null) return;
        if (!clinica.IsDemo)
        {
            clinica.IsDemo = true;
            await context.SaveChangesAsync();
        }

        // ── Serviços ──────────────────────────────────────────────
        if (!context.Servicos.Any(s => s.ClinicaId == clinica.Id))
        {
            context.Servicos.AddRange(
                new Servico { ClinicaId = clinica.Id, Nome = "Consulta de avaliação", Descricao = "Primeira consulta e plano de tratamento", DuracaoMin = 45, Valor = 180m, Cor = "#3b6ef5" },
                new Servico { ClinicaId = clinica.Id, Nome = "Limpeza / profilaxia", Descricao = "Limpeza profissional e orientação de higiene", DuracaoMin = 60, Valor = 220m, Cor = "#0d9488" },
                new Servico { ClinicaId = clinica.Id, Nome = "Restauração em resina", Descricao = "Restauração estética em resina composta", DuracaoMin = 60, Valor = 320m, Cor = "#6d5af0" },
                new Servico { ClinicaId = clinica.Id, Nome = "Clareamento dental", Descricao = "Clareamento em consultório", DuracaoMin = 90, Valor = 890m, Cor = "#d97706" },
                new Servico { ClinicaId = clinica.Id, Nome = "Tratamento de canal", Descricao = "Endodontia — sessão", DuracaoMin = 90, Valor = 650m, Cor = "#e11d48" },
                new Servico { ClinicaId = clinica.Id, Nome = "Extração simples", Descricao = "Exodontia de dente permanente", DuracaoMin = 45, Valor = 280m, Cor = "#0891b2" },
                new Servico { ClinicaId = clinica.Id, Nome = "Aplicação de flúor", Descricao = "Prevenção — aplicação tópica", DuracaoMin = 30, Valor = 90m, Cor = "#059669" },
                new Servico { ClinicaId = clinica.Id, Nome = "Retorno / revisão", Descricao = "Consulta de acompanhamento", DuracaoMin = 30, Valor = 120m, Cor = "#64748b" }
            );
            await context.SaveChangesAsync();
        }

        // ── Pacientes ─────────────────────────────────────────────
        if (!context.Pacientes.Any(p => p.ClinicaId == clinica.Id))
        {
            context.Pacientes.AddRange(
                new Paciente { ClinicaId = clinica.Id, Nome = "Ana Beatriz Costa", Cpf = "12345678901", Telefone = "(11) 98765-4321", DataNascimento = new DateTime(1992, 3, 15), Observacoes = "Alergia a penicilina. Prefere manhãs." },
                new Paciente { ClinicaId = clinica.Id, Nome = "Bruno Henrique Alves", Cpf = "23456789012", Telefone = "(11) 97654-3210", DataNascimento = new DateTime(1985, 7, 22), Observacoes = "Hipertenso controlado. Convênio Unimed." },
                new Paciente { ClinicaId = clinica.Id, Nome = "Camila Ferreira Santos", Cpf = "34567890123", Telefone = "(11) 96543-2109", DataNascimento = new DateTime(1998, 11, 8), Observacoes = "Gestante — 2º trimestre. Particular." },
                new Paciente { ClinicaId = clinica.Id, Nome = "Diego Martins Rocha", Cpf = "45678901234", Telefone = "(11) 95432-1098", DataNascimento = new DateTime(1976, 1, 30), Observacoes = "Diabetes tipo 2. Amil." },
                new Paciente { ClinicaId = clinica.Id, Nome = "Eduarda Lima Nogueira", Cpf = "56789012345", Telefone = "(11) 94321-0987", DataNascimento = new DateTime(2001, 5, 14), Observacoes = "Ansiedade — precisa de acolhimento." },
                new Paciente { ClinicaId = clinica.Id, Nome = "Felipe Augusto Dias", Cpf = "67890123456", Telefone = "(11) 93210-9876", DataNascimento = new DateTime(1990, 9, 3), Observacoes = "Atleta. Bruxismo noturno." },
                new Paciente { ClinicaId = clinica.Id, Nome = "Gabriela Souza Pinto", Cpf = "78901234567", Telefone = "(11) 92109-8765", DataNascimento = new DateTime(1988, 12, 19), Observacoes = "Prótese parcial. Retorno a cada 6 meses." },
                new Paciente { ClinicaId = clinica.Id, Nome = "Henrique Carvalho Melo", Cpf = "89012345678", Telefone = "(11) 91098-7654", DataNascimento = new DateTime(1972, 4, 27), Observacoes = "Implante em andamento — dente 36." },
                new Paciente { ClinicaId = clinica.Id, Nome = "Isabela Ramos Teixeira", Cpf = "90123456789", Telefone = "(11) 90987-6543", DataNascimento = new DateTime(1995, 6, 11), Observacoes = "Ortodontia finalizada em 2025." },
                new Paciente { ClinicaId = clinica.Id, Nome = "João Pedro Nascimento", Cpf = "01234567890", Telefone = "(11) 99876-5432", DataNascimento = new DateTime(2012, 8, 5), Observacoes = "Paciente pediátrico. Acompanhado pela mãe." },
                new Paciente { ClinicaId = clinica.Id, Nome = "Larissa Mendes Campos", Cpf = "11223344556", Telefone = "(11) 98765-1111", DataNascimento = new DateTime(1983, 2, 18), Observacoes = "Clareamento periódico. Particular." },
                new Paciente { ClinicaId = clinica.Id, Nome = "Marcelo Vieira Lopes", Cpf = "22334455667", Telefone = "(11) 97654-2222", DataNascimento = new DateTime(1968, 10, 9), Observacoes = "Uso de anticoagulante — aviso pré-cirúrgico." }
            );
            await context.SaveChangesAsync();
        }

        var pacientes = context.Pacientes.Where(p => p.ClinicaId == clinica.Id && p.Ativo).OrderBy(p => p.Nome).ToList();
        var servicos = context.Servicos.Where(s => s.ClinicaId == clinica.Id && s.Ativo).ToList();
        if (pacientes.Count == 0 || servicos.Count == 0) return;

        Guid P(int i) => pacientes[i % pacientes.Count].Id;
        Guid S(int i) => servicos[i % servicos.Count].Id;

        // ── Agendamentos (só se vazio — permite reset-demo recriar) ─
        if (!context.Agendamentos.Any(a => a.ClinicaId == clinica.Id))
        {
            // Wall-clock local today so frontend day matching works
            DateTime At(int dayOffset, int hour, int min = 0) =>
                DateTime.Today.AddDays(dayOffset).AddHours(hour).AddMinutes(min);

            var ags = new List<Agendamento>
            {
                // Hoje
                Ag(clinica.Id, P(0), S(0), At(0, 8), 45, AgendamentoStatus.Confirmado, "Primeira avaliação — dor no 16"),
                Ag(clinica.Id, P(1), S(1), At(0, 9), 60, AgendamentoStatus.Confirmado, "Limpeza semestral"),
                Ag(clinica.Id, P(2), S(7), At(0, 10), 30, AgendamentoStatus.Agendado, "Revisão gestante"),
                Ag(clinica.Id, P(3), S(2), At(0, 11), 60, AgendamentoStatus.Confirmado, "Restauração 26"),
                Ag(clinica.Id, P(4), S(0), At(0, 14), 45, AgendamentoStatus.Agendado, "Avaliação clareamento"),
                Ag(clinica.Id, P(5), S(1), At(0, 15), 60, AgendamentoStatus.Confirmado, null),
                Ag(clinica.Id, P(6), S(7), At(0, 16), 30, AgendamentoStatus.Agendado, "Ajuste prótese"),
                // Ontem (realizados — faturamento)
                Ag(clinica.Id, P(7), S(4), At(-1, 9), 90, AgendamentoStatus.Realizado, "Canal 46 — 2ª sessão"),
                Ag(clinica.Id, P(8), S(1), At(-1, 11), 60, AgendamentoStatus.Realizado, null),
                Ag(clinica.Id, P(9), S(6), At(-1, 14), 30, AgendamentoStatus.Realizado, "Flúor pediátrico"),
                Ag(clinica.Id, P(10), S(3), At(-1, 15), 90, AgendamentoStatus.Realizado, "Clareamento sessão 1"),
                // Anteontem
                Ag(clinica.Id, P(0), S(1), At(-2, 10), 60, AgendamentoStatus.Realizado, null),
                Ag(clinica.Id, P(11), S(5), At(-2, 14), 45, AgendamentoStatus.Realizado, "Extração 48"),
                Ag(clinica.Id, P(1), S(2), At(-2, 16), 60, AgendamentoStatus.Cancelado, "Remarcado pelo paciente"),
                // Amanhã
                Ag(clinica.Id, P(2), S(0), At(1, 8), 45, AgendamentoStatus.Confirmado, null),
                Ag(clinica.Id, P(3), S(7), At(1, 9), 30, AgendamentoStatus.Agendado, "Pós-restauração"),
                Ag(clinica.Id, P(4), S(3), At(1, 11), 90, AgendamentoStatus.Confirmado, "Clareamento"),
                Ag(clinica.Id, P(5), S(2), At(1, 14), 60, AgendamentoStatus.Agendado, null),
                Ag(clinica.Id, P(6), S(1), At(1, 16), 60, AgendamentoStatus.Agendado, null),
                // +2 a +5 dias
                Ag(clinica.Id, P(7), S(7), At(2, 10), 30, AgendamentoStatus.Agendado, "Revisão canal"),
                Ag(clinica.Id, P(8), S(0), At(2, 15), 45, AgendamentoStatus.Confirmado, null),
                Ag(clinica.Id, P(9), S(1), At(3, 9), 60, AgendamentoStatus.Agendado, null),
                Ag(clinica.Id, P(10), S(2), At(3, 14), 60, AgendamentoStatus.Confirmado, null),
                Ag(clinica.Id, P(11), S(7), At(4, 11), 30, AgendamentoStatus.Agendado, "Pós-extração"),
                Ag(clinica.Id, P(0), S(4), At(5, 9), 90, AgendamentoStatus.Agendado, "Canal 16"),
                // Semana passada (faturamento mês)
                Ag(clinica.Id, P(1), S(3), At(-5, 10), 90, AgendamentoStatus.Realizado, null),
                Ag(clinica.Id, P(2), S(1), At(-5, 15), 60, AgendamentoStatus.Realizado, null),
                Ag(clinica.Id, P(3), S(0), At(-6, 9), 45, AgendamentoStatus.Realizado, null),
                Ag(clinica.Id, P(4), S(2), At(-7, 14), 60, AgendamentoStatus.Realizado, null),
                Ag(clinica.Id, P(5), S(5), At(-8, 11), 45, AgendamentoStatus.Realizado, null),
                Ag(clinica.Id, P(6), S(1), At(-10, 16), 60, AgendamentoStatus.Realizado, null),
            };

            // Fix cancelado with motivo
            ags.First(a => a.Status == AgendamentoStatus.Cancelado).MotivoCancelamento = "Paciente remarcou por compromisso de trabalho";

            context.Agendamentos.AddRange(ags);
            await context.SaveChangesAsync();
        }

        var agendamentos = context.Agendamentos.Where(a => a.ClinicaId == clinica.Id).ToList();

        // ── Prontuários ───────────────────────────────────────────
        if (!context.Prontuarios.Any(pr => pr.ClinicaId == clinica.Id))
        {
            var records = new List<Prontuario>
            {
                new()
                {
                    ClinicaId = clinica.Id,
                    PacienteId = P(0),
                    Data = DateTime.Today.AddDays(-14),
                    Descricao = "Queixa principal: dor ao mastigar no quadrante superior direito.\n\nHistória da doença atual: dor latejante há 5 dias, piora com frio e doce. Sem febre.\n\nExame clínico: cárie profunda no dente 16, teste de vitalidade positivo, percussão positiva.\n\nRadiografia: imagem radiolúcida próxima à câmara pulpar.",
                    Diagnostico = "Cárie profunda com comprometimento pulpar reversível — dente 16. Indicação de restauração e acompanhamento de vitalidade.",
                    Prescricao = "Ibuprofeno 600 mg de 8/8h se dor (máx 3 dias).\nHigiene reforçada com fio dental.\nRetorno em 7 dias ou se piora."
                },
                new()
                {
                    ClinicaId = clinica.Id,
                    PacienteId = P(0),
                    Data = DateTime.Today.AddDays(-2),
                    Descricao = "Retorno: paciente refere melhora da dor após restauração provisória.\n\nExame: restauração íntegra, percussão negativa, vitalidade mantida.",
                    Diagnostico = "Evolução favorável pós-restauração 16.",
                    Prescricao = "Manter higiene. Retorno para profilaxia em 6 meses."
                },
                new()
                {
                    ClinicaId = clinica.Id,
                    PacienteId = P(1),
                    Data = DateTime.Today.AddDays(-1),
                    Descricao = "Profilaxia de rotina. Cálculo leve em faces linguais dos inferiores.\n\nOrientação de escovação e uso de enxaguatório.",
                    Diagnostico = "Gengivite leve — boa resposta esperada com higiene.",
                    Prescricao = "Enxaguatório com clorexidina 0,12% 2x/dia por 7 dias.\nRetorno em 6 meses."
                },
                new()
                {
                    ClinicaId = clinica.Id,
                    PacienteId = P(3),
                    Data = DateTime.Today.AddDays(-1),
                    Descricao = "2ª sessão de endodontia no 46. Condutos instrumentados até lima #35.\n\nIrrigação com hipoclorito 2,5%. Medicação intracanal com hidróxido de cálcio.",
                    Diagnostico = "Periodontite apical assintomática — 46 em tratamento.",
                    Prescricao = "Evitar mastigar no lado afetado.\nDipirona 500 mg se desconforto.\nPróxima sessão em 15 dias."
                },
                new()
                {
                    ClinicaId = clinica.Id,
                    PacienteId = P(7),
                    Data = DateTime.Today.AddDays(-1),
                    Descricao = "Continuidade do tratamento endodôntico. Obturação com guta-percha e cimento AH Plus.\n\nControle radiográfico pós-obturação satisfatório.",
                    Diagnostico = "Tratamento endodôntico concluído — 46.",
                    Prescricao = "Restauração definitiva em 7–10 dias.\nAnti-inflamatório se necessário."
                },
                new()
                {
                    ClinicaId = clinica.Id,
                    PacienteId = P(10),
                    Data = DateTime.Today.AddDays(-1),
                    Descricao = "Clareamento em consultório — 1ª sessão. Gel a 35% por 3 aplicações de 15 min.\n\nSensibilidade leve relatada no final.",
                    Diagnostico = "Discromia dentária — tratamento estético em andamento.",
                    Prescricao = "Evitar pigmentos (café, vinho, açaí) por 48h.\nDessensibilizante tópico se necessário.\n2ª sessão em 7 dias."
                },
                new()
                {
                    ClinicaId = clinica.Id,
                    PacienteId = P(9),
                    Data = DateTime.Today.AddDays(-1),
                    Descricao = "Consulta pediátrica de rotina. Aplicação tópica de flúor.\n\nOrientação aos responsáveis sobre dieta e escovação supervisionada.",
                    Diagnostico = "Saúde bucal adequada para a idade. Sem lesões de cárie ativas.",
                    Prescricao = "Manter escovação 3x/dia com pasta fluoretada.\nRetorno em 6 meses."
                },
                new()
                {
                    ClinicaId = clinica.Id,
                    PacienteId = P(11),
                    Data = DateTime.Today.AddDays(-2),
                    Descricao = "Exodontia do 48 (siso inferior direito) sob anestesia local.\n\nProcedimento sem intercorrências. Sutura com fio reabsorvível.",
                    Diagnostico = "3º molar incluso com indicação de extração — realizado.",
                    Prescricao = "Amoxicilina 500 mg 8/8h por 7 dias (conforme liberação do médico).\nIbuprofeno 600 mg 8/8h por 3 dias.\nGelo nas primeiras 24h.\nRetorno para revisão em 7 dias."
                },
            };

            // Link some to agendamentos if possible
            var realizado = agendamentos.Where(a => a.Status == AgendamentoStatus.Realizado).ToList();
            if (realizado.Count > 0)
            {
                foreach (var pr in records)
                {
                    var match = realizado.FirstOrDefault(a => a.PacienteId == pr.PacienteId);
                    if (match is not null) pr.AgendamentoId = match.Id;
                }
            }

            context.Prontuarios.AddRange(records);
            await context.SaveChangesAsync();

            // Anexos mock (metadata only — tiny bytes)
            var pronts = context.Prontuarios.Where(pr => pr.ClinicaId == clinica.Id).Take(3).ToList();
            foreach (var pr in pronts)
            {
                context.Anexos.Add(new Anexo
                {
                    ProntuarioId = pr.Id,
                    Nome = "radiografia-periapical.pdf",
                    ContentType = "application/pdf",
                    Tamanho = 48_000,
                    Dados = new byte[] { 0x25, 0x50, 0x44, 0x46 } // %PDF
                });
            }
            await context.SaveChangesAsync();
        }

        // ── Notificações ──────────────────────────────────────────
        if (!context.Notificacoes.Any(n => n.ClinicaId == clinica.Id))
        {
            var hojeAgs = agendamentos
                .Where(a => a.DataHoraInicio.Date == DateTime.Today && a.Status != AgendamentoStatus.Cancelado)
                .Take(4)
                .ToList();

            var notifs = new List<Notificacao>();
            foreach (var a in hojeAgs)
            {
                var pac = pacientes.FirstOrDefault(x => x.Id == a.PacienteId);
                notifs.Add(new Notificacao
                {
                    ClinicaId = clinica.Id,
                    PacienteId = a.PacienteId,
                    AgendamentoId = a.Id,
                    Tipo = TipoNotificacao.Lembrete,
                    Mensagem = $"Olá {pac?.Nome?.Split(' ')[0]}! Lembrete: sua consulta hoje às {a.DataHoraInicio:HH:mm}. Confirme no WhatsApp.",
                    Status = StatusNotificacao.Pendente,
                    Lida = false
                });
            }

            notifs.Add(new Notificacao
            {
                ClinicaId = clinica.Id,
                PacienteId = P(0),
                Tipo = TipoNotificacao.Confirmacao,
                Mensagem = "Sua consulta de amanhã foi confirmada. Até logo!",
                Status = StatusNotificacao.Enviada,
                EnviadaEm = DateTime.UtcNow.AddHours(-2),
                Lida = false
            });
            notifs.Add(new Notificacao
            {
                ClinicaId = clinica.Id,
                PacienteId = P(4),
                Tipo = TipoNotificacao.Remarcacao,
                Mensagem = "Remarcação disponível: escolha um novo horário pelo link.",
                Status = StatusNotificacao.Pendente,
                Lida = false
            });
            notifs.Add(new Notificacao
            {
                ClinicaId = clinica.Id,
                PacienteId = P(1),
                Tipo = TipoNotificacao.Lembrete,
                Mensagem = "Falta 1 dia para sua limpeza. Posso te ajudar com alguma dúvida?",
                Status = StatusNotificacao.Enviada,
                EnviadaEm = DateTime.UtcNow.AddHours(-5),
                Lida = true
            });
            notifs.Add(new Notificacao
            {
                ClinicaId = clinica.Id,
                PacienteId = P(5),
                Tipo = TipoNotificacao.Lembrete,
                Mensagem = "Sua teleconsulta de retorno de bruxismo é amanhã às 10:00. Acesse pela sala virtual.",
                Status = StatusNotificacao.Enviada,
                EnviadaEm = DateTime.UtcNow.AddHours(-6),
                Lida = false
            });
            notifs.Add(new Notificacao
            {
                ClinicaId = clinica.Id,
                PacienteId = P(2),
                Tipo = TipoNotificacao.Lembrete,
                Mensagem = "Camila, sua revisão gestante é hoje às 10:00. Estamos te esperando!",
                Status = StatusNotificacao.Enviada,
                EnviadaEm = DateTime.UtcNow.AddMinutes(-90),
                Lida = true
            });

            context.Notificacoes.AddRange(notifs);
            await context.SaveChangesAsync();
        }

        // ── Eventos (timeline) ────────────────────────────────────
        if (!context.Eventos.Any(e => e.ClinicaId == clinica.Id))
        {
            context.Eventos.AddRange(
                new Evento { ClinicaId = clinica.Id, PacienteId = P(0), Tipo = TipoEvento.PacienteCriado, Descricao = "Novo paciente cadastrado na clínica", CriadoEm = DateTime.UtcNow.AddDays(-20) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(0), Tipo = TipoEvento.AgendamentoCriado, Descricao = "Consulta de avaliação agendada", CriadoEm = DateTime.UtcNow.AddDays(-15) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(1), Tipo = TipoEvento.NotificacaoEnviada, Descricao = "Lembrete WhatsApp enviado", CriadoEm = DateTime.UtcNow.AddHours(-6) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(3), Tipo = TipoEvento.AgendamentoCriado, Descricao = "Sessão de canal confirmada", CriadoEm = DateTime.UtcNow.AddDays(-2) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(11), Tipo = TipoEvento.AgendamentoCriado, Descricao = "Extração de siso realizada", CriadoEm = DateTime.UtcNow.AddDays(-2) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(1), Tipo = TipoEvento.AgendamentoCancelado, Descricao = "Agendamento cancelado e remarcado", CriadoEm = DateTime.UtcNow.AddDays(-2) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(10), Tipo = TipoEvento.AgendamentoCriado, Descricao = "Sessão de clareamento concluída", CriadoEm = DateTime.UtcNow.AddDays(-1) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(0), Tipo = TipoEvento.AgendamentoCriado, Descricao = "Consulta de hoje confirmada — 08:00", CriadoEm = DateTime.UtcNow.AddHours(-12) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(4), Tipo = TipoEvento.PacienteEditado, Descricao = "Observações clínicas atualizadas", CriadoEm = DateTime.UtcNow.AddHours(-4) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(2), Tipo = TipoEvento.NotificacaoEnviada, Descricao = "Confirmação enviada via WhatsApp", CriadoEm = DateTime.UtcNow.AddHours(-1) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(5), Tipo = TipoEvento.AgendamentoCriado, Descricao = "Teleconsulta de retorno bruxismo agendada", CriadoEm = DateTime.UtcNow.AddDays(-3) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(7), Tipo = TipoEvento.AgendamentoCriado, Descricao = "Canal 46 — obturação concluída", CriadoEm = DateTime.UtcNow.AddDays(-1) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(6), Tipo = TipoEvento.NotificacaoEnviada, Descricao = "Lembrete de retorno prótese enviado", CriadoEm = DateTime.UtcNow.AddHours(-8) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(10), Tipo = TipoEvento.AgendamentoCriado, Descricao = "2ª sessão de clareamento agendada", CriadoEm = DateTime.UtcNow.AddHours(-2) },
                new Evento { ClinicaId = clinica.Id, PacienteId = P(9), Tipo = TipoEvento.AgendamentoCriado, Descricao = "Consulta pediátrica realizada — flúor aplicado", CriadoEm = DateTime.UtcNow.AddDays(-1) }
            );
            await context.SaveChangesAsync();
        }

        await PopulateModulosDemoAsync(context, clinica, pacientes, servicos);
    }

    /// <summary>Mock data for all new product modules (demo clinic only).</summary>
    private static async Task PopulateModulosDemoAsync(
        ClinicaXDbContext context,
        Clinica clinica,
        List<Paciente> pacientes,
        List<Servico> servicos)
    {
        Guid P(int i) => pacientes[i % pacientes.Count].Id;

        // Anamneses
        if (!context.Anamneses.Any(a => a.ClinicaId == clinica.Id))
        {
            context.Anamneses.AddRange(
                new Anamnese
                {
                    ClinicaId = clinica.Id, PacienteId = P(0), Titulo = "Anamnese inicial",
                    Data = DateTime.Today.AddDays(-30),
                    QueixaPrincipal = "Dor ao mastigar no lado direito",
                    HistoricoMedico = "Sem comorbidades relevantes. Cirurgia de apendicite em 2010.",
                    Alergias = "Penicilina",
                    MedicamentosUso = "Nenhum contínuo",
                    Habitos = "Café 2x/dia. Não fuma.",
                    Observacoes = "Preferência por horários matutinos."
                },
                new Anamnese
                {
                    ClinicaId = clinica.Id, PacienteId = P(1), Titulo = "Anamnese de retorno",
                    Data = DateTime.Today.AddDays(-10),
                    QueixaPrincipal = "Revisão de higiene",
                    HistoricoMedico = "Hipertensão controlada",
                    Alergias = "Nenhuma conhecida",
                    MedicamentosUso = "Losartana 50mg",
                    Habitos = "Sedentário",
                    Observacoes = "Convênio Unimed"
                },
                new Anamnese
                {
                    ClinicaId = clinica.Id, PacienteId = P(2), Titulo = "Anamnese gestante",
                    Data = DateTime.Today.AddDays(-5),
                    QueixaPrincipal = "Sensibilidade gengival",
                    HistoricoMedico = "Gestante — 2º trimestre",
                    Alergias = "Nenhuma",
                    MedicamentosUso = "Ácido fólico, polivitamínico",
                    Habitos = "Alimentação equilibrada",
                    Observacoes = "Evitar radiografias desnecessárias"
                },
                new Anamnese
                {
                    ClinicaId = clinica.Id, PacienteId = P(3), Titulo = "Anamnese diabetes",
                    Data = DateTime.Today.AddDays(-15),
                    QueixaPrincipal = "Retorno para controle glicêmico",
                    HistoricoMedico = "Diabetes tipo 2 há 8 anos. Metformina 850mg 2x/dia.",
                    Alergias = "Sulfas",
                    MedicamentosUso = "Metformina 850mg, Losartana 50mg",
                    Habitos = "Ativo. Dieta controlada. Não fuma.",
                    Observacoes = "Glicemia de jejum 126. HbA1c 7.2%."
                },
                new Anamnese
                {
                    ClinicaId = clinica.Id, PacienteId = P(4), Titulo = "Anamnese clareamento",
                    Data = DateTime.Today.AddDays(-8),
                    QueixaPrincipal = "Desejo de clareamento dental",
                    HistoricoMedico = "Ansiedade controlada com escitalopram 10mg.",
                    Alergias = "Nenhuma",
                    MedicamentosUso = "Escitalopram 10mg",
                    Habitos = "Não fuma. Bebe café diariamente.",
                    Observacoes = "Paciente com alta demanda estética. Foto de evolução solicitada."
                },
                new Anamnese
                {
                    ClinicaId = clinica.Id, PacienteId = P(5), Titulo = "Anamnese bruxismo",
                    Data = DateTime.Today.AddDays(-20),
                    QueixaPrincipal = "Dor na ATM e dor de cabeça ao acordar",
                    HistoricoMedico = "Atleta profissional. Bruxismo noturno há 2 anos.",
                    Alergias = "Nenhuma",
                    MedicamentosUso = "Nenhum",
                    Habitos = "Treina 6x/semana. Dorme 7h em média.",
                    Observacoes = "Placa oclusal indicada. Encaminhado para fisioterapia."
                },
                new Anamnese
                {
                    ClinicaId = clinica.Id, PacienteId = P(6), Titulo = "Anamnese prótese",
                    Data = DateTime.Today.AddDays(-25),
                    QueixaPrincipal = "Desconforto com prótese parcial",
                    HistoricoMedico = "Prótese parcial fixa há 5 anos. Perda de dente suporte.",
                    Alergias = "Metal (níquel)",
                    MedicamentosUso = "Nenhum",
                    Habitos = "Não fuma. Alimentação normal.",
                    Observacoes = "Avaliação para reabilitação protética completa."
                },
                new Anamnese
                {
                    ClinicaId = clinica.Id, PacienteId = P(7), Titulo = "Anamnese implante",
                    Data = DateTime.Today.AddDays(-45),
                    QueixaPrincipal = "Acompanhamento pós-implante",
                    HistoricoMedico = "Implante dentário em andamento — dente 36. 2ª fase cirúrgica.",
                    Alergias = "Nenhuma",
                    MedicamentosUso = "Amoxicilina 500mg 8/8h (pós-cirúrgico)",
                    Habitos = "Não fuma. Boa higiene oral.",
                    Observacoes = "Cicatrização satisfatória. Próxima etapa: prótese sobre implante."
                },
                new Anamnese
                {
                    ClinicaId = clinica.Id, PacienteId = P(8), Titulo = "Anamnese pós-ortodontia",
                    Data = DateTime.Today.AddDays(-12),
                    QueixaPrincipal = "Manutenção de ortodontia",
                    HistoricoMedico = "Ortodontia finalizada em 2025.使用 retenção fixa inferior.",
                    Alergias = "Nenhuma",
                    MedicamentosUso = "Nenhum",
                    Habitos = "boa higiene oral. Evita alimentos duros.",
                    Observacoes = "Retenção fixa íntegra. Evolução favorável."
                },
                new Anamnese
                {
                    ClinicaId = clinica.Id, PacienteId = P(9), Titulo = "Anamnese pediátrica",
                    Data = DateTime.Today.AddDays(-7),
                    QueixaPrincipal = "Consulta de rotina — dentição decídua",
                    HistoricoMedico = "Sem histórico de cáries. Vacinas em dia.",
                    Alergias = "Nenhuma",
                    MedicamentosUso = "Nenhum",
                    Habitos = "Escovação supervisionada 3x/dia. Sem chupeta.",
                    Observacoes = "Acompanhamento semestral. Paciente colaborativo."
                },
                new Anamnese
                {
                    ClinicaId = clinica.Id, PacienteId = P(10), Titulo = "Anamnese clareamento",
                    Data = DateTime.Today.AddDays(-3),
                    QueixaPrincipal = " Clareamento dental — retorno sessão 2",
                    HistoricoMedico = "Clareamento em andamento. 1ª sessão concluída.",
                    Alergias = "Nenhuma",
                    MedicamentosUso = "Nenhum",
                    Habitos = "Não fuma. Reduziu consumo de café.",
                    Observacoes = "Sensibilidade leve pós-sessão 1. Melhora da coloração."
                },
                new Anamnese
                {
                    ClinicaId = clinica.Id, PacienteId = P(11), Titulo = "Anamnese pré-cirúrgica",
                    Data = DateTime.Today.AddDays(-18),
                    QueixaPrincipal = "Extração de siso incluso",
                    HistoricoMedico = "Uso de anticoagulante (varfarina). Necessário suspender 5 dias antes.",
                    Alergias = "Ibuprofeno",
                    MedicamentosUso = "Varfarina 5mg, Omeprazol 20mg",
                    Habitos = "Não fuma. Evita álcool.",
                    Observacoes = "Avaliação hematológica pré-cirúrgica obrigatória."
                });
            await context.SaveChangesAsync();
        }

        // Contratos
        if (!context.Contratos.Any(c => c.ClinicaId == clinica.Id))
        {
            context.Contratos.AddRange(
                new Contrato
                {
                    ClinicaId = clinica.Id, PacienteId = P(0),
                    Titulo = "Termo de consentimento — restauração",
                    Conteudo = "Autorizo o procedimento de restauração em resina no elemento 16, ciente dos riscos e benefícios.",
                    Status = StatusContrato.Assinado, EnviadoEm = DateTime.UtcNow.AddDays(-14), AssinadoEm = DateTime.UtcNow.AddDays(-13),
                    AssinaturaNome = "Ana Beatriz Costa"
                },
                new Contrato
                {
                    ClinicaId = clinica.Id, PacienteId = P(10),
                    Titulo = "Termo — clareamento dental",
                    Conteudo = "Consentimento informado para clareamento em consultório com peróxido de hidrogênio.",
                    Status = StatusContrato.Enviado, EnviadoEm = DateTime.UtcNow.AddDays(-2)
                },
                new Contrato
                {
                    ClinicaId = clinica.Id, PacienteId = null,
                    Titulo = "Modelo — LGPD e privacidade",
                    Conteudo = "Modelo padrão de autorização de uso de dados pessoais e imagens clínicas conforme LGPD.",
                    Status = StatusContrato.Rascunho
                },
                new Contrato
                {
                    ClinicaId = clinica.Id, PacienteId = P(5),
                    Titulo = "Termo — placa oclusal para bruxismo",
                    Conteudo = "Autorizo a confecção e uso de placa oclusal para tratamento de bruxismo, ciente das instruções de uso.",
                    Status = StatusContrato.Assinado, EnviadoEm = DateTime.UtcNow.AddDays(-20), AssinadoEm = DateTime.UtcNow.AddDays(-19),
                    AssinaturaNome = "Felipe Augusto Dias"
                },
                new Contrato
                {
                    ClinicaId = clinica.Id, PacienteId = P(11),
                    Titulo = "Termo — extração de siso",
                    Conteudo = "Consentimento para exodontia do 3º molar inferior direito sob anestesia local. Ciente dos riscos de parestesia.",
                    Status = StatusContrato.Assinado, EnviadoEm = DateTime.UtcNow.AddDays(-22), AssinadoEm = DateTime.UtcNow.AddDays(-21),
                    AssinaturaNome = "Marcelo Vieira Lopes"
                },
                new Contrato
                {
                    ClinicaId = clinica.Id, PacienteId = P(7),
                    Titulo = "Termo — tratamento endodôntico",
                    Conteudo = "Autorizo o tratamento de canal no dente 46, ciente de que poderá ser necessário tratamento cirúrgico adicional.",
                    Status = StatusContrato.Assinado, EnviadoEm = DateTime.UtcNow.AddDays(-30), AssinadoEm = DateTime.UtcNow.AddDays(-29),
                    AssinaturaNome = "Henrique Carvalho Melo"
                });
            await context.SaveChangesAsync();
        }

        // WhatsApp central
        if (!context.WhatsAppConversas.Any(c => c.ClinicaId == clinica.Id))
        {
            var c1 = new WhatsAppConversa
            {
                ClinicaId = clinica.Id, PacienteId = P(0), Telefone = "(11) 98765-4321",
                NomeContato = "Ana Beatriz Costa", UltimaMensagemEm = DateTime.UtcNow.AddMinutes(-40), NaoLida = true
            };
            var c2 = new WhatsAppConversa
            {
                ClinicaId = clinica.Id, PacienteId = P(1), Telefone = "(11) 97654-3210",
                NomeContato = "Bruno Henrique Alves", UltimaMensagemEm = DateTime.UtcNow.AddHours(-3), NaoLida = false
            };
            var c3 = new WhatsAppConversa
            {
                ClinicaId = clinica.Id, PacienteId = P(4), Telefone = "(11) 94321-0987",
                NomeContato = "Eduarda Lima Nogueira", UltimaMensagemEm = DateTime.UtcNow.AddHours(-1), NaoLida = true
            };
            var c4 = new WhatsAppConversa
            {
                ClinicaId = clinica.Id, PacienteId = P(5), Telefone = "(11) 93210-9876",
                NomeContato = "Felipe Augusto Dias", UltimaMensagemEm = DateTime.UtcNow.AddHours(-6), NaoLida = false
            };
            var c5 = new WhatsAppConversa
            {
                ClinicaId = clinica.Id, PacienteId = P(2), Telefone = "(11) 96543-2109",
                NomeContato = "Camila Ferreira Santos", UltimaMensagemEm = DateTime.UtcNow.AddMinutes(-90), NaoLida = true
            };
            context.WhatsAppConversas.AddRange(c1, c2, c3, c4, c5);
            await context.SaveChangesAsync();

            context.WhatsAppMensagens.AddRange(
                new WhatsAppMensagem { ConversaId = c1.Id, Direcao = DirecaoMensagem.Saida, Conteudo = "Olá Ana! Lembrete: consulta hoje às 08:00.", Status = StatusMensagemWhatsApp.Entregue, EnviadaEm = DateTime.UtcNow.AddHours(-12), Automatica = true },
                new WhatsAppMensagem { ConversaId = c1.Id, Direcao = DirecaoMensagem.Entrada, Conteudo = "Oi! Confirmado, estarei lá 😊", Status = StatusMensagemWhatsApp.Lida, EnviadaEm = DateTime.UtcNow.AddHours(-11) },
                new WhatsAppMensagem { ConversaId = c1.Id, Direcao = DirecaoMensagem.Saida, Conteudo = "Perfeito! Até logo.", Status = StatusMensagemWhatsApp.Enviada, EnviadaEm = DateTime.UtcNow.AddMinutes(-40) },
                new WhatsAppMensagem { ConversaId = c2.Id, Direcao = DirecaoMensagem.Saida, Conteudo = "Bruno, sua limpeza está confirmada para hoje às 09:00.", Status = StatusMensagemWhatsApp.Entregue, EnviadaEm = DateTime.UtcNow.AddHours(-5), Automatica = true },
                new WhatsAppMensagem { ConversaId = c2.Id, Direcao = DirecaoMensagem.Entrada, Conteudo = "Ok, obrigado!", Status = StatusMensagemWhatsApp.Lida, EnviadaEm = DateTime.UtcNow.AddHours(-3) },
                new WhatsAppMensagem { ConversaId = c3.Id, Direcao = DirecaoMensagem.Saida, Conteudo = "Eduarda, temos horário para avaliação de clareamento amanhã às 11h. Confirma?", Status = StatusMensagemWhatsApp.Enviada, EnviadaEm = DateTime.UtcNow.AddHours(-1), Automatica = true },
                new WhatsAppMensagem { ConversaId = c4.Id, Direcao = DirecaoMensagem.Saida, Conteudo = "Felipe, sua teleconsulta de retorno de bruxismo está agendada para amanhã às 10:00.", Status = StatusMensagemWhatsApp.Entregue, EnviadaEm = DateTime.UtcNow.AddHours(-6), Automatica = true },
                new WhatsAppMensagem { ConversaId = c4.Id, Direcao = DirecaoMensagem.Entrada, Conteudo = "Perfeito, vou entrar na sala virtual no horário!", Status = StatusMensagemWhatsApp.Lida, EnviadaEm = DateTime.UtcNow.AddHours(-5) },
                new WhatsAppMensagem { ConversaId = c5.Id, Direcao = DirecaoMensagem.Saida, Conteudo = "Camila, lembrete: sua revisão gestante está marcada para hoje às 10:00.", Status = StatusMensagemWhatsApp.Entregue, EnviadaEm = DateTime.UtcNow.AddMinutes(-90), Automatica = true },
                new WhatsAppMensagem { ConversaId = c5.Id, Direcao = DirecaoMensagem.Entrada, Conteudo = "Obrigada! Estarei lá ✨", Status = StatusMensagemWhatsApp.Lida, EnviadaEm = DateTime.UtcNow.AddMinutes(-85) }
            );
            await context.SaveChangesAsync();
        }

        // Injetáveis
        if (!context.PlanosInjetaveis.Any(p => p.ClinicaId == clinica.Id))
        {
            context.PlanosInjetaveis.AddRange(
                new PlanoInjetavel
                {
                    ClinicaId = clinica.Id, PacienteId = P(4), Substancia = "Toxina botulínica",
                    Protocolo = "Full face — 40U", AreaAplicacao = "Testa, glabela, periocular",
                    DataInicio = DateTime.Today.AddDays(-60), TotalSessoes = 4, SessoesRealizadas = 2,
                    IntervaloDias = 120, ProximaSessao = DateTime.Today.AddDays(60),
                    Status = StatusPlanoInjetavel.Ativo, Observacoes = "Boa resposta na 1ª aplicação"
                },
                new PlanoInjetavel
                {
                    ClinicaId = clinica.Id, PacienteId = P(10), Substancia = "Ácido hialurônico",
                    Protocolo = "Preenchimento labial 1ml", AreaAplicacao = "Lábios",
                    DataInicio = DateTime.Today.AddDays(-20), TotalSessoes = 2, SessoesRealizadas = 1,
                    IntervaloDias = 30, ProximaSessao = DateTime.Today.AddDays(10),
                    Status = StatusPlanoInjetavel.Ativo
                },
                new PlanoInjetavel
                {
                    ClinicaId = clinica.Id, PacienteId = P(6), Substancia = "Bioestimulador (PLLA)",
                    Protocolo = "3 sessões com intervalo de 45 dias", AreaAplicacao = "Face média",
                    DataInicio = DateTime.Today.AddDays(-100), TotalSessoes = 3, SessoesRealizadas = 3,
                    IntervaloDias = 45, Status = StatusPlanoInjetavel.Concluido
                },
                new PlanoInjetavel
                {
                    ClinicaId = clinica.Id, PacienteId = P(1), Substancia = "Toxina botulínica",
                    Protocolo = "Glabela — 20U", AreaAplicacao = "Glabela, corrugador",
                    DataInicio = DateTime.Today.AddDays(-90), TotalSessoes = 3, SessoesRealizadas = 1,
                    IntervaloDias = 120, ProximaSessao = DateTime.Today.AddDays(30),
                    Status = StatusPlanoInjetavel.Ativo, Observacoes = "Primeira aplicação. Aguardar retorno."
                },
                new PlanoInjetavel
                {
                    ClinicaId = clinica.Id, PacienteId = P(0), Substancia = "Ácido hialurônico",
                    Protocolo = "Preenchimento malar — 1ml", AreaAplicacao = "Maçãs do rosto",
                    DataInicio = DateTime.Today.AddDays(-45), TotalSessoes = 2, SessoesRealizadas = 2,
                    IntervaloDias = 30, Status = StatusPlanoInjetavel.Concluido,
                    Observacoes = "Resultado satisfatório. Retorno em 12 meses."
                });
            await context.SaveChangesAsync();
        }

        // Telemedicina
        if (!context.Teleconsultas.Any(t => t.ClinicaId == clinica.Id))
        {
            context.Teleconsultas.AddRange(
                new Teleconsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(5),
                    LinkSala = "https://meet.clinicax.app/sala/demo01abc",
                    DataHoraInicio = DateTime.Today.AddDays(1).AddHours(10),
                    Status = StatusTeleconsulta.Agendada, Observacoes = "Retorno de bruxismo"
                },
                new Teleconsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(8),
                    LinkSala = "https://meet.clinicax.app/sala/demo02xyz",
                    DataHoraInicio = DateTime.Today.AddDays(-3).AddHours(15),
                    DataHoraFim = DateTime.Today.AddDays(-3).AddHours(15).AddMinutes(25),
                    Status = StatusTeleconsulta.Concluida, Observacoes = "Orientações pós-ortodontia"
                },
                new Teleconsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(0),
                    LinkSala = "https://meet.clinicax.app/sala/demo03def",
                    DataHoraInicio = DateTime.Today.AddDays(2).AddHours(14),
                    Status = StatusTeleconsulta.Agendada, Observacoes = "Avaliação de dor no dente 16"
                },
                new Teleconsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(3),
                    LinkSala = "https://meet.clinicax.app/sala/demo04ghi",
                    DataHoraInicio = DateTime.Today.AddDays(-1).AddHours(10),
                    DataHoraFim = DateTime.Today.AddDays(-1).AddHours(10).AddMinutes(30),
                    Status = StatusTeleconsulta.Concluida, Observacoes = "Controle glicêmico e orientação bucal"
                },
                new Teleconsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(4),
                    LinkSala = "https://meet.clinicax.app/sala/demo05jkl",
                    DataHoraInicio = DateTime.Today.AddHours(16),
                    Status = StatusTeleconsulta.Agendada, Observacoes = "Avaliação de clareamento dental"
                },
                new Teleconsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(6),
                    LinkSala = "https://meet.clinicax.app/sala/demo06mno",
                    DataHoraInicio = DateTime.Today.AddDays(-5).AddHours(9),
                    DataHoraFim = DateTime.Today.AddDays(-5).AddHours(9).AddMinutes(20),
                    Status = StatusTeleconsulta.Concluida, Observacoes = "Discussão sobre prótese parcial"
                },
                new Teleconsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(10),
                    LinkSala = "https://meet.clinicax.app/sala/demo07pqr",
                    DataHoraInicio = DateTime.Today.AddDays(3).AddHours(11),
                    Status = StatusTeleconsulta.Agendada, Observacoes = "2ª sessão de clareamento"
                });
            await context.SaveChangesAsync();
        }

        // Financeiro
        if (!context.LancamentosFinanceiros.Any(l => l.ClinicaId == clinica.Id))
        {
            context.LancamentosFinanceiros.AddRange(
                new LancamentoFinanceiro { ClinicaId = clinica.Id, PacienteId = P(0), Tipo = TipoLancamento.Receita, Categoria = "Procedimentos", Descricao = "Restauração 16", Valor = 320m, Data = DateTime.Today.AddDays(-2), Status = StatusLancamento.Pago, FormaPagamento = "PIX", DataPagamento = DateTime.Today.AddDays(-2) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, PacienteId = P(10), Tipo = TipoLancamento.Receita, Categoria = "Estética", Descricao = "Clareamento sessão 1", Valor = 890m, Data = DateTime.Today.AddDays(-1), Status = StatusLancamento.Pago, FormaPagamento = "Cartão", DataPagamento = DateTime.Today.AddDays(-1) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, PacienteId = P(11), Tipo = TipoLancamento.Receita, Categoria = "Cirurgia", Descricao = "Extração siso", Valor = 280m, Data = DateTime.Today.AddDays(-2), Status = StatusLancamento.Pago, FormaPagamento = "Dinheiro", DataPagamento = DateTime.Today.AddDays(-2) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, PacienteId = P(4), Tipo = TipoLancamento.Receita, Categoria = "Avaliação", Descricao = "Consulta avaliação", Valor = 180m, Data = DateTime.Today, Status = StatusLancamento.Pendente, DataVencimento = DateTime.Today.AddDays(7) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, Tipo = TipoLancamento.Despesa, Categoria = "Insumos", Descricao = "Compra de resina composta", Valor = 450m, Data = DateTime.Today.AddDays(-5), Status = StatusLancamento.Pago, FormaPagamento = "PIX", DataPagamento = DateTime.Today.AddDays(-5) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, Tipo = TipoLancamento.Despesa, Categoria = "Aluguel", Descricao = "Aluguel sala — mês atual", Valor = 3500m, Data = DateTime.Today.AddDays(-3), Status = StatusLancamento.Pago, FormaPagamento = "Transferência", DataPagamento = DateTime.Today.AddDays(-3) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, Tipo = TipoLancamento.Despesa, Categoria = "Marketing", Descricao = "Anúncios Instagram", Valor = 600m, Data = DateTime.Today, Status = StatusLancamento.Pendente, DataVencimento = DateTime.Today.AddDays(5) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, PacienteId = P(1), Tipo = TipoLancamento.Receita, Categoria = "Procedimentos", Descricao = "Limpeza profissional", Valor = 220m, Data = DateTime.Today.AddDays(-1), Status = StatusLancamento.Pago, FormaPagamento = "PIX", DataPagamento = DateTime.Today.AddDays(-1) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, PacienteId = P(3), Tipo = TipoLancamento.Receita, Categoria = "Procedimentos", Descricao = "Restauração 26", Valor = 320m, Data = DateTime.Today, Status = StatusLancamento.Pendente, DataVencimento = DateTime.Today.AddDays(3) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, PacienteId = P(7), Tipo = TipoLancamento.Receita, Categoria = "Endodontia", Descricao = "Canal 46 — sessão 2", Valor = 650m, Data = DateTime.Today.AddDays(-1), Status = StatusLancamento.Pago, FormaPagamento = "Cartão", DataPagamento = DateTime.Today.AddDays(-1) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, PacienteId = P(9), Tipo = TipoLancamento.Receita, Categoria = "Prevenção", Descricao = "Aplicação flúor pediátrico", Valor = 90m, Data = DateTime.Today.AddDays(-1), Status = StatusLancamento.Pago, FormaPagamento = "Dinheiro", DataPagamento = DateTime.Today.AddDays(-1) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, PacienteId = P(5), Tipo = TipoLancamento.Receita, Categoria = "Avaliação", Descricao = "Consulta avaliação bruxismo", Valor = 180m, Data = DateTime.Today.AddDays(-5), Status = StatusLancamento.Pago, FormaPagamento = "PIX", DataPagamento = DateTime.Today.AddDays(-5) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, Tipo = TipoLancamento.Despesa, Categoria = "Materiais", Descricao = "Compra de luvas procedimento", Valor = 280m, Data = DateTime.Today.AddDays(-7), Status = StatusLancamento.Pago, FormaPagamento = "PIX", DataPagamento = DateTime.Today.AddDays(-7) },
                new LancamentoFinanceiro { ClinicaId = clinica.Id, Tipo = TipoLancamento.Despesa, Categoria = "Software", Descricao = "Assinatura ClinicaX", Valor = 199m, Data = DateTime.Today.AddDays(-2), Status = StatusLancamento.Pago, FormaPagamento = "Cartão", DataPagamento = DateTime.Today.AddDays(-2) }
            );
            await context.SaveChangesAsync();
        }

        // Estoque
        if (!context.ProdutosEstoque.Any(p => p.ClinicaId == clinica.Id))
        {
            var pResina = new ProdutoEstoque { ClinicaId = clinica.Id, Nome = "Resina composta A2", Sku = "RES-A2", Unidade = "ser", Quantidade = 12, QuantidadeMinima = 5, CustoUnitario = 45m, PrecoVenda = 0, Categoria = "Materiais" };
            var pToxina = new ProdutoEstoque { ClinicaId = clinica.Id, Nome = "Toxina botulínica 100U", Sku = "TOX-100", Unidade = "frs", Quantidade = 3, QuantidadeMinima = 4, CustoUnitario = 890m, PrecoVenda = 0, Categoria = "Injetáveis" };
            var pLuva = new ProdutoEstoque { ClinicaId = clinica.Id, Nome = "Luvas procedimento M", Sku = "LUV-M", Unidade = "cx", Quantidade = 8, QuantidadeMinima = 3, CustoUnitario = 28m, PrecoVenda = 0, Categoria = "EPI" };
            var pKit = new ProdutoEstoque { ClinicaId = clinica.Id, Nome = "Kit clareamento home", Sku = "CLA-HOME", Unidade = "un", Quantidade = 15, QuantidadeMinima = 5, CustoUnitario = 120m, PrecoVenda = 280m, Categoria = "Venda" };
            var pAH = new ProdutoEstoque { ClinicaId = clinica.Id, Nome = "Ácido hialurônico 1ml", Sku = "AH-1ML", Unidade = "un", Quantidade = 6, QuantidadeMinima = 3, CustoUnitario = 450m, PrecoVenda = 0, Categoria = "Injetáveis" };
            var pFio = new ProdutoEstoque { ClinicaId = clinica.Id, Nome = "Fio dental 50m", Sku = "FIO-50", Unidade = "un", Quantidade = 20, QuantidadeMinima = 10, CustoUnitario = 8m, PrecoVenda = 15m, Categoria = "Venda" };
            var pMascara = new ProdutoEstoque { ClinicaId = clinica.Id, Nome = "Máscara cirúrgica caixa 50un", Sku = "MASC-50", Unidade = "cx", Quantidade = 10, QuantidadeMinima = 5, CustoUnitario = 22m, PrecoVenda = 0, Categoria = "EPI" };
            var pGel = new ProdutoEstoque { ClinicaId = clinica.Id, Nome = "Gel clareador 35% H2O2", Sku = "GEL-35", Unidade = "frs", Quantidade = 4, QuantidadeMinima = 3, CustoUnitario = 180m, PrecoVenda = 0, Categoria = "Insumos" };
            context.ProdutosEstoque.AddRange(pResina, pToxina, pLuva, pKit, pAH, pFio, pMascara, pGel);
            await context.SaveChangesAsync();

            context.MovimentacoesEstoque.AddRange(
                new MovimentacaoEstoque { ClinicaId = clinica.Id, ProdutoId = pResina.Id, Tipo = TipoMovimentacaoEstoque.Entrada, Quantidade = 20, Motivo = "Compra fornecedor", Data = DateTime.UtcNow.AddDays(-15) },
                new MovimentacaoEstoque { ClinicaId = clinica.Id, ProdutoId = pResina.Id, Tipo = TipoMovimentacaoEstoque.Saida, Quantidade = 8, Motivo = "Uso em procedimentos", Data = DateTime.UtcNow.AddDays(-2) },
                new MovimentacaoEstoque { ClinicaId = clinica.Id, ProdutoId = pToxina.Id, Tipo = TipoMovimentacaoEstoque.Entrada, Quantidade = 5, Motivo = "Compra", Data = DateTime.UtcNow.AddDays(-10) },
                new MovimentacaoEstoque { ClinicaId = clinica.Id, ProdutoId = pToxina.Id, Tipo = TipoMovimentacaoEstoque.Saida, Quantidade = 2, Motivo = "Aplicações", Data = DateTime.UtcNow.AddDays(-1) },
                new MovimentacaoEstoque { ClinicaId = clinica.Id, ProdutoId = pAH.Id, Tipo = TipoMovimentacaoEstoque.Entrada, Quantidade = 10, Motivo = "Compra fornecedor", Data = DateTime.UtcNow.AddDays(-20) },
                new MovimentacaoEstoque { ClinicaId = clinica.Id, ProdutoId = pAH.Id, Tipo = TipoMovimentacaoEstoque.Saida, Quantidade = 4, Motivo = "Procedimentos de preenchimento", Data = DateTime.UtcNow.AddDays(-3) },
                new MovimentacaoEstoque { ClinicaId = clinica.Id, ProdutoId = pGel.Id, Tipo = TipoMovimentacaoEstoque.Entrada, Quantidade = 8, Motivo = "Compra", Data = DateTime.UtcNow.AddDays(-12) },
                new MovimentacaoEstoque { ClinicaId = clinica.Id, ProdutoId = pGel.Id, Tipo = TipoMovimentacaoEstoque.Saida, Quantidade = 4, Motivo = "Sessões de clareamento", Data = DateTime.UtcNow.AddDays(-1) }
            );
            await context.SaveChangesAsync();
        }

        // Vendas
        if (!context.Vendas.Any(v => v.ClinicaId == clinica.Id))
        {
            var kit = context.ProdutosEstoque.FirstOrDefault(p => p.ClinicaId == clinica.Id && p.Sku == "CLA-HOME");
            var v1 = new Venda
            {
                ClinicaId = clinica.Id, PacienteId = P(10), Data = DateTime.Today.AddDays(-1),
                Subtotal = 280m, Desconto = 0, Total = 280m, Status = StatusVenda.Paga, FormaPagamento = "PIX",
                Itens = new List<VendaItem>
                {
                    new() { Descricao = "Kit clareamento home", Quantidade = 1, ValorUnitario = 280m, ProdutoId = kit?.Id }
                }
            };
            var v2 = new Venda
            {
                ClinicaId = clinica.Id, PacienteId = P(0), Data = DateTime.Today,
                Subtotal = 460m, Desconto = 10m, Total = 450m, Status = StatusVenda.Aberta,
                Itens = new List<VendaItem>
                {
                    new() { Descricao = "Consulta avaliação", Quantidade = 1, ValorUnitario = 180m, ServicoId = servicos.FirstOrDefault()?.Id },
                    new() { Descricao = "Kit clareamento home", Quantidade = 1, ValorUnitario = 280m, ProdutoId = kit?.Id }
                }
            };
            var v3 = new Venda
            {
                ClinicaId = clinica.Id, PacienteId = P(5), Data = DateTime.Today.AddDays(-20),
                Subtotal = 180m, Desconto = 0, Total = 180m, Status = StatusVenda.Paga, FormaPagamento = "Cartão",
                Itens = new List<VendaItem>
                {
                    new() { Descricao = "Placa oclusal para bruxismo", Quantidade = 1, ValorUnitario = 180m }
                }
            };
            var v4 = new Venda
            {
                ClinicaId = clinica.Id, PacienteId = P(7), Data = DateTime.Today.AddDays(-1),
                Subtotal = 650m, Desconto = 0, Total = 650m, Status = StatusVenda.Paga, FormaPagamento = "PIX",
                Itens = new List<VendaItem>
                {
                    new() { Descricao = "Tratamento de canal — sessão 2", Quantidade = 1, ValorUnitario = 650m }
                }
            };
            var v5 = new Venda
            {
                ClinicaId = clinica.Id, PacienteId = P(11), Data = DateTime.Today.AddDays(-2),
                Subtotal = 280m, Desconto = 0, Total = 280m, Status = StatusVenda.Paga, FormaPagamento = "Dinheiro",
                Itens = new List<VendaItem>
                {
                    new() { Descricao = "Extração simples", Quantidade = 1, ValorUnitario = 280m }
                }
            };
            context.Vendas.AddRange(v1, v2, v3, v4, v5);
            await context.SaveChangesAsync();
        }

        // Notas fiscais
        if (!context.NotasFiscais.Any(n => n.ClinicaId == clinica.Id))
        {
            var vendasPagas = context.Vendas.Where(v => v.ClinicaId == clinica.Id && v.Status == StatusVenda.Paga).ToList();
            context.NotasFiscais.AddRange(
                new NotaFiscal
                {
                    ClinicaId = clinica.Id, PacienteId = P(10), VendaId = vendasPagas.FirstOrDefault()?.Id,
                    Numero = "000123", Serie = "1",
                    ChaveAcesso = "35260711234567890123456789012345678901234567",
                    Valor = 280m, DataEmissao = DateTime.Today.AddDays(-1),
                    Status = StatusNotaFiscal.Emitida, DescricaoServico = "Kit clareamento home care"
                },
                new NotaFiscal
                {
                    ClinicaId = clinica.Id, PacienteId = P(0),
                    Numero = "000124", Serie = "1",
                    Valor = 320m, DataEmissao = DateTime.Today.AddDays(-2),
                    Status = StatusNotaFiscal.Emitida, DescricaoServico = "Restauração em resina"
                },
                new NotaFiscal
                {
                    ClinicaId = clinica.Id, PacienteId = P(5),
                    Numero = "000125", Serie = "1",
                    Valor = 180m, DataEmissao = DateTime.Today.AddDays(-20),
                    Status = StatusNotaFiscal.Emitida, DescricaoServico = "Placa oclusal para bruxismo"
                },
                new NotaFiscal
                {
                    ClinicaId = clinica.Id, PacienteId = P(7),
                    Numero = "000126", Serie = "1",
                    Valor = 650m, DataEmissao = DateTime.Today.AddDays(-1),
                    Status = StatusNotaFiscal.Emitida, DescricaoServico = "Tratamento endodôntico"
                },
                new NotaFiscal
                {
                    ClinicaId = clinica.Id, PacienteId = P(11),
                    Numero = "000127", Serie = "1",
                    Valor = 280m, DataEmissao = DateTime.Today.AddDays(-2),
                    Status = StatusNotaFiscal.Emitida, DescricaoServico = "Exodontia simples"
                });
            await context.SaveChangesAsync();
        }

        // Transcrições
        if (!context.TranscricoesConsulta.Any(t => t.ClinicaId == clinica.Id))
        {
            context.TranscricoesConsulta.AddRange(
                new TranscricaoConsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(0), Data = DateTime.Today.AddDays(-2),
                    Texto = "Paciente relata dor residual leve após restauração. Exame clínico sem sinais de inflamação. Orientada higiene e retorno em 6 meses.",
                    Resumo = "Evolução favorável pós-restauração; retorno em 6 meses.",
                    Status = StatusTranscricao.Concluida, DuracaoSegundos = 420
                },
                new TranscricaoConsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(3), Data = DateTime.Today.AddDays(-1),
                    Texto = "Segunda sessão de endodontia no 46. Instrumentação concluída. Medicação intracanal. Próxima sessão em 15 dias para obturação.",
                    Resumo = "Endodontia 46 em andamento; próxima obturação em 15 dias.",
                    Status = StatusTranscricao.Concluida, DuracaoSegundos = 900
                },
                new TranscricaoConsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(1), Data = DateTime.Today.AddDays(-1),
                    Texto = "Profilaxia de rotina realizada. Remoção de cálculo supragengival. Orientação de escovação correta e uso de fio dental.",
                    Resumo = "Limpeza profissional concluída; orientação de higiene reforçada.",
                    Status = StatusTranscricao.Concluida, DuracaoSegundos = 600
                },
                new TranscricaoConsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(5), Data = DateTime.Today.AddDays(-20),
                    Texto = "Avaliação de bruxismo. Paciente relata dor matinal na ATM e cefaleia. Exame: desgaste acentuado dos dentes posteriores. Indicação de placa oclusal.",
                    Resumo = "Bruxismo noturno diagnosticado; placa oclusal indicada.",
                    Status = StatusTranscricao.Concluida, DuracaoSegundos = 780
                },
                new TranscricaoConsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(10), Data = DateTime.Today.AddDays(-1),
                    Texto = "Primeira sessão de clareamento com gel peróxido de hidrogênio a 35%. Três aplicações de 15 minutos. Sensibilidade leve no final.",
                    Resumo = "Clareamento sessão 1 concluído; sensibilidade leve.",
                    Status = StatusTranscricao.Concluida, DuracaoSegundos = 1200
                },
                new TranscricaoConsulta
                {
                    ClinicaId = clinica.Id, PacienteId = P(9), Data = DateTime.Today.AddDays(-1),
                    Texto = "Consulta pediátrica de rotina. Aplicação tópica de flúor. Orientação aos responsáveis sobre escovação supervisionada e dieta.",
                    Resumo = "Flúor aplicado; orientação nutricional e de higiene.",
                    Status = StatusTranscricao.Concluida, DuracaoSegundos = 360
                }
            );
            await context.SaveChangesAsync();
        }

        // Portal do paciente
        if (!context.PortalAcessos.Any(p => p.ClinicaId == clinica.Id))
        {
            context.PortalAcessos.AddRange(
                new PortalAcesso
                {
                    ClinicaId = clinica.Id, PacienteId = P(0),
                    Email = "ana.beatriz@email.com", TokenAcesso = "demo-portal-ana01",
                    Habilitado = true, Observacoes = "Acesso liberado para ver agenda e documentos"
                },
                new PortalAcesso
                {
                    ClinicaId = clinica.Id, PacienteId = P(1),
                    Email = "bruno.alves@email.com", TokenAcesso = "demo-portal-bru02",
                    Habilitado = true
                },
                new PortalAcesso
                {
                    ClinicaId = clinica.Id, PacienteId = P(5),
                    Email = "felipe.dias@email.com", TokenAcesso = "demo-portal-fel03",
                    Habilitado = true, Observacoes = "Acesso para acompanhar tratamento de bruxismo"
                },
                new PortalAcesso
                {
                    ClinicaId = clinica.Id, PacienteId = P(10),
                    Email = "larissa.campos@email.com", TokenAcesso = "demo-portal-lar04",
                    Habilitado = true
                },
                new PortalAcesso
                {
                    ClinicaId = clinica.Id, PacienteId = P(4),
                    Email = "eduarda.nogueira@email.com", TokenAcesso = "demo-portal-edu05",
                    Habilitado = false, Observacoes = "Acesso desabilitado — paciente solicitou"
                });
            await context.SaveChangesAsync();
        }

        // Avaliação facial IA
        if (!context.AvaliacoesFaciais.Any(a => a.ClinicaId == clinica.Id))
        {
            context.AvaliacoesFaciais.AddRange(
                new AvaliacaoFacial
                {
                    ClinicaId = clinica.Id, PacienteId = P(4), Data = DateTime.Today.AddDays(-7),
                    ResultadoJson = """{"simetria":88.5,"hidratacao":72.0,"volume":80.2,"rugas":35.0,"areas":["testa","glabela","malar"]}""",
                    ScoreGeral = 82.5m,
                    Observacoes = "Boa estrutura óssea; leve assimetria malar",
                    Recomendacoes = "Toxina em glabela + bioestimulador malar direito"
                },
                new AvaliacaoFacial
                {
                    ClinicaId = clinica.Id, PacienteId = P(10), Data = DateTime.Today.AddDays(-1),
                    ResultadoJson = """{"simetria":91.0,"hidratacao":68.5,"volume":75.0,"rugas":42.0,"areas":["labios","olheiras"]}""",
                    ScoreGeral = 78.0m,
                    Recomendacoes = "Hidratação profunda e avaliação de preenchimento labial sutil"
                },
                new AvaliacaoFacial
                {
                    ClinicaId = clinica.Id, PacienteId = P(1), Data = DateTime.Today.AddDays(-10),
                    ResultadoJson = """{"simetria":85.0,"hidratacao":70.0,"volume":78.5,"rugas":28.0,"areas":["testa","glabela","periocular"]}""",
                    ScoreGeral = 80.0m,
                    Observacoes = "Paciente masculino, pele oleosa, rugas de expressão leves",
                    Recomendacoes = "Toxina em glabela e corrugador. Skin care com retinol."
                },
                new AvaliacaoFacial
                {
                    ClinicaId = clinica.Id, PacienteId = P(6), Data = DateTime.Today.AddDays(-15),
                    ResultadoJson = """{"simetria":92.0,"hidratacao":75.0,"volume":82.0,"rugas":20.0,"areas":["malar","mandibula","colagena"]}""",
                    ScoreGeral = 85.0m,
                    Observacoes = "Evolução favorável após bioestimulador PLLA",
                    Recomendacoes = "Manter protocolo de manutenção a cada 6 meses"
                },
                new AvaliacaoFacial
                {
                    ClinicaId = clinica.Id, PacienteId = P(0), Data = DateTime.Today.AddDays(-5),
                    ResultadoJson = """{"simetria":89.0,"hidratacao":78.0,"volume":81.0,"rugas":25.0,"areas":["labios","malar","olheiras"]}""",
                    ScoreGeral = 83.0m,
                    Observacoes = "Pele hidratada, volume malar adequado, olheiras leves",
                    Recomendacoes = "Preenchimento labial sutil + skincare antioxidante"
                }
            );
            await context.SaveChangesAsync();
        }

        // Tarefas IA
        if (!context.TarefasIa.Any(t => t.ClinicaId == clinica.Id))
        {
            context.TarefasIa.AddRange(
                new TarefaIa { ClinicaId = clinica.Id, Titulo = "Confirmar consultas de amanhã", Descricao = "Enviar WhatsApp automático", Status = StatusTarefa.Pendente, Prioridade = PrioridadeTarefa.Alta, Prazo = DateTime.Today.AddDays(1), GeradaPorIa = true },
                new TarefaIa { ClinicaId = clinica.Id, Titulo = "Reposição de toxina botulínica", Descricao = "Estoque abaixo do mínimo", Status = StatusTarefa.Pendente, Prioridade = PrioridadeTarefa.Alta, Prazo = DateTime.Today.AddDays(2), GeradaPorIa = true },
                new TarefaIa { ClinicaId = clinica.Id, Titulo = "Assinar termo de clareamento — Eduarda", Descricao = "Contrato enviado, aguardando assinatura", Status = StatusTarefa.EmAndamento, Prioridade = PrioridadeTarefa.Media, PacienteId = P(4), GeradaPorIa = false },
                new TarefaIa { ClinicaId = clinica.Id, Titulo = "Emitir NFS-e da semana", Descricao = "3 vendas pagas sem nota", Status = StatusTarefa.Pendente, Prioridade = PrioridadeTarefa.Media, GeradaPorIa = true },
                new TarefaIa { ClinicaId = clinica.Id, Titulo = "Atualizar prontuário de Bruno", Descricao = "Limpeza realizada, sem registro no sistema", Status = StatusTarefa.Pendente, Prioridade = PrioridadeTarefa.Baixa, PacienteId = P(1), GeradaPorIa = true },
                new TarefaIa { ClinicaId = clinica.Id, Titulo = "Agendar retorno para Camila", Descricao = "Revisão gestante em 15 dias", Status = StatusTarefa.Pendente, Prioridade = PrioridadeTarefa.Media, PacienteId = P(2), GeradaPorIa = true },
                new TarefaIa { ClinicaId = clinica.Id, Titulo = "Verificar consentimento de Henrique", Descricao = "Termo de canal assinado, confirmar recebimento", Status = StatusTarefa.Concluida, Prioridade = PrioridadeTarefa.Baixa, PacienteId = P(7), GeradaPorIa = false, Prazo = DateTime.Today.AddDays(-1) },
                new TarefaIa { ClinicaId = clinica.Id, Titulo = "Preparar material para teleconsulta", Descricao = "Felipe — retorno bruxismo amanhã 10h", Status = StatusTarefa.EmAndamento, Prioridade = PrioridadeTarefa.Alta, PacienteId = P(5), GeradaPorIa = false, Prazo = DateTime.Today.AddDays(1) }
            );
            await context.SaveChangesAsync();
        }

        // Textos IA
        if (!context.TextosIa.Any(t => t.ClinicaId == clinica.Id))
        {
            context.TextosIa.AddRange(
                new TextoIa
                {
                    ClinicaId = clinica.Id, Tipo = "whatsapp",
                    Prompt = "Lembrete de consulta amanhã 11h clareamento",
                    Resultado = "Olá! 😊 Lembrete: amanhã às 11h temos sua sessão de clareamento. Confirme com um OK. Até lá!"
                },
                new TextoIa
                {
                    ClinicaId = clinica.Id, Tipo = "email",
                    Prompt = "Boas-vindas novo paciente",
                    Resultado = "Assunto: Bem-vindo(a) à Clínica Sorriso & Saúde\n\nOlá!\n\nÉ um prazer ter você conosco. Nossa equipe está pronta para cuidar do seu sorriso.\n\nAtenciosamente,\nEquipe Clínica Sorriso & Saúde"
                },
                new TextoIa
                {
                    ClinicaId = clinica.Id, Tipo = "whatsapp",
                    Prompt = "Confirmação de teleconsulta retorno bruxismo",
                    Resultado = "Olá Felipe! 📱 Sua teleconsulta de retorno para acompanhamento do bruxismo está marcada para amanhã às 10:00. Acesse pela sala virtual: https://meet.clinicax.app/sala/demo01abc. Até lá!"
                },
                new TextoIa
                {
                    ClinicaId = clinica.Id, Tipo = "prontuario",
                    Prompt = "Evolução pós-restauração Ana Beatriz",
                    Resultado = "Evolução clínica\n\nQueixa: dor residual leve pós-restauração.\n\nExame: restauração íntegra, percussão negativa, sem sinais de inflamação.\n\nConduta: orientada higiene reforçada com fio dental. Retorno para profilaxia em 6 meses."
                },
                new TextoIa
                {
                    ClinicaId = clinica.Id, Tipo = "contrato",
                    Prompt = "Termo de consentimento para implante dentário",
                    Resultado = "TERMO DE CONSENTIMENTO INFORMADO — IMPLANTE DENTÁRIO\n\nEu, paciente abaixo assinado, declaro ter sido informado(a) sobre o procedimento de implante dentário, incluindo riscos, benefícios e alternativas.\n\nAutorizo a realização conforme orientações da equipe clínica.\n\nLocal e data: ____/____/________\nAssinatura: _______________________"
                },
                new TextoIa
                {
                    ClinicaId = clinica.Id, Tipo = "post",
                    Prompt = "Dicas de higiene bucal para crianças",
                    Resultado = "✨ Dicas para o sorriso das crianças!\n\n🪥 Escove os dentes 3x/dia com pasta fluoretada\n🍎 Evite doces antes de dormir\n📅 Visite o dentista a cada 6 meses\n\nAgende a avaliação pediátrica!\n\n#saudebucal #peds #clinicax"
                }
            );
            await context.SaveChangesAsync();
        }
    }

    private static Agendamento Ag(
        Guid clinicaId,
        Guid pacienteId,
        Guid servicoId,
        DateTime inicio,
        int duracaoMin,
        AgendamentoStatus status,
        string? obs)
    {
        return new Agendamento
        {
            ClinicaId = clinicaId,
            PacienteId = pacienteId,
            ServicoId = servicoId,
            DataHoraInicio = inicio,
            DataHoraFim = inicio.AddMinutes(duracaoMin),
            Status = status,
            Observacao = obs,
            CriadoEm = DateTime.UtcNow.AddDays(-1)
        };
    }
}
