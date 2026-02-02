# 🚀 Setup do Supabase - Passo a Passo

## Etapa 1: Criar Conta (2 minutos)

1. Acesse: https://supabase.com
2. Clique em **"Start your project"** ou **"Sign Up"**
3. Faça login com GitHub (mais rápido) ou email
4. Confirme seu email (se usou email)

## Etapa 2: Criar Projeto (1 minuto)

1. No dashboard, clique em **"New project"**
2. Escolha sua organização (padrão: sua conta)
3. Preencha:
   - **Name**: `rs-video-app`
   - **Database Password**: Clique em "Generate a password" (ou crie uma forte)
   - **Region**: Escolha a mais próxima (ex: `US East` se estiver no Brasil)
4. Clique em **"Create new project"**
5. Aguarde 1-2 minutos (vai mostrar "Project is being provisioned")

## Etapa 3: Pegar as Credenciais (30 segundos)

1. Com o projeto criado, clique no ícone de **engrenagem** (Project Settings) na lateral
2. Clique em **"API"** no menu
3. Copie esses valores:
   - `URL` → será o `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → será o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → será o `SUPABASE_SERVICE_ROLE_KEY` (clique em "Reveal" para ver)

## Etapa 4: Criar as Tabelas (1 minuto)

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Cole TODO o conteúdo do arquivo `supabase-setup.sql` (está na pasta do projeto)
4. Clique em **"Run"** (botão verde no canto inferior direito)
5. Pronto! As tabelas foram criadas ✅

## Etapa 5: Configurar Storage (30 segundos)

1. No menu lateral, clique em **"Storage"**
2. Clique em **"New bucket"**
3. Nome: `project-images`
4. Marque **"Public bucket"** como DESMARCADO (privado)
5. Clique em **"Save"**

## Etapa 6: Configurar o App

1. No projeto frontend, copie o arquivo `.env.local.example` para `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Substitua os valores pelos que você copiou no passo 3:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Opcional (para funcionalidades extras):
   - Adicione `OPENAI_API_KEY` para TTS
   - Adicione `ELEVENLABS_API_KEY` para TTS premium
   - Adicione `MINIMAX_API_KEY` para geração de script

## Etapa 7: Testar! 🎉

```bash
cd real-estate-video-app/frontend
npm run dev
```

Acesse http://localhost:3000 e teste o login/cadastro!

---

## 🆘 Troubleshooting

**Erro: "Failed to fetch" no login**
→ Verifique se as credenciais do `.env.local` estão corretas

**Erro: "Invalid API key"**
→ Você copiou a chave errada. Use a `anon public`, não a `service_role`

**Erro: "relation does not exist"**
→ As tabelas não foram criadas. Volte ao passo 4 e execute o SQL

**Erro: "New signup are disabled"**
→ Vá em Authentication > Settings > Signup/Login e habilite "Enable email signup"

---

## 📋 Resumo das Credenciais Necessárias

| Variável | Onde encontrar | Obrigatório? |
|----------|----------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings > API > URL | ✅ Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings > API > anon public | ✅ Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings > API > service_role secret | ❌ Opcional |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys | ❌ Opcional |

---

Feito! Se tiver algum erro, me manda o print que eu ajudo! 🧙‍♂️
