using ClinicaX.Identity.Models;

namespace ClinicaX.Identity.Services;

public interface IJwtService
{
    string GenerateToken(ClinicaOwner user);
}
