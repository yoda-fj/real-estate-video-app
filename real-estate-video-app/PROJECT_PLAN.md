# 🎬 Real Estate Video Generator - Planejamento Completo

## 📋 Visão Geral do Projeto

Sistema completo para criação automática de vídeos de anúncios de imóveis com:
- Upload de imagens pelo usuário
- Seleção de música de uma biblioteca
- Texto para legendas e narração
- Narração por IA (TTS)
- Geração de vídeo com Remotion

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Upload    │  │    Editor   │  │   Preview Player    │  │
│  │   Images    │  │   Config    │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  /api/      │  │  /api/      │  │   /api/video/       │  │
│  │  upload     │  │  musics     │  │   generate          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌────────────┐  ┌─────────────┐  ┌──────────────┐
     │  Storage   │  │    TTS      │  │   Remotion   │
     │  (S3/Local)│  │  Service    │  │   Renderer   │
     └────────────┘  └─────────────┘  └──────────────┘
```

## 📁 Estrutura de Diretórios

```
real-estate-video-app/
├── frontend/                    # Next.js App
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── editor/
│   │   │   │   └── page.tsx     # Editor principal
│   │   │   ├── api/
│   │   │   │   ├── upload/
│   │   │   │   │   └── route.ts # Upload de imagens
│   │   │   │   ├── musics/
│   │   │   │   │   └── route.ts # Lista de músicas
│   │   │   │   └── video/
│   │   │   │       └── route.ts # Geração de vídeo
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── MusicSelector.tsx
│   │   │   ├── TextInput.tsx
│   │   │   ├── NarrationToggle.tsx
│   │   │   ├── VideoPreview.tsx
│   │   │   └── VideoPlayer.tsx
│   │   ├── hooks/
│   │   │   └── useVideoGenerator.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── lib/
│   │       ├── api.ts
│   │       └── utils.ts
│   ├── public/
│   │   └── musicas/             # Músicas disponíveis
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                     # Node.js API (opcional)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── videoController.ts
│   │   │   └── ttsController.ts
│   │   ├── services/
│   │   │   ├── remotionService.ts
│   │   │   ├── ttsService.ts
│   │   │   └── storageService.ts
│   │   ├── routes/
│   │   │   ├── video.ts
│   │   │   └── tts.ts
│   │   └── index.ts
│   └── package.json
│
├── shared/                      # Código compartilhado
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── videoUtils.ts
│
└── remotion-templates/          # Templates Remotion
    ├── src/
    │   ├── index.tsx
    │   ├── Root.tsx
    │   └── templates/
    │       ├── PropertyShowcase.tsx
    │       └── DynamicVideo.tsx
    └── package.json
```

## 📊 Database Schema (Supabase/PostgreSQL)

```sql
-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Configurações de Vídeo
CREATE TABLE video_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- draft, processing, completed, failed
    narration_enabled BOOLEAN DEFAULT true,
    selected_music_id UUID,
    generated_video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Imagens do Projeto
CREATE TABLE project_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES video_projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    duration INTEGER DEFAULT 3000, -- milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Músicas Disponíveis
CREATE TABLE musics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    duration INTEGER NOT NULL, -- milliseconds
    url TEXT NOT NULL,
    category VARCHAR(100),
    bpm INTEGER,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Legendas Geradas
CREATE TABLE captions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES video_projects(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    start_time INTEGER NOT NULL, -- milliseconds
    end_time INTEGER NOT NULL,
    style VARCHAR(100) DEFAULT 'default'
);

-- Tabela de Narração Gerada
CREATE TABLE narrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES video_projects(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    text TEXT NOT NULL,
    voice VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Configurações de Estilo
CREATE TABLE video_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    font VARCHAR(100),
    primary_color VARCHAR(20),
    secondary_color VARCHAR(20),
    caption_style JSONB,
    transition_type VARCHAR(50),
    template_id VARCHAR(100)
);
```

## 🔌 APIs Necessárias

### Frontend → Backend

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/upload` | Upload de imagens |
| GET | `/api/musics` | Lista de músicas disponíveis |
| POST | `/api/video/generate` | Iniciar geração de vídeo |
| GET | `/api/video/:id/status` | Status da renderização |
| GET | `/api/video/:id/download` | Baixar vídeo gerado |
| POST | `/api/tts/preview` | Preview de narração TTS |

