using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicaX.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddModulosCompletos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDemo",
                table: "Clinicas",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Anamneses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    QueixaPrincipal = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    HistoricoMedico = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Alergias = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    MedicamentosUso = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Habitos = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Observacoes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CamposExtrasJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Anamneses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AvaliacoesFaciais",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResultadoJson = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: false),
                    Observacoes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Recomendacoes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ScoreGeral = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AvaliacoesFaciais", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Contratos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Titulo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Conteudo = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    EnviadoEm = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AssinadoEm = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AssinaturaNome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contratos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LancamentosFinanceiros",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AgendamentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Tipo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Categoria = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Valor = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataPagamento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FormaPagamento = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LancamentosFinanceiros", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MovimentacoesEstoque",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Quantidade = table.Column<int>(type: "int", nullable: false),
                    Motivo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimentacoesEstoque", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotasFiscais",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VendaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Numero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Serie = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    ChaveAcesso = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    Valor = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    DataEmissao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DescricaoServico = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Observacoes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotasFiscais", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanosInjetaveis",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Substancia = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Protocolo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AreaAplicacao = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DataInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalSessoes = table.Column<int>(type: "int", nullable: false),
                    SessoesRealizadas = table.Column<int>(type: "int", nullable: false),
                    IntervaloDias = table.Column<int>(type: "int", nullable: false),
                    ProximaSessao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Observacoes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanosInjetaveis", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PortalAcessos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TokenAcesso = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Habilitado = table.Column<bool>(type: "bit", nullable: false),
                    UltimoAcesso = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Observacoes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PortalAcessos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProdutosEstoque",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Sku = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Unidade = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Quantidade = table.Column<int>(type: "int", nullable: false),
                    QuantidadeMinima = table.Column<int>(type: "int", nullable: false),
                    CustoUnitario = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    PrecoVenda = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    Categoria = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdutosEstoque", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TarefasIa",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Prioridade = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Prazo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GeradaPorIa = table.Column<bool>(type: "bit", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TarefasIa", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Teleconsultas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AgendamentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LinkSala = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DataHoraInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataHoraFim = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Observacoes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teleconsultas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TextosIa",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Prompt = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Resultado = table.Column<string>(type: "nvarchar(max)", maxLength: 16000, nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TextosIa", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TranscricoesConsulta",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AgendamentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Texto = table.Column<string>(type: "nvarchar(max)", maxLength: 16000, nullable: false),
                    Resumo = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DuracaoSegundos = table.Column<int>(type: "int", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TranscricoesConsulta", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Vendas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    Desconto = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FormaPagamento = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Observacoes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vendas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WhatsAppConversas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Telefone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NomeContato = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    UltimaMensagemEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NaoLida = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppConversas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VendaItens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VendaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ServicoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Quantidade = table.Column<int>(type: "int", nullable: false),
                    ValorUnitario = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendaItens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VendaItens_Vendas_VendaId",
                        column: x => x.VendaId,
                        principalTable: "Vendas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WhatsAppMensagens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Direcao = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Conteudo = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    EnviadaEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Automatica = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppMensagens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppMensagens_WhatsAppConversas_ConversaId",
                        column: x => x.ConversaId,
                        principalTable: "WhatsAppConversas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Anamneses_ClinicaId_PacienteId",
                table: "Anamneses",
                columns: new[] { "ClinicaId", "PacienteId" });

            migrationBuilder.CreateIndex(
                name: "IX_AvaliacoesFaciais_ClinicaId",
                table: "AvaliacoesFaciais",
                column: "ClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_Contratos_ClinicaId",
                table: "Contratos",
                column: "ClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_LancamentosFinanceiros_ClinicaId_Data",
                table: "LancamentosFinanceiros",
                columns: new[] { "ClinicaId", "Data" });

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesEstoque_ClinicaId",
                table: "MovimentacoesEstoque",
                column: "ClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_NotasFiscais_ClinicaId",
                table: "NotasFiscais",
                column: "ClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanosInjetaveis_ClinicaId",
                table: "PlanosInjetaveis",
                column: "ClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_PortalAcessos_ClinicaId_PacienteId",
                table: "PortalAcessos",
                columns: new[] { "ClinicaId", "PacienteId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PortalAcessos_TokenAcesso",
                table: "PortalAcessos",
                column: "TokenAcesso",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProdutosEstoque_ClinicaId",
                table: "ProdutosEstoque",
                column: "ClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_TarefasIa_ClinicaId",
                table: "TarefasIa",
                column: "ClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_Teleconsultas_ClinicaId",
                table: "Teleconsultas",
                column: "ClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_TextosIa_ClinicaId",
                table: "TextosIa",
                column: "ClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_TranscricoesConsulta_ClinicaId",
                table: "TranscricoesConsulta",
                column: "ClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_VendaItens_VendaId",
                table: "VendaItens",
                column: "VendaId");

            migrationBuilder.CreateIndex(
                name: "IX_Vendas_ClinicaId",
                table: "Vendas",
                column: "ClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppConversas_ClinicaId",
                table: "WhatsAppConversas",
                column: "ClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppMensagens_ConversaId",
                table: "WhatsAppMensagens",
                column: "ConversaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Anamneses");

            migrationBuilder.DropTable(
                name: "AvaliacoesFaciais");

            migrationBuilder.DropTable(
                name: "Contratos");

            migrationBuilder.DropTable(
                name: "LancamentosFinanceiros");

            migrationBuilder.DropTable(
                name: "MovimentacoesEstoque");

            migrationBuilder.DropTable(
                name: "NotasFiscais");

            migrationBuilder.DropTable(
                name: "PlanosInjetaveis");

            migrationBuilder.DropTable(
                name: "PortalAcessos");

            migrationBuilder.DropTable(
                name: "ProdutosEstoque");

            migrationBuilder.DropTable(
                name: "TarefasIa");

            migrationBuilder.DropTable(
                name: "Teleconsultas");

            migrationBuilder.DropTable(
                name: "TextosIa");

            migrationBuilder.DropTable(
                name: "TranscricoesConsulta");

            migrationBuilder.DropTable(
                name: "VendaItens");

            migrationBuilder.DropTable(
                name: "WhatsAppMensagens");

            migrationBuilder.DropTable(
                name: "Vendas");

            migrationBuilder.DropTable(
                name: "WhatsAppConversas");

            migrationBuilder.DropColumn(
                name: "IsDemo",
                table: "Clinicas");
        }
    }
}
