'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Music as MusicIcon, Type, Mic, Play, Download, Settings, X, GripVertical } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import MusicSelector from '@/components/MusicSelector';
import TextInput from '@/components/TextInput';
import NarrationToggle from '@/components/NarrationToggle';
import VideoPreview from '@/components/VideoPreview';
import { useVideoGenerator } from '@/hooks/useVideoGenerator';
import type { Music, UploadedImage, TTSVoice } from '@shared/types';

export default function EditorPage() {
  // State
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [text, setText] = useState('');
  const [narrationEnabled, setNarrationEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('alloy');
  const [showPreview, setShowPreview] = useState(false);
  
  // Hook de geração de vídeo
  const { generateVideo, isGenerating, progress, generatedVideoUrl, error } = useVideoGenerator();

  // Handlers
  const handleImagesChange = useCallback((imgs: UploadedImage[]) => {
    setImages(imgs);
  }, []);

  const handleMusicSelect = useCallback((music: Music) => {
    setSelectedMusic(music);
  }, []);

  const handleGenerate = async () => {
    if (images.length === 0) {
      alert('Por favor, adicione pelo menos uma imagem');
      return;
    }
    if (!selectedMusic) {
      alert('Por favor, selecione uma música');
      return;
    }
    if (!text.trim()) {
      alert('Por favor, digite o texto do anúncio');
      return;
    }

    await generateVideo({
      images,
      text,
      musicId: selectedMusic.id,
      narrationEnabled,
      ttsVoice: selectedVoice,
    });
  };

  const canGenerate = images.length > 0 && selectedMusic && text.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Play className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Real Estate <span className="text-purple-400">Video Generator</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPreview(true)}
              disabled={!canGenerate}
              className="px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* 1. Image Upload */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Imagens do Imóvel</h2>
                  <p className="text-sm text-white/50">Adicione fotos do propriedade</p>
                </div>
              </div>
              <ImageUploader
                images={images}
                onChange={handleImagesChange}
                maxImages={10}
              />
            </motion.section>

            {/* 2. Music Selection */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <MusicIcon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Música de Fundo</h2>
                  <p className="text-sm text-white/50">Escolha uma trilha sonora</p>
                </div>
              </div>
              <MusicSelector
                selectedMusic={selectedMusic}
                onSelect={handleMusicSelect}
              />
            </motion.section>

            {/* 3. Text Input */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Type className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Texto do Anúncio</h2>
                  <p className="text-sm text-white/50">Este texto será usado para legendas e narração</p>
                </div>
              </div>
              <TextInput
                value={text}
                onChange={setText}
                placeholder="Digite aqui a descrição do imóvel..."
                maxLength={500}
              />
            </motion.section>

            {/* 4. Narration Toggle */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Narração por IA</h2>
                  <p className="text-sm text-white/50">Gere narração automática do texto</p>
                </div>
              </div>
              <NarrationToggle
                enabled={narrationEnabled}
                onToggle={setNarrationEnabled}
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
              />
            </motion.section>
          </div>

          {/* Right Column - Preview & Generate */}
          <div className="space-y-6">
            {/* Video Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-6 sticky top-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Pré-visualização</h2>
              
              <VideoPreview
                images={images}
                text={text}
                music={selectedMusic}
                narrationEnabled={narrationEnabled}
                voice={selectedVoice}
              />

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Gerando... {progress}%
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Gerar Vídeo
                  </span>
                )}
              </button>

              {generatedVideoUrl && (
                <a
                  href={generatedVideoUrl}
                  download
                  className="block mt-4 text-center py-3 rounded-xl font-medium text-green-400 border border-green-400/30 hover:bg-green-400/10 transition-colors"
                >
                  📥 Baixar Vídeo Gerado
                </a>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                >
                  <p className="text-red-400 font-medium">Erro:</p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
