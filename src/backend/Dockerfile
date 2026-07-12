# ClinicaX API — Railway / Docker
# Build context: src/backend
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

# Railway injeta PORT; default 8080 para Docker local
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /app/publish .
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8080
# Healthcheck: use Railway healthcheckPath=/health (curl nem sempre existe na imagem)

ENTRYPOINT ["/app/docker-entrypoint.sh"]
