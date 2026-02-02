'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import type { Music, UploadedImage, TTSVoice } from '@shared/types';

interface VideoPreviewProps {
  images: UploadedImage[];
  text: string;
  music: Music | null;
  narrationEnabled: boolean;
  voice: string;
}

// Função para dividir texto em frases
function splitIntoSentences(text: string): string[] {
  // Divide por pontuação: ponto, exclamação, interrogação
  const sentences = text.split(/([.!?]+)/).filter(s => s.trim().length > 0);
  // Reagrupa pontuação com a frase anterior
  const result: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i] || '';
    const punctuation = sentences[i + 1] || '';
    if (sentence.trim()) {
      result.push(sentence.trim() + punctuation);
    }
  }
  return result.length > 0 ? result : [text];
}

export default function VideoPreview({
  images,
  text,
  music,
  narrationEnabled,
  voice
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  // Divide texto em frases
  const sentences = splitIntoSentences(text);
  const totalSentences = sentences.length;

  // Calculate total duration (4 segundos por frase se houver texto)
  const sentenceDuration = 4000; // 4 segundos por frase
  const totalDuration = images.length > 0
    ? images.reduce((acc, img) => acc + img.duration, 0)
    : totalSentences * sentenceDuration;

  // Playback simulation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 50;

        if (newProgress >= totalDuration) {
          setIsPlaying(false);
          setCurrentSentenceIndex(0);
          return 0;
        }

        // Update current image
        if (images.length > 0) {
          let accumulated = 0;
          for (let i = 0; i < images.length; i++) {
            accumulated += images[i].duration;
            if (newProgress < accumulated) {
              setCurrentImageIndex(i);
              break;
            }
          }
        }

        // Update current sentence based on progress
        const sentenceIndex = Math.min(
          Math.floor(newProgress / sentenceDuration),
          totalSentences - 1
        );
        setCurrentSentenceIndex(sentenceIndex);

        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, images, totalDuration, totalSentences, sentenceDuration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setProgress(0);
      setCurrentSentenceIndex(0);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate current time based on progress
  const currentTime = formatTime(progress);
  const totalTime = formatTime(totalDuration);

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="relative aspect-[9/16] max-h-[500px] mx-auto bg-black rounded-xl overflow-hidden shadow-2xl">
        {/* Current Image */}
        <AnimatePresence mode="wait">
          {images.length > 0 ? (
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex].url}
              alt={`Imagem ${currentImageIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-10 h-10 text-white/40" />
                </div>
                <p className="text-white/40">Adicione imagens para visualizar</p>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        {/* Caption Overlay - mostra frase atual */}
        <AnimatePresence mode="wait">
          {text && sentences.length > 0 && isPlaying && (
            <motion.div
              key={currentSentenceIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-20 left-4 right-4"
            >
              <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4">
                <p className="text-white text-center font-medium text-lg leading-relaxed">
                  {sentences[currentSentenceIndex]}
                </p>
                {/* Indicador de progresso das frases */}
                <div className="flex justify-center gap-1 mt-2">
                  {sentences.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentSentenceIndex
                          ? 'bg-purple-400'
                          : idx < currentSentenceIndex
                          ? 'bg-purple-600'
                          : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between text-white text-sm">
            {/* Music Info */}
            <div className="flex items-center gap-2">
              {music && (
                <>
                  <MusicBadge playing={isPlaying} />
                  <span className="truncate max-w-[150px]">{music.name}</span>
                </>
              )}
            </div>

            {/* Duration */}
            <span className="text-white/60">
              {currentTime} / {totalTime}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${totalDuration > 0 ? (progress / totalDuration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          disabled={images.length === 0}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all disabled:opacity-0"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" fill="currentColor" />
          ) : (
            <Play className="w-8 h-8 text-white" fill="currentColor" />
          )}
        </button>

        {/* Mute Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Fullscreen Button */}
        <button className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
          <Maximize2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePlayPause}
          disabled={images.length === 0}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-all
            ${images.length > 0 
              ? 'bg-purple-500 hover:bg-purple-400 text-white' 
              : 'bg-white/10 text-white/40 cursor-not-allowed'
            }
          `}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6" fill="currentColor" />
          )}
        </button>
      </div>

      {/* Video Info */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-white">{images.length}</p>
          <p className="text-xs text-white/50">Imagens</p>
        </div>
        <div className="p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-white">{text.split(' ').length}</p>
          <p className="text-xs text-white/50">Palavras</p>
        </div>
        <div className="p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-white">{formatTime(totalDuration)}</p>
          <p className="text-xs text-white/50">Duração</p>
        </div>
      </div>
    </div>
  );
}

// Music Badge Component
function MusicBadge({ playing }: { playing: boolean }) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
      playing ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${playing ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`} />
      <span className="text-xs font-medium">
        {playing ? 'Tocando' : 'Música'}
      </span>
    </div>
  );
}
