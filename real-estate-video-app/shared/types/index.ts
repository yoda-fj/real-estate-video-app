// Types compartilhados entre frontend, backend e remotion

export interface Music {
  id: string;
  name: string;
  artist: string;
  duration: number; // milliseconds
  url: string;
  category: 'ambient' | 'upbeat' | 'cinematic' | 'corporate';
  bpm: number;
  previewUrl?: string;
}

export interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  duration: number; // milliseconds this image stays on screen
  order: number;
}

export interface VideoProject {
  id: string;
  title: string;
  images: UploadedImage[];
  selectedMusic: Music | null;
  text: string;
  narrationEnabled: boolean;
  ttsVoice: string;
  captionStyle: CaptionStyle;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  generatedVideoUrl?: string;
  narrationAudioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaptionStyle {
  font: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  position: 'bottom' | 'center' | 'top';
  animation: 'fade' | 'slide' | 'typewriter';
}

export type TTSProviderType = 'openai' | 'elevenlabs' | 'huggingface' | 'replicate' | 'falai';

export interface TTSVoice {
  id: string;
  name: string;
  provider: TTSProviderType;
  gender: 'male' | 'female';
  language: string;
  previewUrl?: string;
  description?: string;
}

export interface GenerateVideoRequest {
  projectId?: string;
  images: Array<{
    url: string;
    duration: number;
  }>;
  text: string;
  musicId: string;
  narrationEnabled: boolean;
  ttsVoice?: string;
  captionStyle?: CaptionStyle;
}

export interface GenerateVideoResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedTime?: number;
  videoUrl?: string;
  error?: string;
}

export interface TTSPreviewRequest {
  text: string;
  voiceId: string;
  provider: TTSProviderType;
}

export interface TTSPreviewResponse {
  audioUrl: string;
  duration: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
