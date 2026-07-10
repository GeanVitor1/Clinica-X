using Microsoft.AspNetCore.Identity;

namespace ClinicaX.Identity.Models;

public class ClinicaOwner : IdentityUser
{
    public Guid ClinicaId { get; set; }
}
