-- Configuração do Supabase para Real Estate Video App
-- Execute este SQL no SQL Editor do Supabase

-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de projetos de vídeo
CREATE TABLE video_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Novo Vídeo',
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
    narration_enabled BOOLEAN DEFAULT true,
    tts_voice VARCHAR(100),
    music_id VARCHAR(100) NOT NULL,
    generated_video_url TEXT,
    narration_audio_url TEXT,
    caption_style JSONB,
    target_audience VARCHAR(100),
    style VARCHAR(100),
    generated_script TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de imagens do projeto
CREATE TABLE project_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    duration INTEGER DEFAULT 3000, -- milliseconds
    storage_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de músicas disponíveis
CREATE TABLE musics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    artist VARCHAR(255) DEFAULT 'Studio',
    duration INTEGER NOT NULL, -- milliseconds
    url TEXT NOT NULL,
    category VARCHAR(50) CHECK (category IN ('ambient', 'upbeat', 'cinematic', 'corporate')),
    bpm INTEGER DEFAULT 100,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_video_projects_user_id ON video_projects(user_id);
CREATE INDEX idx_video_projects_status ON video_projects(status);
CREATE INDEX idx_project_images_project_id ON project_images(project_id);
CREATE INDEX idx_musics_category ON musics(category);

-- Políticas de segurança (RLS)
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE musics ENABLE ROW LEVEL SECURITY;

-- Políticas para video_projects
CREATE POLICY "Users can view their own videos"
    ON video_projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own videos"
    ON video_projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
    ON video_projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
    ON video_projects FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para project_images
CREATE POLICY "Users can view images of their videos"
    ON project_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM video_projects
            WHERE video_projects.id = project_images.project_id
            AND video_projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add images to their videos"
    ON project_images FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM video_projects
            WHERE video_projects.id = project_images.project_id
            AND video_projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete images from their videos"
    ON project_images FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM video_projects
            WHERE video_projects.id = project_images.project_id
            AND video_projects.user_id = auth.uid()
        )
    );

-- Políticas para musics (público, apenas leitura)
CREATE POLICY "Anyone can view musics"
    ON musics FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Only admins can modify musics"
    ON musics FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_video_projects_updated_at
    BEFORE UPDATE ON video_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir músicas de exemplo
INSERT INTO musics (name, artist, duration, url, category, bpm) VALUES
    ('Sunrise Dreams', 'Studio', 180000, '/musics/ambient-1.mp3', 'ambient', 60),
    ('Peaceful Morning', 'Studio', 210000, '/musics/ambient-2.mp3', 'ambient', 70),
    ('City Lights', 'Studio', 165000, '/musics/upbeat-1.mp3', 'upbeat', 120),
    ('Urban Energy', 'Studio', 195000, '/musics/upbeat-2.mp3', 'upbeat', 128),
    ('Epic Journey', 'Studio', 240000, '/musics/cinematic-1.mp3', 'cinematic', 90),
    ('Heroic Rise', 'Studio', 200000, '/musics/cinematic-2.mp3', 'cinematic', 100),
    ('Success Story', 'Studio', 175000, '/musics/corporate-1.mp3', 'corporate', 105),
    ('Growth', 'Studio', 185000, '/musics/corporate-2.mp3', 'corporate', 110);

-- Storage bucket para imagens
-- Execute no Storage section do Supabase:
-- 1. Criar bucket chamado 'project-images'
-- 2. Configurar políticas de acesso:

-- Políticas para storage (executar no SQL Editor após criar bucket)
-- CREATE POLICY "Users can upload their own images"
--     ON storage.objects FOR INSERT
--     WITH CHECK (
--         bucket_id = 'project-images' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Users can view their own images"
--     ON storage.objects FOR SELECT
--     USING (
--         bucket_id = 'project-images' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Users can delete their own images"
--     ON storage.objects FOR DELETE
--     USING (
--         bucket_id = 'project-images' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );
