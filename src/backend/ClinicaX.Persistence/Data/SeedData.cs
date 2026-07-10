using ClinicaX.Domain.Entities;
using ClinicaX.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ClinicaX.Persistence.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ClinicaXDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ClinicaOwner>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        await context.Database.MigrateAsync();

        if (!await roleManager.RoleExistsAsync("ClinicaOwner"))
            await roleManager.CreateAsync(new IdentityRole("ClinicaOwner"));

        if (context.Clinicas.Any())
            return;

        var clinica = new Clinica
        {
            Nome = "Clínica Demo",
            Email = "demo@clinica.com",
            Telefone = "(11) 99999-8888",
            Endereco = "Rua Exemplo, 123 - Centro",
            Plano = "Mensal",
            HorarioAbertura = new TimeSpan(8, 0, 0),
            HorarioFechamento = new TimeSpan(18, 0, 0),
            DiasFuncionamento = "1,2,3,4,5"
        };

        context.Clinicas.Add(clinica);
        await context.SaveChangesAsync();

        var owner = new ClinicaOwner
        {
            UserName = "demo@clinica.com",
            Email = "demo@clinica.com",
            ClinicaId = clinica.Id
        };

        var result = await userManager.CreateAsync(owner, "1234");
        if (result.Succeeded)
            await userManager.AddToRoleAsync(owner, "ClinicaOwner");

        await PopulateDemoDataAsync(context);
    }

    public static async Task PopulateDemoDataAsync(ClinicaXDbContext context)
    {
        var clinica = context.Clinicas.FirstOrDefault();
        if (clinica is null) return;

        if (!context.Servicos.Any())
        {
            context.Servicos.AddRange(
                new Servico { ClinicaId = clinica.Id, Nome = "Consulta", Descricao = "Consulta odontológica geral", DuracaoMin = 60, Valor = 150m, Cor = "#14b8a6" },
                new Servico { ClinicaId = clinica.Id, Nome = "Limpeza", Descricao = "Limpeza e profilaxia", DuracaoMin = 90, Valor = 200m, Cor = "#3b82f6" },
                new Servico { ClinicaId = clinica.Id, Nome = "Canal", Descricao = "Tratamento de canal", DuracaoMin = 120, Valor = 350m, Cor = "#f59e0b" },
                new Servico { ClinicaId = clinica.Id, Nome = "Raio-X", Descricao = "Raio-X panorâmico", DuracaoMin = 30, Valor = 150m, Cor = "#ef4444" }
            );
        }

        if (!context.Pacientes.Any())
        {
            var nomes = new[] { "Ana Silva", "Carlos Oliveira", "Maria Santos", "João Souza", "Fernanda Lima" };
            context.Pacientes.AddRange(
                new Paciente { ClinicaId = clinica.Id, Nome = nomes[0], Cpf = "12345678901", Telefone = "(11) 91234-5678", DataNascimento = new DateTime(1990, 5, 12) },
                new Paciente { ClinicaId = clinica.Id, Nome = nomes[1], Cpf = "23456789012", Telefone = "(11) 92345-6789", DataNascimento = new DateTime(1985, 8, 22) },
                new Paciente { ClinicaId = clinica.Id, Nome = nomes[2], Cpf = "34567890123", Telefone = "(11) 93456-7890", Observacoes = "Alergia a dipirona" },
                new Paciente { ClinicaId = clinica.Id, Nome = nomes[3], Cpf = "45678901234", Telefone = "(11) 94567-8901", DataNascimento = new DateTime(1978, 3, 5) },
                new Paciente { ClinicaId = clinica.Id, Nome = nomes[4], Cpf = "56789012345", Telefone = "(11) 95678-9012", Observacoes = "Diabetes tipo 2" }
            );
        }

        await context.SaveChangesAsync();
    }
}
