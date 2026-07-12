using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicaX.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class HardenSecurityAndPortalExpiry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Agendamentos_TokenConfirmacao",
                table: "Agendamentos");

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiraEm",
                table: "PortalAcessos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TokenConfirmacao",
                table: "Agendamentos",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(32)",
                oldMaxLength: 32,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_TokenConfirmacao",
                table: "Agendamentos",
                column: "TokenConfirmacao",
                unique: true,
                filter: "[TokenConfirmacao] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Agendamentos_TokenConfirmacao",
                table: "Agendamentos");

            migrationBuilder.DropColumn(
                name: "ExpiraEm",
                table: "PortalAcessos");

            migrationBuilder.AlterColumn<string>(
                name: "TokenConfirmacao",
                table: "Agendamentos",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(64)",
                oldMaxLength: 64,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_TokenConfirmacao",
                table: "Agendamentos",
                column: "TokenConfirmacao");
        }
    }
}
