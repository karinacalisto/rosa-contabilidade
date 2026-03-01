#!/bin/bash
# Build completo: Angular + .NET publish para deploy
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Passo 1: Build Angular ==="
bash "$SCRIPT_DIR/build-angular.sh"

echo "=== Passo 2: Publish .NET ==="
cd "$ROOT_DIR/RosaContabilidade.Api"
export PATH="$HOME/.dotnet:$PATH"
dotnet publish -c Release -o "$ROOT_DIR/publish"

echo "=== Publish concluído! ==="
echo "Artefatos prontos em: $ROOT_DIR/publish"
echo ""
echo "Para deploy no IIS/Locaweb:"
echo "  1. Envie o conteúdo de $ROOT_DIR/publish via FTP/FTPS"
echo "  2. Configure a connection string no appsettings.Production.json"
echo "  3. Configure a pasta de uploads"
echo "  4. Reinicie o site no IIS"
