/**
 * Video Service - Remotion Integration
 * Gerencia a renderização de vídeos
 */

// Remotion é opcional - se não estiver instalado, usa modo mock
let renderMedia: any;
let selectComposition: any;

try {
  const remotion = require('@remotion/renderer');
  renderMedia = remotion.renderMedia;
  selectComposition = remotion.selectComposition;
} catch {
  console.log('⚠️ @remotion/renderer não instalado. Usando modo mock.');
}

import * as path from 'path';
import * as fs from 'fs';

export interface VideoRenderOptions {
  images: string[];
  narrationAudioUrl?: string;
  musicUrl?: string;
  captions?: Caption[];
  outputFormat?: 'mp4' | 'webm';
  quality?: 'low' | 'medium' | 'high';
}

export interface Caption {
  text: string;
  startTime: number;
  duration: number;
}

export interface RenderProgress {
  status: 'pending' | 'rendering' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  error?: string;
}

// Em produção, usaríamos Redis ou similar para persistir progresso
const renderJobs = new Map<string, RenderProgress>();

export class VideoService {
  private remotionEntry: string;
  private outputDir: string;

  constructor() {
    this.remotionEntry = process.env.REMOTION_ENTRY || './remotion/index.tsx';
    this.outputDir = process.env.RENDER_OUTPUT_DIR || './renders';

    // Garante que o diretório existe
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Inicia uma renderização de vídeo
   */
  async startRender(
    projectId: string,
    options: VideoRenderOptions
  ): Promise<string> {
    const jobId = `${projectId}_${Date.now()}`;

    renderJobs.set(jobId, {
      status: 'pending',
      progress: 0,
    });

    // Inicia renderização em background
    this.renderVideo(jobId, options).catch((error) => {
      console.error(`Erro na renderização ${jobId}:`, error);
      renderJobs.set(jobId, {
        status: 'failed',
        progress: 0,
        error: error.message,
      });
    });

    return jobId;
  }

  /**
   * Retorna o progresso de uma renderização
   */
  getProgress(jobId: string): RenderProgress | null {
    return renderJobs.get(jobId) || null;
  }

  private async renderVideo(
    jobId: string,
    options: VideoRenderOptions
  ): Promise<void> {
    // Se Remotion não estiver disponível, usa mock
    if (!renderMedia || !selectComposition) {
      return this.renderMockVideo(jobId);
    }

    const { images, narrationAudioUrl, musicUrl, captions, quality = 'medium' } = options;

    // Atualiza status
    renderJobs.set(jobId, {
      status: 'rendering',
      progress: 10,
    });

    try {
      // Verifica se Remotion está configurado
      if (!fs.existsSync(this.remotionEntry)) {
        throw new Error('Remotion entry point não encontrado');
      }

      // Configurações de qualidade
      const qualitySettings = {
        low: { crf: 28, bitrate: '2M' },
        medium: { crf: 22, bitrate: '4M' },
        high: { crf: 18, bitrate: '8M' },
      };

      const settings = qualitySettings[quality];
      const outputFile = path.join(this.outputDir, `${jobId}.mp4`);

      // Prepara input props para o composition
      const inputProps = {
        images,
        narrationAudioUrl,
        musicUrl,
        captions,
      };

      // Seleciona a composição
      const composition = await selectComposition({
        serveUrl: this.remotionEntry,
        id: 'RealEstateVideo',
        inputProps,
      });

      // Atualiza progresso
      renderJobs.set(jobId, {
        status: 'rendering',
        progress: 30,
      });

      // Renderiza o vídeo
      await renderMedia({
        composition,
        serveUrl: this.remotionEntry,
        codec: 'h264',
        outputLocation: outputFile,
        inputProps,
        crf: settings.crf,
        imageFormat: 'jpeg',
        onProgress: ({ progress }: { progress: number }) => {
          const totalProgress = 30 + Math.round(progress * 60); // 30% - 90%
          renderJobs.set(jobId, {
            status: 'rendering',
            progress: totalProgress,
          });
        },
      });

      // Finaliza
      renderJobs.set(jobId, {
        status: 'completed',
        progress: 100,
        outputUrl: `/renders/${jobId}.mp4`,
      });
    } catch (error: any) {
      renderJobs.set(jobId, {
        status: 'failed',
        progress: 0,
        error: error.message,
      });
      throw error;
    }
  }

  private async renderMockVideo(jobId: string): Promise<void> {
    // Simula progresso
    const intervals = [10, 30, 50, 70, 90, 100];
    for (const progress of intervals) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      renderJobs.set(jobId, {
        status: progress === 100 ? 'completed' : 'rendering',
        progress,
        outputUrl: progress === 100 ? 'https://example.com/mock-video.mp4' : undefined,
      });
    }
  }

  /**
   * Cria um vídeo mock (para testes sem Remotion)
   */
  async createMockVideo(projectId: string): Promise<string> {
    const jobId = `${projectId}_mock_${Date.now()}`;
    
    renderJobs.set(jobId, {
      status: 'rendering',
      progress: 0,
    });

    // Simula progresso
    const intervals = [20, 45, 70, 90, 100];
    for (const progress of intervals) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      renderJobs.set(jobId, {
        status: progress === 100 ? 'completed' : 'rendering',
        progress,
        outputUrl: progress === 100 ? 'https://example.com/mock-video.mp4' : undefined,
      });
    }

    return jobId;
  }

  /**
   * Lista todos os jobs ativos
   */
  listActiveJobs(): Array<{ id: string; progress: RenderProgress }> {
    return Array.from(renderJobs.entries())
      .filter(([_, progress]) => progress.status === 'rendering' || progress.status === 'pending')
      .map(([id, progress]) => ({ id, progress }));
  }

  /**
   * Limpa jobs antigos
   */
  cleanupOldJobs(maxAgeHours: number = 24): void {
    // Em produção, removeria jobs antigos do Redis
    // Por enquanto, limpa da memória
    console.log(`Cleanup de jobs com mais de ${maxAgeHours}h`);
  }
}

// Singleton instance
export const videoService = new VideoService();
