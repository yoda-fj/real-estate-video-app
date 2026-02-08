# 🎬 Real Estate Video Generator

Complete application for creating professional real estate listing videos with AI-powered narration.

## 📋 Overview

This project provides a full-stack solution for generating promotional videos for real estate listings. It combines image uploads, music selection, AI narration, and video rendering into a seamless workflow.

### ✨ Key Features

- 📸 **Multi-Image Upload** - Drag & drop interface for property images
- 🎵 **Music Library** - Pre-selected background music tracks
- 🔊 **AI Narration** - Text-to-speech using OpenAI/ElevenLabs/Minimax
- 📝 **Auto-Generated Captions** - Synchronized with narration
- 🎬 **Real-time Preview** - See your video before rendering
- ⬇️ **Video Export** - High-quality MP4 output via Remotion
- 🔐 **User Authentication** - Secure access via Supabase Auth
- 📊 **Project Dashboard** - Manage multiple video projects

## 🏗️ Architecture

### Project Structure

```
real-estate-video-app/
├── frontend/              # Next.js 14 App (React 18)
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # Reusable React components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and configurations
│   └── package.json
│
├── backend/              # Express.js API Server
│   ├── src/
│   │   ├── routes/       # API endpoint definitions
│   │   ├── services/     # Business logic
│   │   └── middleware/   # Security & validation
│   └── package.json
│
├── remotion-templates/   # Remotion Video Templates
│   ├── src/
│   │   ├── templates/    # Video composition components
│   │   └── Root.tsx      # Remotion configuration
│   └── package.json
│
├── render-server/        # Remotion Rendering Service
│   └── src/
│       └── index.ts      # Render server entry point
│
└── shared/               # Shared TypeScript types
    └── types/
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database and storage)
- Optional: OpenAI/ElevenLabs API key for TTS

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yoda-fj/real-estate-video-app.git
   cd real-estate-video-app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend && npm install && cd ..

   # Install backend dependencies
   cd backend && npm install && cd ..

   # Install remotion templates
   cd remotion-templates && npm install && cd ..
   ```

3. **Configure environment variables**

   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

   **Backend** (`backend/.env`):
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   
   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   STORAGE_BUCKET=project-images
   
   # TTS Providers (choose one or more)
   OPENAI_API_KEY=your_openai_key
   ELEVENLABS_API_KEY=your_elevenlabs_key
   MINIMAX_API_KEY=your_minimax_key
   
   # Optional: Local storage
   LOCAL_UPLOAD_DIR=./uploads/images
   ```

4. **Setup Supabase Database**
   ```bash
   # Run the SQL migration in your Supabase dashboard
   # See supabase-setup.sql for schema
   ```

5. **Run the application**

   **Development mode:**
   ```bash
   # Terminal 1: Run backend
   cd backend && npm run dev

   # Terminal 2: Run frontend
   cd frontend && npm run dev
   ```

   Access the app at: http://localhost:3000

## 🔒 Security Features

This application implements several security best practices:

### ✅ Implemented Security Measures

- **Rate Limiting** - Prevents API abuse (configurable per endpoint)
- **Security Headers** - XSS, clickjacking, MIME-sniffing protection
- **Input Validation** - Zod schemas for all API inputs
- **File Validation** - Magic number checking for uploaded images
- **Path Traversal Protection** - Sanitized file paths
- **CORS Configuration** - Restricted origin access
- **No Sensitive Data Exposure** - API keys never sent to client

### 🔐 Security Recommendations

For production deployment:

1. **Use HTTPS** - Always serve over encrypted connections
2. **Environment Variables** - Never commit `.env` files
3. **Redis for Rate Limiting** - Replace in-memory store
4. **CDN for Static Assets** - Don't serve uploads from API server
5. **Database RLS** - Enable Row Level Security in Supabase
6. **API Authentication** - Verify JWT tokens on all endpoints
7. **Regular Updates** - Keep dependencies current

## 📦 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | Next.js 14, React 18 | Modern web framework with SSR |
| Backend | Express.js, TypeScript | RESTful API server |
| Database | Supabase (PostgreSQL) | User data, projects, metadata |
| Storage | Supabase Storage | Image and video files |
| Authentication | Supabase Auth | User management |
| Video Rendering | Remotion | Programmatic video generation |
| TTS | OpenAI/ElevenLabs/Minimax | AI voice narration |
| UI Components | Radix UI, Tailwind CSS | Accessible, styled components |
| Validation | Zod | Runtime type checking |

## 🎨 User Workflow

1. **Sign Up / Login** - Authenticate via Supabase
2. **Create Project** - Start a new video project
3. **Upload Images** - Add property photos (drag & drop)
4. **Select Music** - Choose background track
5. **Write Script** - Enter property description
6. **Enable Narration** (Optional) - Generate AI voice-over
7. **Preview Video** - See a quick preview
8. **Generate Video** - Render final high-quality MP4
9. **Download** - Save or share your video

## 🛠️ API Endpoints

### Upload
- `POST /api/upload/images` - Upload multiple images
- `DELETE /api/upload/:path` - Delete an image
- `GET /api/upload/url/:path` - Get signed URL for image

### Script Generation
- `POST /api/script/generate` - Generate property description (AI)

### Text-to-Speech
- `POST /api/tts/generate` - Generate narration audio
- `POST /api/tts/preview` - Preview TTS voice

### Video Rendering
- `POST /api/video/render` - Start video rendering
- `GET /api/video/progress/:jobId` - Check render progress
- `GET /api/video/jobs` - List active render jobs

## 🧪 Development

### Running Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

### Building for Production
```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build

# Build remotion templates
cd remotion-templates && npm run build
```

## 📝 Code Quality

### TypeScript Configuration
- Strict mode enabled for type safety
- Shared types in `/shared` directory
- Proper interface definitions

### Code Style
- ESLint configured for code consistency
- Prettier for automatic formatting
- Clear naming conventions

## 🐛 Troubleshooting

### Common Issues

**Upload fails:**
- Check file size limits (10MB default)
- Verify MIME type is supported (JPEG, PNG, WEBP)
- Ensure Supabase storage bucket exists

**Video render fails:**
- Check Remotion configuration
- Verify all image URLs are accessible
- Review backend logs for errors

**TTS not working:**
- Verify API keys are set correctly
- Check provider-specific quotas/limits
- Review console for error messages

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Open a GitHub issue
- Check existing documentation
- Review error logs for details

---

**Note:** This project was created to demonstrate full-stack development with modern web technologies. It showcases best practices for security, code organization, and user experience.
