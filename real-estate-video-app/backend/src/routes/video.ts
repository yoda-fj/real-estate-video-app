import { Router } from 'express';
import { videoService } from '../services/video';
import { z } from 'zod';

const router = Router();

const renderSchema = z.object({
  projectId: z.string().uuid(),
  images: z.array(z.string().url()),
  narrationAudioUrl: z.string().url().optional(),
  narrationText: z.string().optional(), // Texto para gerar legendas sincronizadas
  musicUrl: z.string().url().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  quality: z.enum(['low', 'medium', 'high']).optional(),
});

/**
 * POST /api/video/render
 * Inicia renderização de um vídeo
 */
router.post('/render', async (req, res) => {
  try {
    const validated = renderSchema.parse(req.body);
    
    console.log('🎬 Requisição de renderização recebida:', {
      projectId: validated.projectId,
      imagesCount: validated.images.length,
      hasNarration: !!validated.narrationAudioUrl,
      hasMusic: !!validated.musicUrl,
    });

    // Se tiver narrationText, gera legendas sincronizadas
    let captions;
    if (validated.narrationText) {
      captions = videoService.generateSyncCaptions(validated.narrationText);
      console.log('📝 Legendas sincronizadas geradas:', captions.length, 'frases');
    }
    
    const jobId = await videoService.startRender(validated.projectId, {
      images: validated.images,
      narrationAudioUrl: validated.narrationAudioUrl,
      musicUrl: validated.musicUrl,
      title: validated.title,
      subtitle: validated.subtitle,
      quality: validated.quality,
      captions: captions, // Passa as legendas sincronizadas
    });

    res.json({
      success: true,
      data: {
        jobId,
        status: 'pending',
        mode: 'remotion',
        captionsPreview: captions?.map(c => ({ text: c.text, start: c.startTime.toFixed(1) + 's' })),
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    console.error('Erro ao iniciar renderização:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao iniciar renderização',
      message: error.message,
    });
  }
});

/**
 * GET /api/video/progress/:jobId
 * Retorna progresso de uma renderização
 */
router.get('/progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  const progress = videoService.getProgress(jobId);

  if (!progress) {
    return res.status(404).json({
      success: false,
      error: 'Job não encontrado',
    });
  }

  res.json({
    success: true,
    data: progress,
  });
});

/**
 * GET /api/video/jobs
 * Lista jobs ativos
 */
router.get('/jobs', (req, res) => {
  const jobs = videoService.listActiveJobs();
  res.json({
    success: true,
    data: jobs,
  });
});

export default router;
