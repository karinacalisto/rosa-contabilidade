#!/bin/bash
# Build Angular e copiar para wwwroot do projeto .NET
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CLIENT_DIR="$ROOT_DIR/client-app"
WWWROOT_DIR="$ROOT_DIR/RosaContabilidade.Api/wwwroot"

echo "=== Build Angular ==="
cd "$CLIENT_DIR"
npm ci
npx ng build --configuration=production

echo "=== Copiando para wwwroot ==="
rm -rf "$WWWROOT_DIR"
mkdir -p "$WWWROOT_DIR"
cp -r "$CLIENT_DIR/dist/client-app/browser/"* "$WWWROOT_DIR/"

echo "=== Build Angular concluído! ==="
echo "Arquivos copiados para: $WWWROOT_DIR"
ls -la "$WWWROOT_DIR"
