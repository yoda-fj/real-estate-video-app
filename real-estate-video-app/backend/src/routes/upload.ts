import { Router } from 'express';
import multer from 'multer';
import { uploadService } from '../services/upload';
import { z } from 'zod';

const router = Router();

// Configuração do multer para memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use JPG, PNG ou WEBP.'));
    }
  },
});

const uploadSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
});

/**
 * POST /api/upload/images
 * Faz upload de imagens
 */
router.post('/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem enviada',
      });
    }

    const { userId, projectId } = uploadSchema.parse(req.body);

    const files = req.files.map((file) => ({
      buffer: file.buffer,
      filename: file.originalname,
      contentType: file.mimetype,
    }));

    const results = await uploadService.uploadMultipleImages(files, userId, projectId);

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer upload',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/upload/:path
 * Remove uma imagem
 */
router.delete('/:path(*)', async (req, res) => {
  try {
    const storagePath = req.params.path;
    
    await uploadService.deleteImage(storagePath);

    res.json({
      success: true,
      message: 'Imagem removida com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover imagem',
      message: error.message,
    });
  }
});

/**
 * GET /api/upload/url/:path
 * Gera URL assinada para uma imagem
 */
router.get('/url/:path(*)', async (req, res) => {
  try {
    const storagePath = req.params.path;
    const url = await uploadService.getPublicUrl(storagePath);

    res.json({
      success: true,
      data: { url },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
