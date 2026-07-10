FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY ClinicaX.slnx .
COPY ClinicaX.Domain/*.csproj ClinicaX.Domain/
COPY ClinicaX.Application/*.csproj ClinicaX.Application/
COPY ClinicaX.Persistence/*.csproj ClinicaX.Persistence/
COPY ClinicaX.Identity/*.csproj ClinicaX.Identity/
COPY ClinicaX.Infrastructure/*.csproj ClinicaX.Infrastructure/
COPY ClinicaX.API/*.csproj ClinicaX.API/
RUN dotnet restore ClinicaX.API/ClinicaX.API.csproj

COPY . .
RUN dotnet publish ClinicaX.API/ClinicaX.API.csproj -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "ClinicaX.API.dll"]
