/**
 * Hook para geração de script com MiniMax
 */

import { useState, useCallback } from 'react';

interface ScriptGenerationParams {
  propertyDescription: string;
  targetAudience?: string;
  style?: 'professional' | 'casual' | 'luxury' | 'family';
  duration?: number;
}

interface ScriptResult {
  script: string;
  highlights: string[];
  suggestedDuration: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useScriptGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateScript = useCallback(async (params: ScriptGenerationParams) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/script/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar script');
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        return data.data as ScriptResult;
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

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    generateScript,
    isGenerating,
    result,
    error,
    clearResult,
  };
}
