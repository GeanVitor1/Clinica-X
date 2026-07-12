#!/bin/sh
set -e

# Railway define PORT dinamicamente
PORT="${PORT:-8080}"
export ASPNETCORE_URLS="http://0.0.0.0:${PORT}"

echo "[ClinicaX] Starting API on ${ASPNETCORE_URLS} (env=${ASPNETCORE_ENVIRONMENT:-Production})"

exec dotnet ClinicaX.API.dll
