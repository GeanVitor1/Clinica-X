using System.Security.Claims;

namespace ClinicaX.API.Endpoints;

public static class EndpointHelpers
{
    public static Guid GetClinicaId(HttpContext ctx)
    {
        var claim = ctx.User.FindFirst("ClinicaId")?.Value;
        return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
    }
}
