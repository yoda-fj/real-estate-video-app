/**
 * Video Service - Remotion Integration
 * Gerencia a renderização de vídeos
 */

// Remotion é opcional - se não estiver instalado, usa modo mock
let renderMedia: any;
let selectComposition: any;
let bundle: any;

try {
  const remotion = require('@remotion/renderer');
  renderMedia = remotion.renderMedia;
  selectComposition = remotion.selectComposition;
  const bundler = require('@remotion/bundler');
  bundle = bundler.bundle;
} catch {
  console.log('⚠️ @remotion/renderer não instalado. Usando modo mock.');
}

try {
  const bundler = require('@remotion/bundler');
  bundle = bundler.bundle;
} catch {
  console.log('⚠️ @remotion/bundler não instalado.');
}

import * as path from 'path';
import * as fs from 'fs';

export interface VideoRenderOptions {
  images: string[];
  narrationAudioUrl?: string;
  musicUrl?: string;
  title?: string;
  subtitle?: string;
  outputFormat?: 'mp4' | 'webm';
  quality?: 'low' | 'medium' | 'high';
  captions?: Caption[];
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
  private bundledEntry: string | null = null;

  constructor() {
    this.remotionEntry = process.env.REMOTION_ENTRY || './remotion/index.tsx';
    this.outputDir = process.env.RENDER_OUTPUT_DIR || './renders';

    // Garante que o diretório existe
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Bundle do Remotion (executado uma vez)
   */
  private async getBundle(): Promise<string> {
    if (this.bundledEntry) {
      return this.bundledEntry;
    }

    if (!bundle) {
      throw new Error('Bundle não disponível');
    }

    const entryPoint = path.resolve(this.remotionEntry);
    console.log('📦 Criando bundle do Remotion:', entryPoint);

    const bundleResult = await bundle({
      entryPoint,
      webpackOverride: (config: any) => config,
    });

    if (!bundleResult) {
      throw new Error('Falha ao criar bundle');
    }

    this.bundledEntry = bundleResult;
    console.log('✅ Bundle criado:', this.bundledEntry);
    return bundleResult;
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
    if (!renderMedia || !selectComposition || !bundle) {
      console.log('⚠️ Remotion não disponível, usando mock');
      return this.renderMockVideo(jobId);
    }

    const { 
      images, 
      narrationAudioUrl, 
      musicUrl, 
      title,
      subtitle,
      quality = 'medium' 
    } = options;

    // Atualiza status
    renderJobs.set(jobId, {
      status: 'rendering',
      progress: 5,
    });

    try {
      // Verifica se entry point existe
      const entryPath = path.resolve(this.remotionEntry);
      if (!fs.existsSync(entryPath)) {
        throw new Error(`Remotion entry point não encontrado: ${entryPath}`);
      }

      // Configurações de qualidade
      const qualitySettings = {
        low: { crf: 28 },
        medium: { crf: 22 },
        high: { crf: 18 },
      };

      const settings = qualitySettings[quality];
      const outputFile = path.join(this.outputDir, `${jobId}.mp4`);

      // Prepara input props para o composition
      const inputProps = {
        images,
        narrationAudioUrl,
        musicUrl,
        title,
        subtitle,
        captions: options.captions || [],
      };

      console.log('🎬 Iniciando renderização:', { 
        jobId, 
        images: images.length,
        captionsCount: options.captions?.length,
        captionsSample: options.captions?.slice(0, 2),
        inputPropsKeys: Object.keys(inputProps),
      });

      // Cria bundle
      renderJobs.set(jobId, {
        status: 'rendering',
        progress: 10,
      });

      const bundled = await this.getBundle();

      // Atualiza progresso
      renderJobs.set(jobId, {
        status: 'rendering',
        progress: 20,
      });

      // Seleciona a composição
      const composition = await selectComposition({
        serveUrl: bundled,
        id: 'RealEstateVideo',
        inputProps,
      });

      console.log('✅ Composição selecionada:', composition.id, 
        'Duração:', composition.durationInFrames, 'frames');

      // Atualiza progresso
      renderJobs.set(jobId, {
        status: 'rendering',
        progress: 30,
      });

      // Renderiza o vídeo
      await renderMedia({
        composition,
        serveUrl: bundled,
        codec: 'h264',
        outputLocation: outputFile,
        inputProps,
        crf: settings.crf,
        imageFormat: 'jpeg',
        onProgress: ({ progress }: { progress: number }) => {
          const totalProgress = 30 + Math.round(progress * 65); // 30% - 95%
          renderJobs.set(jobId, {
            status: 'rendering',
            progress: totalProgress,
          });
        },
        onDownload: (src: string) => {
          console.log('📥 Download:', src);
        },
      });

      // Finaliza
      renderJobs.set(jobId, {
        status: 'completed',
        progress: 100,
        outputUrl: `/renders/${jobId}.mp4`,
      });

      console.log('✅ Renderização concluída:', outputFile);
    } catch (error: any) {
      console.error('❌ Erro na renderização:', error);
      renderJobs.set(jobId, {
        status: 'failed',
        progress: 0,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Estima a duração de um texto em áudio (em segundos)
   * Baseado em ~150-180ms por palavra + pausas
   */
  estimateAudioDuration(text: string): number {
    const words = text.trim().split(/\s+/).length;
    // 170ms por palavra + 0.5s de pausa inicial
    const duration = (words * 0.17) + 0.5;
    return Math.max(duration, 1.0); // Mínimo 1 segundo
  }

  /**
   * Quebra texto em frases e calcula timestamps sincronizados
   */
  generateSyncCaptions(text: string): Array<{text: string, startTime: number, duration: number}> {
    // Quebra em frases (por pontuação)
    const sentences = text
      .replace(/([.!?])/g, '$1|')
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const captions: Array<{text: string, startTime: number, duration: number}> = [];
    let currentTime = 0.5; // Pausa inicial de 0.5s

    for (const sentence of sentences) {
      const duration = this.estimateAudioDuration(sentence);
      captions.push({
        text: sentence,
        startTime: currentTime,
        duration: duration
      });
      currentTime += duration + 0.3; // 0.3s de pausa entre frases
    }

    return captions;
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
