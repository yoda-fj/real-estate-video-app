## Tarefa: Continuar Desenvolvimento RS-Video App

O usuário está configurando o Supabase manualmente. Enquanto isso, continue o desenvolvimento do projeto preparando:

### 1. Backend API
Criar endpoints em `/backend/src/routes/`:
- `script.ts` - Geração de script com MiniMax
- `tts.ts` - Text-to-speech com OpenAI
- `upload.ts` - Upload de imagens para Supabase Storage
- `video.ts` - Controle de renderização com Remotion

### 2. Integração MiniMax
- Configurar cliente MiniMax
- Criar função para gerar script de vídeo imobiliário
- Parâmetros: descrição do imóvel, público-alvo, estilo

### 3. TTS (Text-to-Speech)
- Implementar com OpenAI TTS (mais barato)
- Opção alternativa ElevenLabs (melhor qualidade)
- Suportar múltiplas vozes

### 4. Remotion Setup
- Configurar template de vídeo em `/remotion-templates/`
- Criar componente `RealEstateVideo` que recebe:
  - Array de imagens
  - Áudio de narração
  - Música de fundo
  - Legendas
- Configurar renderização via Lambda (opcional) ou local

### 5. Frontend Updates
- Conectar editor ao backend
- Implementar preview real do vídeo
- Status de progresso da renderização

### 6. Environment
Atualizar `.env.local.example` com todas as novas variáveis necessárias.

### Checklist antes de terminar:
- [ ] Backend estruturado com rotas
- [ ] MiniMax client configurado
- [ ] TTS service implementado
- [ ] Remotion template criado
- [ ] Integração frontend-backend funcional (mock se necessário)
- [ ] Documentação atualizada

**Importante:** O Supabase ainda não está configurado, então use mocks onde necessário, mas deixe o código pronto para quando as credenciais estiverem disponíveis.

Quando terminar, pingue o agente principal com um resumo do que foi implementado.
