/**
 * Text-to-Speech Service
 * Suporta OpenAI TTS e ElevenLabs
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';

export interface TTSOptions {
  text: string;
  voice?: string;
  speed?: number;
  provider?: 'openai' | 'elevenlabs';
}

export interface TTSResult {
  audioUrl: string;
  duration: number;
  provider: string;
}

// Vozes disponíveis
export const AVAILABLE_VOICES = {
  openai: [
    { id: 'alloy', name: 'Alloy', description: 'Neutro, versátil' },
    { id: 'echo', name: 'Echo', description: 'Masculino, profundo' },
    { id: 'fable', name: 'Fable', description: 'Masculino, britânico' },
    { id: 'onyx', name: 'Onyx', description: 'Masculino, forte' },
    { id: 'nova', name: 'Nova', description: 'Feminino, suave' },
    { id: 'shimmer', name: 'Shimmer', description: 'Feminino, claro' },
  ],
  elevenlabs: [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Feminino, natural' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Feminino, forte' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Feminino, suave' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Masculino, profundo' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Feminino, jovem' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Masculino, jovem' },
  ],
};

export class TTSService {
  private openai: OpenAI | null = null;
  private elevenlabsKey: string;
  private uploadDir: string;

  constructor() {
    const openaiKey = process.env.OPENAI_API_KEY;
    this.elevenlabsKey = process.env.ELEVENLABS_API_KEY || '';
    this.uploadDir = process.env.UPLOAD_DIR || './uploads/audio';

    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    } else {
      console.warn('⚠️ OPENAI_API_KEY não configurada. TTS usará modo mock.');
    }

    // Garante que o diretório existe
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Gera áudio a partir de texto
   */
  async generateAudio(options: TTSOptions): Promise<TTSResult> {
    const { 
      text, 
      voice = 'alloy', 
      speed = 1.0,
      provider = 'openai' 
    } = options;

    // Validações
    if (!text || text.trim().length === 0) {
      throw new Error('Texto não pode estar vazio');
    }

    if (text.length > 4000) {
      throw new Error('Texto muito longo (máx 4000 caracteres)');
    }

    // Gera nome único para o arquivo
    const filename = `tts_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
    const filepath = path.join(this.uploadDir, filename);

    try {
      if (provider === 'elevenlabs' && this.elevenlabsKey) {
        return await this.generateWithElevenLabs(text, voice, filepath);
      } else if (this.openai) {
        return await this.generateWithOpenAI(text, voice, speed, filepath);
      } else {
        return this.getMockAudio();
      }
    } catch (error) {
      console.error('Erro ao gerar áudio:', error);
      throw new Error('Falha ao gerar narração. Tente novamente.');
    }
  }

  private async generateWithOpenAI(
    text: string, 
    voice: string, 
    speed: number,
    filepath: string
  ): Promise<TTSResult> {
    if (!this.openai) {
      throw new Error('OpenAI não configurado');
    }

    const response = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as any,
      input: text,
      speed: speed,
      response_format: 'mp3',
    });

    // Salva o arquivo
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    // Estima duração (aproximadamente 150 palavras por minuto)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60;

    return {
      audioUrl: `/audio/${path.basename(filepath)}`,
      duration: Math.round(estimatedDuration),
      provider: 'openai',
    };
  }

  private async generateWithElevenLabs(
    text: string,
    voiceId: string,
    filepath: string
  ): Promise<TTSResult> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenlabsKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(audioBuffer));

    // Estima duração
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60;

    return {
      audioUrl: `/audio/${path.basename(filepath)}`,
      duration: Math.round(estimatedDuration),
      provider: 'elevenlabs',
    };
  }

  private getMockAudio(): TTSResult {
    return {
      audioUrl: '/audio/mock-narration.mp3',
      duration: 30,
      provider: 'mock',
    };
  }

  /**
   * Retorna as vozes disponíveis
   */
  getAvailableVoices() {
    return {
      openai: AVAILABLE_VOICES.openai,
      elevenlabs: this.elevenlabsKey ? AVAILABLE_VOICES.elevenlabs : [],
    };
  }

  /**
   * Estima a duração de uma narração
   */
  estimateDuration(text: string): number {
    const wordCount = text.split(/\s+/).length;
    return Math.round((wordCount / 150) * 60);
  }
}

// Singleton instance
export const ttsService = new TTSService();
