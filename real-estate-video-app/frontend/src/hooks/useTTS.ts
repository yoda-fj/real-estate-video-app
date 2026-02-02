/**
 * Hook para Text-to-Speech (TTS)
 */

import { useState, useCallback } from 'react';

interface TTSOptions {
  text: string;
  voice?: string;
  speed?: number;
  provider?: 'openai' | 'elevenlabs';
}

interface TTSResult {
  audioUrl: string;
  duration: number;
  provider: string;
}

interface Voice {
  id: string;
  name: string;
  description: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useTTS() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generateAudio = useCallback(async (options: TTSOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar áudio');
      }

      const data = await response.json();

      if (data.success) {
        setAudioUrl(data.data.audioUrl);
        setDuration(data.data.duration);
        return data.data as TTSResult;
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearAudio = useCallback(() => {
    setAudioUrl(null);
    setDuration(0);
    setError(null);
  }, []);

  return {
    generateAudio,
    isGenerating,
    audioUrl,
    duration,
    error,
    clearAudio,
  };
}

// Hook para listar vozes disponíveis
export function useAvailableVoices() {
  const [voices, setVoices] = useState<{ openai: Voice[]; elevenlabs: Voice[] }>({
    openai: [],
    elevenlabs: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchVoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/tts/voices`);
      const data = await response.json();

      if (data.success) {
        setVoices(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar vozes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { voices, isLoading, fetchVoices };
}
