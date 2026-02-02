# 🎬 Real Estate Video Generator

App completo para criar vídeos profissionais de anúncios de imóveis com IA.

## ✨ Funcionalidades

- 📸 **Upload de Imagens** - Arraste e solte múltiplas imagens do imóvel
- 🎵 **Seleção de Música** - Biblioteca de músicas pré-definidas
- ✍️ **Texto do Anúncio** - Campo para descrever o imóvel
- 🔊 **Narração por IA** - Geração automática de áudio com TTS (OpenAI/ElevenLabs)
- 📝 **Legendas Automáticas** - Sincronizadas com a narração
- 🎬 **Preview em Tempo Real** - Veja como ficará antes de gerar
- ⬇️ **Download do Vídeo** - Renderização com Remotion

## 🏗️ Estrutura do Projeto

```
real-estate-video-app/
├── frontend/                    # Next.js 14 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── upload/       # Upload de imagens
│   │   │   │   ├── video/        # Geração de vídeo
│   │   │   │   └── tts/          # Text-to-Speech
│   │   │   └── editor/
│   │   │       └── page.tsx      # Editor principal
│   │   ├── components/
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── MusicSelector.tsx
│   │   │   ├── TextInput.tsx
│   │   │   ├── NarrationToggle.tsx
│   │   │   └── VideoPreview.tsx
│   │   ├── hooks/
│   │   │   └── useVideoGenerator.ts
│   │   └── types/
│   │       └── index.ts
│   └── package.json
│
├── backend/                     # Node.js API (opcional)
│   └── src/
│       ├── services/
│       │   ├── ttsService.ts
│       │   ├── remotionService.ts
│       │   └── storageService.ts
│       └── routes/
│
├── remotion-templates/          # Templates Remotion
│   ├── src/
│   │   ├── Root.tsx
│   │   └── templates/
│   │       └── DynamicVideo.tsx
│   └── package.json
│
├── shared/                      # Tipos compartilhados
│   └── types/
│       └── index.ts
│
└── PROJECT_PLAN.md
```

## 🚀 Como Executar

### 1. Instalar dependências do Frontend

```bash
cd frontend
npm install
```

### 2. Instalar dependências do Remotion

```bash
cd remotion-templates
npm install
```

### 3. Executar o Frontend

```bash
cd frontend
npm run dev
```

Acesse: http://localhost:3000/editor

### 4. Executar o Servidor de Renderização (opcional)

```bash
cd remotion-templates
npm run dev
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` no diretório `frontend/`:

```env
# OpenAI TTS (para narração)
OPENAI_API_KEY=your_openai_api_key

# ElevenLabs (alternativo, melhor qualidade)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Supabase (para banco de dados e storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage
STORAGE_BUCKET=uploads
```

## 📦 Tecnologias

| Área | Tecnologia |
|------|------------|
| Frontend | Next.js 14 + React 18 |
| UI | Tailwind CSS + Framer Motion |
| Icons | Lucide React |
| TTS | OpenAI TTS / ElevenLabs |
| Vídeo | Remotion |
| State | Zustand |
| DB | Supabase (PostgreSQL) |

## 🎨 Fluxo do Usuário

```
1. Upload de Imagens (drag & drop)
         │
         ▼
2. Selecionar Música (preview disponível)
         │
         ▼
3. Escrever Texto do Anúncio
         │
         ▼
4. (Opcional) Habilitar Narração IA
         │
         ▼
5. Visualizar Preview
         │
         ▼
6. Gerar Vídeo
         │
         ▼
7. Download
```

## 🎬 Geração de Vídeo

O processo de geração do vídeo:

1. **Upload das Imagens** → Servidor processa e retorna URLs
2. **Geração de TTS** → Se narração ativada, gera áudio com IA
3. **Criação de Legendas** → Texto dividido e sincronizado
4. **Renderização Remotion** → Compila tudo em vídeo MP4
5. **Download** → Retorna URL do vídeo gerado

## 📱 Interface

A interface inclui:
- ✅ Design moderno com glassmorphism
- ✅ Preview em tempo real do vídeo
- ✅ Drag & drop para imagens
- ✅ Preview de áudio das músicas
- ✅ Seleção de vozes TTS
- ✅ Barra de progresso da geração
- ✅ Feedback visual em tempo real

## 🔜 Próximos Passos

- [ ] Integrar OpenAI TTS real
- [ ] Integrar ElevenLabs para vozes premium
- [ ] Adicionar banco de dados Supabase
- [ ] Implementar sistema de autenticação
- [ ] Adicionar mais templates de vídeo
- [ ] Implementar cache de vídeos gerados
- [ ] Adicionar compartilhamento direto para redes sociais

## 📄 Licença

MIT
