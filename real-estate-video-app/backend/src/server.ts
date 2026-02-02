import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Routes
import scriptRoutes from './routes/script';
import ttsRoutes from './routes/tts';
import uploadRoutes from './routes/upload';
import videoRoutes from './routes/video';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads and renders)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/renders', express.static(path.join(process.cwd(), 'renders')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      minimax: !!process.env.MINIMAX_API_KEY ? 'configured' : 'mock',
      openai: !!process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      elevenlabs: !!process.env.ELEVENLABS_API_KEY ? 'configured' : 'not_configured',
      supabase: !!process.env.SUPABASE_URL ? 'configured' : 'local_mode',
      remotion: !!process.env.REMOTION_ENTRY ? 'configured' : 'mock',
    },
  });
});

// API Routes
app.use('/api/script', scriptRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/video', videoRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
