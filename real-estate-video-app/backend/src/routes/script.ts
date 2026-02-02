import { Router } from 'express';
import { minimaxService } from '../services/minimax';
import { z } from 'zod';

const router = Router();

const generateScriptSchema = z.object({
  propertyDescription: z.string().min(10).max(2000),
  targetAudience: z.string().optional(),
  style: z.enum(['professional', 'casual', 'luxury', 'family']).optional(),
  duration: z.number().min(15).max(180).optional(),
  language: z.string().optional(),
});

/**
 * POST /api/script/generate
 * Gera um script para vídeo de imóvel
 */
router.post('/generate', async (req, res) => {
  try {
    const validated = generateScriptSchema.parse(req.body);
    
    const result = await minimaxService.generateScript(validated);
    
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

    console.error('Erro ao gerar script:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar script',
      message: error.message,
    });
  }
});

/**
 * GET /api/script/health
 * Health check do serviço MiniMax
 */
router.get('/health', (req, res) => {
  const isConfigured = !!process.env.MINIMAX_API_KEY;
  res.json({
    configured: isConfigured,
    mode: isConfigured ? 'api' : 'mock',
  });
});

export default router;
