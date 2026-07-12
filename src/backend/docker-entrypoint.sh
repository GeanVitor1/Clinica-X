#!/bin/sh
set -e

PORT="${PORT:-8080}"
export ASPNETCORE_URLS="http://0.0.0.0:${PORT}"

# Pasta persistente (SQLite + jwt.key). No Railway, monte um Volume em /app/data se quiser manter dados entre deploys.
mkdir -p /app/data
chmod 777 /app/data 2>/dev/null || true

echo "[ClinicaX] Starting on ${ASPNETCORE_URLS} env=${ASPNETCORE_ENVIRONMENT:-Production}"

exec dotnet ClinicaX.API.dll
