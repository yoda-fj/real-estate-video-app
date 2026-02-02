import { Router } from 'express';
import { ttsService, AVAILABLE_VOICES } from '../services/tts';
import { z } from 'zod';

const router = Router();

const ttsSchema = z.object({
  text: z.string().min(1).max(4000),
  voice: z.string().optional(),
  speed: z.number().min(0.5).max(2.0).optional(),
  provider: z.enum(['openai', 'elevenlabs']).optional(),
});

/**
 * POST /api/tts/generate
 * Gera áudio a partir de texto
 */
router.post('/generate', async (req, res) => {
  try {
    const validated = ttsSchema.parse(req.body);
    
    const result = await ttsService.generateAudio(validated);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    console.error('Erro ao gerar TTS:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar narração',
      message: error.message,
    });
  }
});

/**
 * GET /api/tts/voices
 * Lista vozes disponíveis
 */
router.get('/voices', (req, res) => {
  const voices = ttsService.getAvailableVoices();
  res.json({
    success: true,
    data: voices,
  });
});

/**
 * POST /api/tts/estimate
 * Estima duração de uma narração
 */
router.post('/estimate', (req, res) => {
  try {
    const { text } = z.object({ text: z.string() }).parse(req.body);
    const duration = ttsService.estimateDuration(text);
    
    res.json({
      success: true,
      data: { duration, textLength: text.length },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
