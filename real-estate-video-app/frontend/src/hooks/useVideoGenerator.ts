'use client';

import { useState, useCallback } from 'react';
import type { UploadedImage, Music } from '@shared/types';

interface GenerateParams {
  images: UploadedImage[];
  text: string;
  musicId: string;
  narrationEnabled: boolean;
  ttsVoice?: string;
}

interface GenerateResult {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  error?: string;
}

export function useVideoGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateVideo = useCallback(async (params: GenerateParams) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      // 1. Upload images to server
      setProgress(5);
      console.log('Fazendo upload das imagens...');
      const imageUrls = await uploadImages(params.images);
      console.log('Upload concluído:', JSON.stringify(imageUrls));

      // 2. Generate TTS audio if narration is enabled
      let narrationAudioUrl: string | undefined;
      if (params.narrationEnabled && params.ttsVoice) {
        setProgress(30);
        console.log('Gerando narração...');
        narrationAudioUrl = await generateTTS(params.text, params.ttsVoice);
      }

      // 3. Submit video generation job (now synchronous)
      setProgress(50);
      console.log('Renderizando vídeo...');
      console.log('Enviando para API:', JSON.stringify({
        images: imageUrls,
        text: params.text,
        musicId: params.musicId,
        narrationAudioUrl,
      }, null, 2));

      const result = await submitGenerationJob({
        images: imageUrls,
        text: params.text,
        musicId: params.musicId,
        narrationAudioUrl,
      });

      console.log('Resultado:', JSON.stringify(result, null, 2));

      if (result.status === 'completed' && result.videoUrl) {
        setGeneratedVideoUrl(result.videoUrl);
        setProgress(100);
        console.log('Vídeo gerado:', result.videoUrl);
      } else {
        throw new Error(result.error || 'Falha ao gerar vídeo');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro na geração:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateVideo,
    isGenerating,
    progress,
    generatedVideoUrl,
    error,
  };
}

// Helper functions
async function uploadImages(images: UploadedImage[]): Promise<Array<{ url: string; duration: number }>> {
  const formData = new FormData();

  // Converter base64 para blob e adicionar ao FormData
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    let blob: Blob;

    if (image.url.startsWith('data:')) {
      // É base64, converter para blob
      const base64Data = image.url.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let j = 0; j < byteCharacters.length; j++) {
        byteNumbers[j] = byteCharacters.charCodeAt(j);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: 'image/jpeg' });
    } else {
      // URL externa, fazer download
      const response = await fetch(image.url);
      blob = await response.blob();
    }

    formData.append('images', blob, `image-${i}.jpg`);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Upload failed:', errorText);
    throw new Error('Failed to upload images');
  }

  const data = await response.json();
  return data.images;
}

async function generateTTS(text: string, voice: string): Promise<string> {
  const response = await fetch('/api/tts/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate TTS');
  }

  const data = await response.json();
  return data.audioUrl;
}

async function submitGenerationJob(params: {
  images: Array<{ url: string; duration: number }>;
  text: string;
  musicId: string;
  narrationAudioUrl?: string;
}): Promise<{ jobId: string; status: string; videoUrl?: string; error?: string }> {
  const response = await fetch('/api/video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate video: ${error}`);
  }

  return response.json();
}

async function pollJobCompletion(jobId: string): Promise<{
  status: 'queued' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
}> {
  const maxAttempts = 60; // 60 * 2s = 2 minutes max
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`/api/video/status/${jobId}`);
    
    if (!response.ok) {
      throw new Error('Failed to check job status');
    }

    const result = await response.json();

    if (result.status === 'completed' || result.status === 'failed') {
      return result;
    }

    // Wait 2 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 2000));
    attempts++;
  }

  throw new Error('Job timed out');
}
