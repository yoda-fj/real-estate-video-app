/**
 * Hook para renderização de vídeo
 */

import { useState, useCallback, useEffect, useRef } from 'react';

interface Caption {
  text: string;
  startTime: number;
  duration: number;
}

interface RenderOptions {
  projectId: string;
  images: string[];
  narrationAudioUrl?: string;
  musicUrl?: string;
  captions?: Caption[];
  quality?: 'low' | 'medium' | 'high';
}

interface RenderProgress {
  status: 'pending' | 'rendering' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  error?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useVideoRender() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<RenderProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const startRender = useCallback(async (options: RenderOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/video/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar renderização');
      }

      const data = await response.json();

      if (data.success) {
        setJobId(data.data.jobId);
        setProgress({
          status: 'pending',
          progress: 0,
        });
        return data.data.jobId;
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkProgress = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/video/progress/${id}`);
      const data = await response.json();

      if (data.success) {
        setProgress(data.data);
        return data.data as RenderProgress;
      }
    } catch (err) {
      console.error('Erro ao verificar progresso:', err);
    }
  }, []);

  // Polling automático
  useEffect(() => {
    if (!jobId) return;
    if (progress?.status === 'completed' || progress?.status === 'failed') return;

    pollingRef.current = setInterval(() => {
      checkProgress(jobId);
    }, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [jobId, progress?.status, checkProgress]);

  const reset = useCallback(() => {
    setJobId(null);
    setProgress(null);
    setError(null);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  }, []);

  return {
    startRender,
    checkProgress,
    jobId,
    progress,
    isLoading,
    error,
    reset,
  };
}
