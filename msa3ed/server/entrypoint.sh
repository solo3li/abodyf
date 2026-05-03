#!/bin/bash
set -e

# --- Start ASP.NET Core App ---
echo "Starting Uis.Server on port ${PORT:-80}..."
export ASPNETCORE_URLS="http://+:${PORT:-80}"

exec dotnet Uis.Server.dll
