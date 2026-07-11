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
    public const string DemoPassword = "1234";

    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ClinicaXDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ClinicaOwner>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("SeedData");

        await context.Database.MigrateAsync();

        if (!await roleManager.RoleExistsAsync("ClinicaOwner"))
            await roleManager.CreateAsync(new IdentityRole("ClinicaOwner"));

        Clinica clinica;
        if (!context.Clinicas.Any())
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
                DiasFuncionamento = "1,2,3,4,5"
            };
            context.Clinicas.Add(clinica);
            await context.SaveChangesAsync();
            logger.LogInformation("Clínica demo criada.");
        }
        else
        {
            clinica = context.Clinicas.First();
            // Enrich clinic profile if still placeholder
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
    /// Fills missing operational data (agenda, prontuários, etc.) even if patients already exist.
    /// </summary>
    public static async Task PopulateDemoDataAsync(ClinicaXDbContext context)
    {
        var clinica = context.Clinicas.FirstOrDefault();
        if (clinica is null) return;

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
                new Evento { ClinicaId = clinica.Id, PacienteId = P(2), Tipo = TipoEvento.NotificacaoEnviada, Descricao = "Confirmação enviada via WhatsApp", CriadoEm = DateTime.UtcNow.AddHours(-1) }
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
