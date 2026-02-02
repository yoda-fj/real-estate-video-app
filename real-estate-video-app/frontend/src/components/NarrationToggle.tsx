'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, ChevronDown, User } from 'lucide-react';

// Vozes disponíveis (mock - depois integração real)
const VOICES = [
  { id: 'alloy', name: 'Alloy', gender: 'male', provider: 'openai' },
  { id: 'echo', name: 'Echo', gender: 'male', provider: 'openai' },
  { id: 'fable', name: 'Fable', gender: 'male', provider: 'openai' },
  { id: 'onyx', name: 'Onyx', gender: 'male', provider: 'openai' },
  { id: 'nova', name: 'Nova', gender: 'female', provider: 'openai' },
  { id: 'shimmer', name: 'Shimmer', gender: 'female', provider: 'openai' },
];

interface NarrationToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
}

export default function NarrationToggle({ 
  enabled, 
  onToggle, 
  selectedVoice, 
  onVoiceChange 
}: NarrationToggleProps) {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  const selectedVoiceInfo = VOICES.find(v => v.id === selectedVoice);

  const handleVoicePreview = (voiceId: string) => {
    if (previewingVoice === voiceId) {
      setPreviewingVoice(null);
      // Stop audio
    } else {
      setPreviewingVoice(voiceId);
      // Play preview audio
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
          onClick={() => onToggle(!enabled)}
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

      {/* Voice Selection */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="relative">
              <label className="block text-sm text-white/60 mb-2">
                Selecione a voz da narração
              </label>

              <button
                onClick={() => setIsVoiceOpen(!isVoiceOpen)}
                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">{selectedVoiceInfo?.name}</p>
                    <p className="text-sm text-white/50 capitalize">
                      {selectedVoiceInfo?.gender} • {selectedVoiceInfo?.provider}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${isVoiceOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Voice Dropdown */}
              <AnimatePresence>
                {isVoiceOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-2 p-2 bg-slate-800 rounded-xl border border-white/10 shadow-xl"
                  >
                    {VOICES.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => {
                          onVoiceChange(voice.id);
                          setIsVoiceOpen(false);
                        }}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-lg transition-colors
                          ${selectedVoice === voice.id 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVoicePreview(voice.id);
                            }}
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <div>
                            <p className="font-medium">{voice.name}</p>
                            <p className="text-xs text-white/50 capitalize">
                              {voice.gender} • {voice.provider}
                            </p>
                          </div>
                        </div>
                        {selectedVoice === voice.id && (
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Narration Preview */}
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Exemplo de Narração</span>
              </div>
              <p className="text-white/70 text-sm italic">
                "Este apartamento excepcional oferece uma experiência única de moradia..."
              </p>
              <p className="text-xs text-white/40 mt-2">
                💡 A narração será sincronizada com as imagens e legendas
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
