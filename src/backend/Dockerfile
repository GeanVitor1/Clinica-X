# ClinicaX API — Railway / Docker (zero-config: SQLite se não houver connection string)
# Root Directory no Railway: src/backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ClinicaX.slnx ./
COPY ClinicaX.Domain/ClinicaX.Domain.csproj ClinicaX.Domain/
COPY ClinicaX.Application/ClinicaX.Application.csproj ClinicaX.Application/
COPY ClinicaX.Persistence/ClinicaX.Persistence.csproj ClinicaX.Persistence/
COPY ClinicaX.Identity/ClinicaX.Identity.csproj ClinicaX.Identity/
COPY ClinicaX.Infrastructure/ClinicaX.Infrastructure.csproj ClinicaX.Infrastructure/
COPY ClinicaX.API/ClinicaX.API.csproj ClinicaX.API/

RUN dotnet restore ClinicaX.API/ClinicaX.API.csproj

COPY . .
RUN dotnet publish ClinicaX.API/ClinicaX.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
# Defaults seguros para “só dar deploy” (podem ser sobrescritos no painel)
ENV Seed__EnableDemo=true
ENV Cors__AllowAll=true
ENV Cors__AllowVercelPreviews=true

RUN mkdir -p /app/data && chmod 777 /app/data

COPY --from=build /app/publish .
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8080
VOLUME ["/app/data"]

ENTRYPOINT ["/app/docker-entrypoint.sh"]
