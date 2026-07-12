using ClinicaX.Application.DTOs;
using ClinicaX.Application.Services;
using static ClinicaX.API.Endpoints.EndpointHelpers;

namespace ClinicaX.API.Endpoints;

/// <summary>
/// Endpoints dos módulos — todas as mutações e leituras por id usam ClinicaId do JWT (anti-IDOR).
/// </summary>
public static class ModulosEndpoints
{
    public static void MapModulosEndpoints(this WebApplication app)
    {
        // ── Anamnese ──────────────────────────────────────────
        var anamnese = app.MapGroup("/api/anamneses").WithTags("Anamnese").RequireAuthorization("ClinicaOwner");
        anamnese.MapGet("/", async (IModulosService svc, HttpContext ctx, Guid? pacienteId) =>
        {
            var r = await svc.ListAnamnesesAsync(GetClinicaId(ctx), pacienteId);
            return r.IsSuccess ? Results.Ok(r.Value) : Results.BadRequest(r.Errors);
        });
        anamnese.MapPost("/", async (CreateAnamneseRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.CreateAnamneseAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/anamneses/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
        anamnese.MapDelete("/{id:guid}", async (Guid id, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.DeleteAnamneseAsync(GetClinicaId(ctx), id);
            return r.IsSuccess ? Results.NoContent() : Results.NotFound();
        });

        // ── Contratos ─────────────────────────────────────────
        var contratos = app.MapGroup("/api/contratos").WithTags("Contratos").RequireAuthorization("ClinicaOwner");
        contratos.MapGet("/", async (IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.ListContratosAsync(GetClinicaId(ctx));
            return Results.Ok(r.Value);
        });
        contratos.MapPost("/", async (CreateContratoRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.CreateContratoAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/contratos/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
        contratos.MapPut("/{id:guid}", async (Guid id, UpdateContratoRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.UpdateContratoAsync(GetClinicaId(ctx), id, req);
            return r.IsSuccess ? Results.Ok(r.Value) : Results.NotFound();
        });
        contratos.MapDelete("/{id:guid}", async (Guid id, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.DeleteContratoAsync(GetClinicaId(ctx), id);
            return r.IsSuccess ? Results.NoContent() : Results.NotFound();
        });

        // ── WhatsApp Central ──────────────────────────────────
        var wa = app.MapGroup("/api/whatsapp").WithTags("WhatsApp").RequireAuthorization("ClinicaOwner");
        wa.MapGet("/conversas", async (IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.ListConversasAsync(GetClinicaId(ctx));
            return Results.Ok(r.Value);
        });
        wa.MapPost("/conversas", async (CreateWhatsAppConversaRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.CreateConversaAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/whatsapp/conversas/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
        wa.MapGet("/conversas/{id:guid}/mensagens", async (Guid id, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.GetMensagensAsync(GetClinicaId(ctx), id);
            return r.IsSuccess ? Results.Ok(r.Value) : Results.NotFound();
        });
        wa.MapPost("/conversas/{id:guid}/mensagens", async (Guid id, EnviarWhatsAppMensagemRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.EnviarMensagemAsync(GetClinicaId(ctx), id, req);
            return r.IsSuccess ? Results.Ok(r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });

        // ── Injetáveis ────────────────────────────────────────
        var inj = app.MapGroup("/api/injetaveis").WithTags("Injetáveis").RequireAuthorization("ClinicaOwner");
        inj.MapGet("/", async (IModulosService svc, HttpContext ctx, Guid? pacienteId) =>
        {
            var r = await svc.ListPlanosAsync(GetClinicaId(ctx), pacienteId);
            return Results.Ok(r.Value);
        });
        inj.MapPost("/", async (CreatePlanoInjetavelRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.CreatePlanoAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/injetaveis/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
        inj.MapPut("/{id:guid}", async (Guid id, UpdatePlanoInjetavelRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.UpdatePlanoAsync(GetClinicaId(ctx), id, req);
            return r.IsSuccess ? Results.Ok(r.Value) : Results.NotFound();
        });
        inj.MapDelete("/{id:guid}", async (Guid id, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.DeletePlanoAsync(GetClinicaId(ctx), id);
            return r.IsSuccess ? Results.NoContent() : Results.NotFound();
        });

        // ── Telemedicina ──────────────────────────────────────
        var tele = app.MapGroup("/api/telemedicina").WithTags("Telemedicina").RequireAuthorization("ClinicaOwner");
        tele.MapGet("/", async (IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.ListTeleconsultasAsync(GetClinicaId(ctx));
            return Results.Ok(r.Value);
        });
        tele.MapPost("/", async (CreateTeleconsultaRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.CreateTeleconsultaAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/telemedicina/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
        tele.MapPut("/{id:guid}/status", async (Guid id, StatusBody body, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.UpdateStatusTeleconsultaAsync(GetClinicaId(ctx), id, body.Status);
            return r.IsSuccess ? Results.Ok(r.Value) : Results.NotFound();
        });

        // ── Financeiro ────────────────────────────────────────
        var fin = app.MapGroup("/api/financeiro").WithTags("Financeiro").RequireAuthorization("ClinicaOwner");
        fin.MapGet("/lancamentos", async (IModulosService svc, HttpContext ctx, DateTime? inicio, DateTime? fim) =>
        {
            var r = await svc.ListLancamentosAsync(GetClinicaId(ctx), inicio, fim);
            return Results.Ok(r.Value);
        });
        fin.MapGet("/resumo", async (IModulosService svc, HttpContext ctx, DateTime? inicio, DateTime? fim) =>
        {
            var r = await svc.ResumoFinanceiroAsync(GetClinicaId(ctx), inicio, fim);
            return Results.Ok(r.Value);
        });
        fin.MapPost("/lancamentos", async (CreateLancamentoRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.CreateLancamentoAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/financeiro/lancamentos/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
        fin.MapDelete("/lancamentos/{id:guid}", async (Guid id, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.DeleteLancamentoAsync(GetClinicaId(ctx), id);
            return r.IsSuccess ? Results.NoContent() : Results.NotFound();
        });

        // ── Vendas ────────────────────────────────────────────
        var vendas = app.MapGroup("/api/vendas").WithTags("Vendas").RequireAuthorization("ClinicaOwner");
        vendas.MapGet("/", async (IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.ListVendasAsync(GetClinicaId(ctx));
            return Results.Ok(r.Value);
        });
        vendas.MapPost("/", async (CreateVendaRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.CreateVendaAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/vendas/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
        vendas.MapPut("/{id:guid}/pagar", async (Guid id, PagarBody? body, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.PagarVendaAsync(GetClinicaId(ctx), id, body?.FormaPagamento);
            return r.IsSuccess ? Results.Ok(r.Value) : Results.NotFound();
        });
        vendas.MapDelete("/{id:guid}", async (Guid id, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.DeleteVendaAsync(GetClinicaId(ctx), id);
            return r.IsSuccess ? Results.NoContent() : Results.NotFound();
        });

        // ── Estoque ───────────────────────────────────────────
        var estoque = app.MapGroup("/api/estoque").WithTags("Estoque").RequireAuthorization("ClinicaOwner");
        estoque.MapGet("/produtos", async (IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.ListProdutosAsync(GetClinicaId(ctx));
            return Results.Ok(r.Value);
        });
        estoque.MapPost("/produtos", async (CreateProdutoEstoqueRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.CreateProdutoAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/estoque/produtos/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
        estoque.MapPut("/produtos/{id:guid}", async (Guid id, UpdateProdutoEstoqueRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.UpdateProdutoAsync(GetClinicaId(ctx), id, req);
            return r.IsSuccess ? Results.Ok(r.Value) : Results.NotFound(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
        estoque.MapDelete("/produtos/{id:guid}", async (Guid id, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.DeleteProdutoAsync(GetClinicaId(ctx), id);
            return r.IsSuccess ? Results.NoContent() : Results.NotFound();
        });
        estoque.MapPost("/movimentacoes", async (CreateMovimentacaoRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.MovimentarEstoqueAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Ok(r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
        estoque.MapGet("/movimentacoes", async (IModulosService svc, HttpContext ctx, Guid? produtoId) =>
        {
            var r = await svc.ListMovimentacoesAsync(GetClinicaId(ctx), produtoId);
            return Results.Ok(r.Value);
        });

        // ── Notas fiscais ─────────────────────────────────────
        var notas = app.MapGroup("/api/notas").WithTags("Notas Fiscais").RequireAuthorization("ClinicaOwner");
        notas.MapGet("/", async (IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.ListNotasAsync(GetClinicaId(ctx));
            return Results.Ok(r.Value);
        });
        notas.MapPost("/emitir", async (CreateNotaFiscalRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.EmitirNotaAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/notas/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });

        // ── Transcrições ──────────────────────────────────────
        var trans = app.MapGroup("/api/transcricoes").WithTags("Transcrições").RequireAuthorization("ClinicaOwner");
        trans.MapGet("/", async (IModulosService svc, HttpContext ctx, Guid? pacienteId) =>
        {
            var r = await svc.ListTranscricoesAsync(GetClinicaId(ctx), pacienteId);
            return Results.Ok(r.Value);
        });
        trans.MapPost("/", async (CreateTranscricaoRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.CreateTranscricaoAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/transcricoes/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });

        // ── Portal paciente ───────────────────────────────────
        var portal = app.MapGroup("/api/portal").WithTags("Portal Paciente");
        portal.MapGet("/", async (IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.ListPortalAsync(GetClinicaId(ctx));
            return Results.Ok(r.Value);
        }).RequireAuthorization("ClinicaOwner");
        portal.MapPost("/", async (CreatePortalAcessoRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.CreatePortalAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/portal/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        }).RequireAuthorization("ClinicaOwner");
        portal.MapGet("/acesso/{token}", async (string token, IModulosService svc) =>
        {
            var r = await svc.GetPortalByTokenAsync(token);
            return r.IsSuccess ? Results.Ok(r.Value) : Results.NotFound(string.Join("; ", r.Errors.Select(e => e.Message)));
        }).AllowAnonymous();

        // ── Avaliação facial IA ───────────────────────────────
        var facial = app.MapGroup("/api/avaliacao-facial").WithTags("Avaliação Facial IA").RequireAuthorization("ClinicaOwner");
        facial.MapGet("/", async (IModulosService svc, HttpContext ctx, Guid? pacienteId) =>
        {
            var r = await svc.ListAvaliacoesAsync(GetClinicaId(ctx), pacienteId);
            return Results.Ok(r.Value);
        });
        facial.MapPost("/", async (CreateAvaliacaoFacialRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.CreateAvaliacaoAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/avaliacao-facial/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });

        // ── Tarefas IA ────────────────────────────────────────
        var tarefas = app.MapGroup("/api/tarefas").WithTags("Tarefas IA").RequireAuthorization("ClinicaOwner");
        tarefas.MapGet("/", async (IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.ListTarefasAsync(GetClinicaId(ctx));
            return Results.Ok(r.Value);
        });
        tarefas.MapPost("/", async (CreateTarefaIaRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.CreateTarefaAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Created($"/api/tarefas/{r.Value.Id}", r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
        tarefas.MapPost("/sugerir-ia", async (IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.SugerirTarefasIaAsync(GetClinicaId(ctx));
            return Results.Ok(r.Value);
        });
        tarefas.MapPut("/{id:guid}", async (Guid id, UpdateTarefaIaRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.UpdateTarefaAsync(GetClinicaId(ctx), id, req);
            return r.IsSuccess ? Results.Ok(r.Value) : Results.NotFound();
        });
        tarefas.MapDelete("/{id:guid}", async (Guid id, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.DeleteTarefaAsync(GetClinicaId(ctx), id);
            return r.IsSuccess ? Results.NoContent() : Results.NotFound();
        });

        // ── Agente de textos IA ───────────────────────────────
        var textos = app.MapGroup("/api/ia/textos").WithTags("Agente IA Textos").RequireAuthorization("ClinicaOwner");
        textos.MapGet("/", async (IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.ListTextosAsync(GetClinicaId(ctx));
            return Results.Ok(r.Value);
        });
        textos.MapPost("/gerar", async (GerarTextoIaRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.GerarTextoAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Ok(r.Value) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
        textos.MapPost("/enviar", async (EnviarTextoIaRequest req, IModulosService svc, HttpContext ctx) =>
        {
            var r = await svc.EnviarTextoAsync(GetClinicaId(ctx), req);
            return r.IsSuccess ? Results.Ok(new { message = "Mensagem enviada com sucesso" }) : Results.BadRequest(string.Join("; ", r.Errors.Select(e => e.Message)));
        });
    }

    private record StatusBody(string Status);
    private record PagarBody(string? FormaPagamento);
}
