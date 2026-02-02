'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Video,
  Settings,
  LogOut,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Trash2,
  Download,
  Home
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Database } from '@/lib/database.types';

type VideoProject = Database['public']['Tables']['video_projects'];

export default function DashboardPage() {
  const [videos, setVideos] = useState<VideoProject['Row'][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserAndVideos();
  }, []);

  const fetchUserAndVideos = async () => {
    const supabase = getSupabaseBrowserClient();
    
    // Get current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Fetch user's videos
    const { data: videosData } = await supabase
      .from('video_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (videosData) {
      setVideos(videosData);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <MoreVertical className="w-5 h-5 text-white/40" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'processing':
        return 'Processando';
      case 'failed':
        return 'Falhou';
      default:
        return 'Rascunho';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Real Estate <span className="text-purple-400">Video</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Meus Vídeos</h2>
            <p className="text-white/50 mt-1">
              Gerencie seus vídeos de imóveis
            </p>
          </div>

          <Link
            href="/editor"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-5 h-5" />
            Novo Vídeo
          </Link>
        </div>

        {/* Videos Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-white/5 rounded-2xl border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                  {video.generated_video_url ? (
                    <video
                      src={video.generated_video_url}
                      className="w-full h-full object-cover"
                      poster=""
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
                    {getStatusIcon(video.status)}
                    <span className="text-sm text-white/80">{getStatusText(video.status)}</span>
                  </div>

                  {/* Play Button (if completed) */}
                  {video.status === 'completed' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <button className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">{video.title}</h3>
                  <p className="text-sm text-white/50 mt-1">
                    Criado em {formatDate(video.created_at)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    {video.status === 'completed' && video.generated_video_url && (
                      <>
                        <a
                          href={video.generated_video_url}
                          download
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </>
                    )}
                    
                    <Link
                      href={`/editor?id=${video.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      Editar
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 mb-6">
              <Video className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum vídeo ainda
            </h3>
            <p className="text-white/50 max-w-md mx-auto mb-8">
              Crie seu primeiro vídeo de imóvel adicionando fotos, escolhendo uma música e gerando uma narração profissional.
            </p>
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Vídeo
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
