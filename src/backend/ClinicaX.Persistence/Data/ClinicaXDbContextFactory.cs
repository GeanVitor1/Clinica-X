using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ClinicaX.Persistence.Data;

public class ClinicaXDbContextFactory : IDesignTimeDbContextFactory<ClinicaXDbContext>
{
    public ClinicaXDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ClinicaXDbContext>();
        optionsBuilder.UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=ClinicaX;Trusted_Connection=True;MultipleActiveResultSets=true;Encrypt=False");
        return new ClinicaXDbContext(optionsBuilder.Options);
    }
}
