using System.Security.Cryptography;
using System.Text;

namespace ClinicaX.API.Hosting;

/// <summary>
/// Defaults zero-config para Railway/Docker: SQLite, JWT persistido e demo seed.
/// </summary>
public static class RuntimeBootstrap
{
    public const string DataDirectory = "data";
    public const string DefaultSqliteFile = "clinicax.db";
    public const string JwtKeyFile = "jwt.key";

    public static void ApplyCloudDefaults(WebApplicationBuilder builder)
    {
        Directory.CreateDirectory(DataDirectory);

        var conn = builder.Configuration.GetConnectionString("DefaultConnection");
        var useSqlite = ShouldUseSqlite(builder.Environment, conn);

        if (useSqlite)
        {
            var sqlitePath = Path.GetFullPath(Path.Combine(DataDirectory, DefaultSqliteFile));
            var sqliteConn = $"Data Source={sqlitePath}";
            builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = sqliteConn,
                ["Database:Provider"] = "Sqlite"
            });
            Console.WriteLine($"[ClinicaX] Provider=Sqlite → {sqlitePath}");
        }
        else
        {
            builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:Provider"] = "SqlServer"
            });
            Console.WriteLine("[ClinicaX] Provider=SqlServer");
        }

        // ── JWT ───────────────────────────────────────────────
        var jwtKey = builder.Configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
        {
            var keyPath = Path.Combine(DataDirectory, JwtKeyFile);
            if (File.Exists(keyPath))
            {
                jwtKey = File.ReadAllText(keyPath).Trim();
                Console.WriteLine("[ClinicaX] Jwt:Key carregada de data/jwt.key");
            }
            else
            {
                jwtKey = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
                File.WriteAllText(keyPath, jwtKey, Encoding.UTF8);
                Console.WriteLine("[ClinicaX] Jwt:Key gerada em data/jwt.key");
            }

            builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = jwtKey,
                ["Jwt:Issuer"] = string.IsNullOrWhiteSpace(builder.Configuration["Jwt:Issuer"])
                    ? "ClinicaX"
                    : builder.Configuration["Jwt:Issuer"],
                ["Jwt:Audience"] = string.IsNullOrWhiteSpace(builder.Configuration["Jwt:Audience"])
                    ? "ClinicaX"
                    : builder.Configuration["Jwt:Audience"]
            });
        }

        // Seed demo default true
        if (string.IsNullOrWhiteSpace(builder.Configuration["Seed:EnableDemo"]))
        {
            builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Seed:EnableDemo"] = "true"
            });
        }

        // CORS aberto na nuvem por padrão
        if (string.IsNullOrWhiteSpace(builder.Configuration["Cors:AllowAll"]))
        {
            builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Cors:AllowAll"] = builder.Environment.IsDevelopment() ? "false" : "true",
                ["Cors:AllowVercelPreviews"] = "true"
            });
        }
    }

    /// <summary>
    /// SQLite quando: sem connection string, LocalDB, placeholder, ou Production sem SQL Server real.
    /// </summary>
    public static bool ShouldUseSqlite(IHostEnvironment env, string? connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
            return true;

        // LocalDB nunca existe no Railway/Linux
        if (connectionString.Contains("localdb", StringComparison.OrdinalIgnoreCase))
            return !env.IsDevelopment(); // em Dev usa LocalDB se configurado; em Prod → SQLite

        // Placeholder
        if (connectionString.Contains("CHANGE", StringComparison.OrdinalIgnoreCase) ||
            connectionString.Contains("YOUR_", StringComparison.OrdinalIgnoreCase))
            return true;

        // Explicit SQLite
        if (connectionString.Contains(".db", StringComparison.OrdinalIgnoreCase) &&
            connectionString.Contains("Data Source=", StringComparison.OrdinalIgnoreCase) &&
            !connectionString.Contains("Initial Catalog=", StringComparison.OrdinalIgnoreCase))
            return true;

        return false;
    }
}
