using System.Text;
using ClinicaX.Application.Services;
using ClinicaX.Identity.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace ClinicaX.Identity;

public static class DependencyInjection
{
    public static IServiceCollection AddIdentityAuth(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtKey = configuration["Jwt:Key"]!;
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
            };

            // SignalR envia o JWT via query string access_token
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hub"))
                        context.Token = accessToken;
                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("ClinicaOwner", policy =>
                policy.RequireRole("ClinicaOwner"));
        });

        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
