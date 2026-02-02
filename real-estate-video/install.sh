#!/bin/bash

# Script de instalação do Real Estate Video Generator
# Execute este script para instalar as dependências

echo "🎬 Real Estate Video Generator - Instalação"
echo "=============================================="

cd "$(dirname "$0")"

# Limpar configurações problemáticas do npm
npm config delete registry 2>/dev/null
npm config delete //registry.npmjs.org/:_authToken 2>/dev/null

echo ""
echo "📦 Instalando dependências..."
echo ""

# Instalar dependências
npm install

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "Para iniciar o servidor de preview:"
echo "  npm run dev"
echo ""
echo "Para renderizar um vídeo:"
echo "  npm run build -- --compositionId=property-showcase --output=video.mp4"
echo ""