### Payload Examples

```typescript
// POST /api/video/generate
interface GenerateVideoRequest {
  projectId?: string;
  images: Array<{
    url: string;
    duration?: number; // ms
  }>;
  text: string;
  musicId: string;
  narrationEnabled: boolean;
  ttsVoice?: string;
  captionStyle?: CaptionStyle;
  templateId?: string;
}

interface GenerateVideoResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedTime?: number; // seconds
}
```

## 🎨 Componentes do Frontend

### ImageUploader.tsx
```typescript
interface ImageUploaderProps {
  maxImages?: number;
  onImagesSelected: (files: File[]) => void;
  onImageReorder: (order: string[]) => void;
  existingImages?: Array<{id: string; url: string}>;
}

// Features:
// - Drag and drop
// - Preview de thumbnails
// - Reordenar por drag
// - Definir duração de cada imagem
```

### MusicSelector.tsx
```typescript
interface MusicSelectorProps {
  musics: Music[];
  selectedMusicId: string;
  onSelect: (id: string) => void;
  onPreview: (id: string) => void;
  duration: number; // Duração necessária do vídeo

// Features:
// - Preview de 30s de cada música
// - Filtro por categoria/mood
// - Indicação se a música é longa o suficiente
```

### TextInput.tsx
```typescript
interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerateCaptions: () => void;
  maxLength?: number;
  placeholder?: string;
```

### NarrationToggle.tsx
```typescript
interface NarrationToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  voice?: string;
  onVoiceChange?: (voice: string) => void;
  onPreview?: () => void;
```

## 🔊 Serviço de TTS (Narração)

### Opções de TTS

```typescript
// src/backend/services/ttsService.ts

interface TTSProvider {
  name: string;
  voices: Array<{
    id: string;
    name: string;
    gender: 'male' | 'female';
    language: string;
  }>;
  synthesize(text: string, voiceId: string): Promise<Buffer>;
  getPreviewUrl(text: string, voiceId: string): Promise<string>;
}

// Implementações disponíveis:
const TTS_PROVIDERS = {
  azure: {
    name: 'Azure Speech',
    apiKey: process.env.AZURE_SPEECH_KEY,
    region: process.env.AZURE_SPEECH_REGION,
  },
  google: {
    name: 'Google Cloud TTS',
    apiKey: process.env.GOOGLE_TTS_KEY,
  },
  elevenlabs: {
    name: 'ElevenLabs',
    apiKey: process.env.ELEVENLABS_API_KEY,
    // Melhor qualidade, vozes realistas
  },
  openai: {
    name: 'OpenAI TTS',
    model: 'tts-1' | 'tts-1-hd',
    voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
  },
};
```

### Função de Geração de Narração

```typescript
async function generateNarration(
  text: string,
  options: {
    provider: 'azure' | 'google' | 'elevenlabs' | 'openai';
    voiceId: string;
    speed?: number; // 0.5 a 2.0
    pitch?: number;
  }
): Promise<{ audioUrl: string; duration: number }> {
  // Dividir texto em frases para melhor síntese
  const sentences = splitIntoSentences(text);

  // Gerar áudio para cada frase
  const audioChunks = await Promise.all(
    sentences.map(sentence =>
      ttsProvider.synthesize(sentence, options.voiceId)
    )
  );

  // Concatenar áudios
  const combinedAudio = await concatenateAudio(audioChunks);

  // Retornar URL do áudio
  return {
    audioUrl: await uploadToStorage(combinedAudio),
    duration: getAudioDuration(combinedAudio),
  };
}
```

## 🎬 Templates Remotion

### DynamicVideo.tsx

