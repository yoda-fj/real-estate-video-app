'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Play, Pause, Loader2, Volume2 } from 'lucide-react';

interface NarrationToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
}

// Voz fixa: Serena (melhor para PT-BR)
const DEFAULT_VOICE = 'Serena';
const PREVIEW_TEXT = "Olá! Este é um exemplo de como sua narração vai ficar.";

export default function NarrationToggle({
  enabled,
  onToggle,
  selectedVoice,
  onVoiceChange
}: NarrationToggleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Garantir que Serena está selecionada quando ativar
  const handleToggle = (value: boolean) => {
    onToggle(value);
    if (value && selectedVoice !== DEFAULT_VOICE) {
      onVoiceChange(DEFAULT_VOICE);
    }
  };

  const handleVoicePreview = async () => {
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setPreviewLoading(true);

    try {
      const response = await fetch(`/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: PREVIEW_TEXT,
          voice: DEFAULT_VOICE,
          language: 'Portuguese',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.audioUrl) {
        // Usar o caminho do áudio retornado
        let audioUrl = data.audioUrl;
        if (!audioUrl.startsWith('http')) {
          // Normalizar o caminho: remover ./ no início
          audioUrl = audioUrl.replace(/^\.\//, '');
          // O servidor serve arquivos de /uploads/, então precisamos extrair apenas o nome do arquivo
          // O caminho completo é /caminho/uploads/audio/arquivo.wav mas servimos de /uploads/arquivo.wav
          const filename = audioUrl.split('/').pop();
          audioUrl = `http://localhost:8002/uploads/${filename}`;
        }
        
        audioRef.current = new Audio(audioUrl);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };

        audioRef.current.onerror = () => {
          console.error('Erro ao carregar áudio');
          setIsPlaying(false);
          setPreviewLoading(false);
        };

        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        console.error('Resposta sem audioUrl:', data);
      }
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toggle Switch */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            enabled ? 'bg-purple-500' : 'bg-white/10'
          }`}>
            {enabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white/40" />
            )}
          </div>
          <div>
            <p className="text-white font-medium">Narração por IA</p>
            <p className="text-sm text-white/50">
              {enabled ? 'O texto será narrado automaticamente' : 'Legendas estáticas apenas'}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleToggle(!enabled)}
          className={`
            relative w-14 h-7 rounded-full transition-all
            ${enabled ? 'bg-purple-500' : 'bg-white/20'}
          `}
        >
          <motion.div
            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
            animate={{ left: enabled ? 'calc(100% - 21px)' : '4px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Voice Selection - Serena apenas */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Serena</p>
                    <p className="text-xs text-white/50">Voz feminina • Português</p>
                  </div>
                </div>

                {/* Preview Button */}
                <button
                  onClick={handleVoicePreview}
                  disabled={previewLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors disabled:opacity-50"
                >
                  {previewLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Gerando...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span className="text-sm">Parar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span className="text-sm">Ouvir</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/70 text-sm">
                <span className="text-purple-400 font-medium">💡</span> Clique em "Ouvir" para testar a voz antes de gerar o vídeo.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disabled State Hint */}
      {!enabled && (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-start gap-3">
            <MicOff className="w-5 h-5 text-white/40 mt-0.5" />
            <div>
              <p className="text-white/70 text-sm">
                Sem narração - apenas legendas estáticas
              </p>
              <p className="text-xs text-white/40 mt-1">
                Ideal para vídeos curtos ou quando você já tem áudio próprio
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
