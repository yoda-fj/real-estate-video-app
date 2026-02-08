// Carrega variáveis de ambiente PRIMEIRO (antes de qualquer outro import)
import './load-env';

import express from 'express';
import cors from 'cors';
import path from 'path';

// Security middleware
import { securityHeaders, rateLimit } from './middleware/security';

// Routes
import scriptRoutes from './routes/script';
import ttsRoutes from './routes/tts';
import uploadRoutes from './routes/upload';
import videoRoutes from './routes/video';

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(securityHeaders);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads, renders and audio)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/renders', express.static(path.join(process.cwd(), 'renders')));
app.use('/audio', express.static(path.join(process.cwd(), 'uploads', 'audio')));

// Health check (non-revealing)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes with rate limiting
app.use('/api/script', rateLimit(50, 15 * 60 * 1000), scriptRoutes);
app.use('/api/tts', rateLimit(30, 15 * 60 * 1000), ttsRoutes);
app.use('/api/upload', rateLimit(20, 15 * 60 * 1000), uploadRoutes);
app.use('/api/video', rateLimit(10, 15 * 60 * 1000), videoRoutes);

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
