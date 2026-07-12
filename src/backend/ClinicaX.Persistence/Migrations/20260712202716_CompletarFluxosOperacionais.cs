using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicaX.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CompletarFluxosOperacionais : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PercentualComissao",
                table: "Servicos",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "Prontuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Especialidade",
                table: "Prontuarios",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Evolucao",
                table: "Prontuarios",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContatoEmergencia",
                table: "Pacientes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Convenio",
                table: "Pacientes",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Pacientes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Endereco",
                table: "Pacientes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroCarteirinha",
                table: "Pacientes",
                type: "nvarchar(60)",
                maxLength: 60,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TelefoneEmergencia",
                table: "Pacientes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Mensagem",
                table: "Notificacoes",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000);

            migrationBuilder.AddColumn<string>(
                name: "ErroDetalhe",
                table: "Notificacoes",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TelefoneDestino",
                table: "Notificacoes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Template",
                table: "Notificacoes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Profissional",
                table: "LancamentosFinanceiros",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ValorComissao",
                table: "LancamentosFinanceiros",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Especialidade",
                table: "Anamneses",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConfirmadoEm",
                table: "Agendamentos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Equipamento",
                table: "Agendamentos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "LembreteEnviado",
                table: "Agendamentos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PosConsultaEnviado",
                table: "Agendamentos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Profissional",
                table: "Agendamentos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RealizadoEm",
                table: "Agendamentos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sala",
                table: "Agendamentos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TokenConfirmacao",
                table: "Agendamentos",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BloqueiosAgenda",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataHoraInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataHoraFim = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Motivo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Profissional = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Sala = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Equipamento = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BloqueiosAgenda", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_TokenConfirmacao",
                table: "Agendamentos",
                column: "TokenConfirmacao");

            migrationBuilder.CreateIndex(
                name: "IX_BloqueiosAgenda_ClinicaId_DataHoraInicio",
                table: "BloqueiosAgenda",
                columns: new[] { "ClinicaId", "DataHoraInicio" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BloqueiosAgenda");

            migrationBuilder.DropIndex(
                name: "IX_Agendamentos_TokenConfirmacao",
                table: "Agendamentos");

            migrationBuilder.DropColumn(
                name: "PercentualComissao",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "Prontuarios");

            migrationBuilder.DropColumn(
                name: "Especialidade",
                table: "Prontuarios");

            migrationBuilder.DropColumn(
                name: "Evolucao",
                table: "Prontuarios");

            migrationBuilder.DropColumn(
                name: "ContatoEmergencia",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Convenio",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Endereco",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "NumeroCarteirinha",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "TelefoneEmergencia",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "ErroDetalhe",
                table: "Notificacoes");

            migrationBuilder.DropColumn(
                name: "TelefoneDestino",
                table: "Notificacoes");

            migrationBuilder.DropColumn(
                name: "Template",
                table: "Notificacoes");

            migrationBuilder.DropColumn(
                name: "Profissional",
                table: "LancamentosFinanceiros");

            migrationBuilder.DropColumn(
                name: "ValorComissao",
                table: "LancamentosFinanceiros");

            migrationBuilder.DropColumn(
                name: "Especialidade",
                table: "Anamneses");

            migrationBuilder.DropColumn(
                name: "ConfirmadoEm",
                table: "Agendamentos");

            migrationBuilder.DropColumn(
                name: "Equipamento",
                table: "Agendamentos");

            migrationBuilder.DropColumn(
                name: "LembreteEnviado",
                table: "Agendamentos");

            migrationBuilder.DropColumn(
                name: "PosConsultaEnviado",
                table: "Agendamentos");

            migrationBuilder.DropColumn(
                name: "Profissional",
                table: "Agendamentos");

            migrationBuilder.DropColumn(
                name: "RealizadoEm",
                table: "Agendamentos");

            migrationBuilder.DropColumn(
                name: "Sala",
                table: "Agendamentos");

            migrationBuilder.DropColumn(
                name: "TokenConfirmacao",
                table: "Agendamentos");

            migrationBuilder.AlterColumn<string>(
                name: "Mensagem",
                table: "Notificacoes",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(4000)",
                oldMaxLength: 4000);
        }
    }
}
