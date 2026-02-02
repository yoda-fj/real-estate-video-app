// Shared job queue for video generation
export const jobQueue = new Map<string, {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  error?: string;
}>();