```typescript
interface DynamicVideoProps {
  images: Array<{
    url: string;
    duration: number;
  }>;
  captions: Array<{
    text: string;
    startTime: number;
    endTime: number;
  }>;
  narrationAudio?: string;
  musicUrl: string;
  style: VideoStyle;
}

export const DynamicVideo: React.FC<DynamicVideoProps> = ({
  images,
  captions,
  narrationAudio,
  musicUrl,
  style,
}) => {
  const { fps } = useVideoConfig();
  const totalDuration = images.reduce((acc, img) => acc + img.duration, 0);

  return (
    <AbsoluteFill>
      {/* Background Music */}
      <Audio src={musicUrl} />

      {/* Narration Audio (if enabled) */}
      {narrationAudio && <Audio src={narrationAudio} />}

      {/* Image Slides */}
      {images.map((image, index) => (
        <Sequence
          key={index}
          from={getImageStartTime(images, index)}
          duration={image.duration}
        >
          <Img src={image.url} />
          <TransitionOverlay type={style.transition} />
        </Sequence>
      ))}

      {/* Captions Layer */}
      <CaptionsLayer
        captions={captions}
        style={style.captionStyle}
      />
    </AbsoluteFill>
  );
};
```

### Sistema de Legendas

```typescript
interface CaptionStyle {
  font: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  position: 'bottom' | 'center' | 'top';
  animation: 'fade' | 'slide' | 'typewriter';
}

function CaptionsLayer({ captions, style }: CaptionStyleProps) {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {captions.map((caption, index) => (
        <Sequence
          key={index}
          from={caption.startTime / 1000}
          duration={(caption.endTime - caption.startTime) / 1000}
        >
          <AnimatedCaption text={caption.text} style={style} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
```

## 📦 Fluxo de Criação de Vídeo

```
1. Usuário entra na página
         │
         ▼
2. Faz upload de imagens (drag & drop)
         │
         ▼
3. Seleciona música da biblioteca
         │
         ▼
4. Escreve o texto do anúncio
         │
         ▼
5. (Opcional) Habilita narração e seleciona voz
         │
         ▼
6. Visualiza preview rápido (opcional)
         │
         ▼
7. Clica em "Gerar Vídeo"
         │
         ▼
8. Sistema:
   - Se narração ativada: Gera áudio TTS
   - Gera legendas sincronizadas
   - Renderiza vídeo com Remotion
         │
         ▼
9. Retorna link para download
```

## 🛠️ Tecnologias Recomendadas

| Área | Tecnologia | Justificativa |
|------|------------|---------------|
| Frontend | Next.js 14 | App Router, Server Components |
| UI | Tailwind CSS + shadcn/ui | Design rápido, components |
| Backend | Next.js API Routes | Serverless, integrado |
| Database | Supabase | Postgres + Storage + Auth |
| Storage | Supabase Storage ou S3 | Guardar imagens e vídeos |
| TTS | OpenAI TTS ou ElevenLabs | Qualidade, vozes naturais |
| Video | Remotion | Programático, controle total |
| Queue | Redis + Bull | Processamento assíncrono |
| Auth | Supabase Auth | Login social e email |

## 🚀 Próximos Passos para Implementação

1. **Setup Inicial**
   ```bash
   npx create-next-app@latest real-estate-video-app
   cd real-estate-video-app
   npm install @remotion/react @remotion/cli framer-motion lucide-react
   ```

2. **Criar Componentes Base**
   - ImageUploader com drag & drop
   - MusicSelector com preview
   - Editor de texto com preview de legendas

3. **Integrar TTS**
   - Configurar OpenAI ou ElevenLabs
   - Criar endpoint de preview
   - Gerar áudio baseado no texto

4. **Implementar Remotion Templates**
   - DynamicVideo com slides
   - Sistema de legendas
   - Sincronização com áudio

5. **Backend & Queue**
   - Configurar Supabase
   - Implementar queue para renderização
   - Webhooks para completion

6. **UI/UX**
   - Landing page
   - Dashboard de projetos
   - Player de vídeo customizado

## 📝 Notas Importantes

- **Duração do vídeo**: Calculada automaticamente baseada nas imagens e narração
- **Sincronização**: Legendas aparecem em paralelo com a narração
- **Música**: Faz loop se for mais curta que o vídeo
- **Fallback**: Se TTS falhar, usar só legendas
- **Caching**: Cache de áudios TTS gerados para evitar regeração
