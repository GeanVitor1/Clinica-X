using System.Text.Json;
using ClinicaX.Application.Services;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace ClinicaX.Infrastructure.Caching;

public class CacheService : ICacheService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly IDistributedCache _cache;
    private readonly ILogger<CacheService> _logger;
    private readonly TimeSpan _defaultTtl = TimeSpan.FromMinutes(2);

    public CacheService(IDistributedCache cache, ILogger<CacheService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        try
        {
            var bytes = await _cache.GetAsync(key, ct);
            if (bytes is null || bytes.Length == 0) return default;
            return JsonSerializer.Deserialize<T>(bytes, JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao ler cache key={Key}", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken ct = default)
    {
        try
        {
            var bytes = JsonSerializer.SerializeToUtf8Bytes(value, JsonOptions);
            await _cache.SetAsync(key, bytes, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl ?? _defaultTtl
            }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao gravar cache key={Key}", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        try
        {
            await _cache.RemoveAsync(key, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao remover cache key={Key}", key);
        }
    }

    public async Task<T> GetOrCreateAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan? ttl = null, CancellationToken ct = default)
    {
        var cached = await GetAsync<T>(key, ct);
        if (cached is not null)
            return cached;

        var value = await factory(ct);
        if (value is not null)
            await SetAsync(key, value, ttl, ct);
        return value;
    }
}
