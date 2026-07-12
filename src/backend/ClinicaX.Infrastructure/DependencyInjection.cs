using ClinicaX.Application.Interfaces;
using ClinicaX.Application.Services;
using ClinicaX.Infrastructure.Caching;
using ClinicaX.Infrastructure.Jobs;
using ClinicaX.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Quartz;

namespace ClinicaX.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration? configuration = null)
    {
        services.AddHttpClient();

        // Cache: Redis se ConnectionStrings:Redis estiver configurado; senão MemoryCache (dev local)
        var redis = configuration?.GetConnectionString("Redis");
        if (!string.IsNullOrWhiteSpace(redis))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redis;
                options.InstanceName = "ClinicaX:";
            });
        }
        else
        {
            services.AddDistributedMemoryCache();
        }
        services.AddSingleton<ICacheService, CacheService>();

        services.AddScoped<IWhatsAppService>(sp =>
        {
            var config = sp.GetRequiredService<IConfiguration>();
            var modoReal = config.GetSection("WhatsApp")["ModoReal"] == "true";
            if (modoReal)
            {
                var httpClientFactory = sp.GetRequiredService<IHttpClientFactory>();
                var httpClient = httpClientFactory.CreateClient();
                return ActivatorUtilities.CreateInstance<WhatsAppCloudApiService>(sp, httpClient);
            }
            return ActivatorUtilities.CreateInstance<WhatsAppSimuladoService>(sp);
        });

        services.AddScoped<INotificationDispatcher, NotificationDispatcher>();
        services.AddScoped<ITextSenderService, TextSenderService>();

        services.AddQuartz(q =>
        {
            var jobKey = new JobKey("LembreteJob");
            q.AddJob<LembreteJob>(opts => opts.WithIdentity(jobKey));
            q.AddTrigger(opts => opts
                .ForJob(jobKey)
                .WithIdentity("LembreteJob-trigger")
                .WithCronSchedule("0 */30 * * * ?"));
        });
        services.AddQuartzHostedService();

        return services;
    }
}
