/**
 * Hook para upload de imagens
 */

import { useState, useCallback } from 'react';

interface UploadResult {
  url: string;
  path: string;
  filename: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = useCallback(async (
    files: File[],
    userId: string,
    projectId?: string
  ): Promise<UploadResult[]> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      formData.append('userId', userId);
      if (projectId) formData.append('projectId', projectId);

      const response = await fetch(`${API_URL}/api/upload/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      const data = await response.json();

      if (data.success) {
        setProgress(100);
        return data.data;
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const deleteImage = useCallback(async (storagePath: string) => {
    try {
      const response = await fetch(`${API_URL}/api/upload/${storagePath}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar imagem');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    uploadImages,
    deleteImage,
    isUploading,
    progress,
    error,
  };
}
