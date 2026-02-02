'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music2, Volume2 } from 'lucide-react';
import type { Music } from '@shared/types';

// Lista de músicas disponíveis (mock - depois vem do backend)
const AVAILABLE_MUSICS: Music[] = [
  {
    id: 'ambient-1',
    name: 'Sunrise Dreams',
    artist: 'Studio',
    duration: 180000,
    url: '/musics/ambient-1.mp3',
    category: 'ambient',
    bpm: 60,
  },
  {
    id: 'ambient-2',
    name: 'Peaceful Morning',
    artist: 'Studio',
    duration: 210000,
    url: '/musics/ambient-2.mp3',
    category: 'ambient',
    bpm: 70,
  },
  {
    id: 'upbeat-1',
    name: 'City Lights',
    artist: 'Studio',
    duration: 165000,
    url: '/musics/upbeat-1.mp3',
    category: 'upbeat',
    bpm: 120,
  },
  {
    id: 'upbeat-2',
    name: 'Urban Energy',
    artist: 'Studio',
    duration: 195000,
    url: '/musics/upbeat-2.mp3',
    category: 'upbeat',
    bpm: 128,
  },
  {
    id: 'cinematic-1',
    name: 'Epic Journey',
    artist: 'Studio',
    duration: 240000,
    url: '/musics/cinematic-1.mp3',
    category: 'cinematic',
    bpm: 90,
  },
  {
    id: 'cinematic-2',
    name: 'Heroic Rise',
    artist: 'Studio',
    duration: 200000,
    url: '/musics/cinematic-2.mp3',
    category: 'cinematic',
    bpm: 100,
  },
  {
    id: 'corporate-1',
    name: 'Success Story',
    artist: 'Studio',
    duration: 175000,
    url: '/musics/corporate-1.mp3',
    category: 'corporate',
    bpm: 105,
  },
  {
    id: 'corporate-2',
    name: 'Growth',
    artist: 'Studio',
    duration: 185000,
    url: '/musics/corporate-2.mp3',
    category: 'corporate',
    bpm: 110,
  },
  // Músicas do usuário
  {
    id: 'sad-motivational',
    name: 'Sad Motivational',
    artist: 'Custom',
    duration: 180000,
    url: '/musics/sad-motivational-pop-rock-background-434657.mp3',
    category: 'cinematic',
    bpm: 85,
  },
  {
    id: 'fun-upbeat',
    name: 'Fun Upbeat',
    artist: 'Custom',
    duration: 180000,
    url: '/musics/fun-upbeat-energetic-pop-rock-345251.mp3',
    category: 'upbeat',
    bpm: 130,
  },
];

interface MusicSelectorProps {
  selectedMusic: Music | null;
  onSelect: (music: Music) => void;
}

const CATEGORIES = ['all', 'ambient', 'upbeat', 'cinematic', 'corporate'] as const;

export default function MusicSelector({ selectedMusic, onSelect }: MusicSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>('all');
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.5);

  const filteredMusics = activeCategory === 'all'
    ? AVAILABLE_MUSICS
    : AVAILABLE_MUSICS.filter((m) => m.category === activeCategory);

  const handlePreview = (music: Music) => {
    console.log('handlePreview called:', music.name, music.url);
    if (previewingId === music.id) {
      // Stop preview
      console.log('Stopping preview');
      audioRef.current?.pause();
      setIsPlaying(false);
      setPreviewingId(null);
    } else {
      // Start preview
      console.log('Starting preview, URL:', music.url);
      if (audioRef.current) {
        audioRef.current.src = music.url;
        audioRef.current.volume = volume;
        audioRef.current.play().catch(err => console.error('Play error:', err));
        setIsPlaying(true);
        setPreviewingId(music.id);
      } else {
        console.error('Audio ref is null');
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setPreviewingId(null);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Inicializa audio element se ainda não existir
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', handleEnded);
    }

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
              ${activeCategory === category
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {category === 'all' ? 'Todas' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Music List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {filteredMusics.map((music) => (
            <motion.div
              key={music.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => onSelect(music)}
              className={`
                relative flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all
                ${selectedMusic?.id === music.id
                  ? 'bg-purple-500/20 border border-purple-500/50'
                  : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
                }
              `}
            >
              {/* Play/Preview Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(music);
                }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${previewingId === music.id && isPlaying
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                  }
                `}
              >
                {previewingId === music.id && isPlaying ? (
                  <Pause className="w-5 h-5" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5" fill="currentColor" />
                )}
              </button>

              {/* Music Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{music.name}</h4>
                <p className="text-sm text-white/50 truncate">{music.artist}</p>
              </div>

              {/* Duration */}
              <div className="text-sm text-white/40">
                {Math.floor(music.duration / 60000)}:{(music.duration % 60000 / 1000).toString().padStart(2, '0')}
              </div>

              {/* BPM */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-white/40">
                <span>{music.bpm}</span>
                <span className="opacity-50">BPM</span>
              </div>

              {/* Selected Indicator */}
              {selectedMusic?.id === music.id && (
                <div className="absolute -right-1 -top-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Volume Control (when previewing) */}
      {previewingId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
        >
          <Volume2 className="w-5 h-5 text-white/60" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
          />
          <span className="text-sm text-white/60 w-10 text-right">
            {Math.round(volume * 100)}%
          </span>
        </motion.div>
      )}

      {/* Selected Music Summary */}
      {selectedMusic && (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">{selectedMusic.name}</p>
            <p className="text-sm text-white/50">{selectedMusic.artist} • {selectedMusic.category}</p>
          </div>
        </div>
      )}
    </div>
  );
}
