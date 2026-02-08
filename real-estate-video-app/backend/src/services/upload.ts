/**
 * Upload Service - Supabase Storage
 * Gerencia upload de imagens e vídeos
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { validateFileContent, sanitizeFilename } from '../middleware/security';

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
}

export interface ImageUploadOptions {
  file: Buffer;
  filename: string;
  contentType: string;
  userId: string;
  projectId?: string;
}

export class UploadService {
  private supabase;
  private bucketName: string;

  constructor() {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    this.bucketName = process.env.STORAGE_BUCKET || 'project-images';

    if (!url || !key) {
      console.warn('⚠️ Credenciais Supabase não configuradas. Upload usará modo local.');
      this.supabase = null;
    } else {
      this.supabase = createClient(url, key);
    }
  }

  /**
   * Faz upload de uma imagem
   */
  async uploadImage(options: ImageUploadOptions): Promise<UploadResult> {
    const { file, filename, contentType, userId, projectId } = options;

    // Validate file content (check magic numbers)
    if (!validateFileContent(file, contentType)) {
      throw new Error('Invalid file content. File does not match declared MIME type.');
    }

    // Gera path único
    const timestamp = Date.now();
    const sanitizedFilename = sanitizeFilename(filename);
    const storagePath = projectId
      ? `${userId}/${projectId}/${timestamp}_${sanitizedFilename}`
      : `${userId}/${timestamp}_${sanitizedFilename}`;

    if (this.supabase) {
      return this.uploadToSupabase(file, storagePath, contentType);
    } else {
      return this.saveLocally(file, storagePath);
    }
  }

  /**
   * Faz upload de múltiplas imagens
   */
  async uploadMultipleImages(
    files: Array<{ buffer: Buffer; filename: string; contentType: string }>,
    userId: string,
    projectId?: string
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadImage({
          file: file.buffer,
          filename: file.filename,
          contentType: file.contentType,
          userId,
          projectId,
        });
        results.push(result);
      } catch (error) {
        console.error(`Erro ao fazer upload de ${file.filename}:`, error);
        throw error;
      }
    }

    return results;
  }

  private async uploadToSupabase(
    file: Buffer,
    storagePath: string,
    contentType: string
  ): Promise<UploadResult> {
    if (!this.supabase) {
      throw new Error('Supabase não configurado');
    }

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(storagePath, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Erro no upload: ${error.message}`);
    }

    // Gera URL pública assinada (válida por 1 hora)
    const { data: urlData } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrl(storagePath, 3600);

    return {
      url: urlData?.signedUrl || '',
      path: storagePath,
      filename: path.basename(storagePath),
    };
  }

  private async saveLocally(
    file: Buffer,
    storagePath: string
  ): Promise<UploadResult> {
    const uploadDir = process.env.LOCAL_UPLOAD_DIR || './uploads/images';
    const fullPath = path.join(uploadDir, storagePath);

    // Cria diretórios se não existirem
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, file);

    return {
      url: `/uploads/images/${storagePath}`,
      path: storagePath,
      filename: path.basename(storagePath),
    };
  }

  /**
   * Remove uma imagem
   */
  async deleteImage(storagePath: string): Promise<void> {
    if (this.supabase) {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([storagePath]);

      if (error) {
        throw new Error(`Erro ao deletar: ${error.message}`);
      }
    } else {
      // Modo local
      const uploadDir = process.env.LOCAL_UPLOAD_DIR || './uploads/images';
      const fullPath = path.join(uploadDir, storagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  }

  /**
   * Gera URL pública para uma imagem
   */
  async getPublicUrl(storagePath: string): Promise<string> {
    if (this.supabase) {
      const { data } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(storagePath, 3600);

      return data?.signedUrl || '';
    }

    return `/uploads/images/${storagePath}`;
  }
}

// Singleton instance
export const uploadService = new UploadService();
