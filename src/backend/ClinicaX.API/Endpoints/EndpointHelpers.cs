using System.Security.Claims;

namespace ClinicaX.API.Endpoints;

public static class EndpointHelpers
{
    /// <summary>
    /// Obtém o ClinicaId do JWT. Retorna null se o claim estiver ausente/inválido (caller deve responder 401).
    /// </summary>
    public static Guid? TryGetClinicaId(HttpContext ctx)
    {
        var claim = ctx.User.FindFirst("ClinicaId")?.Value
            ?? ctx.User.FindFirstValue("ClinicaId");
        return Guid.TryParse(claim, out var id) && id != Guid.Empty ? id : null;
    }

    /// <summary>ClinicaId obrigatório do JWT. Lança se ausente — use RequireClinicaId para IResult.</summary>
    public static Guid GetClinicaId(HttpContext ctx)
    {
        var id = TryGetClinicaId(ctx);
        if (id is null)
            throw new UnauthorizedAccessException("Token sem ClinicaId válido.");
        return id.Value;
    }

    public static IResult? RequireClinicaId(HttpContext ctx, out Guid clinicaId)
    {
        var id = TryGetClinicaId(ctx);
        if (id is null)
        {
            clinicaId = Guid.Empty;
            return Results.Unauthorized();
        }
        clinicaId = id.Value;
        return null;
    }
}
