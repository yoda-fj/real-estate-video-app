import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' }));

// Diretórios
const outputDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'generated');
const tempDir = path.join(__dirname, '..', '..', 'frontend', 'temp');
const uploadsDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads');
const remotionDir = path.join(__dirname, '..', '..', 'remotion-templates');
const publicDir = path.join(__dirname, '..', '..', 'frontend', 'public');

await mkdir(outputDir, { recursive: true });
await mkdir(tempDir, { recursive: true });

// Servir arquivos temporários via HTTP para Remotion
app.use('/temp', express.static(tempDir));

// Cache do bundle (para não recompilar toda vez)
let bundledCode: string | null = null;

interface RenderRequest {
  images: Array<{ url: string; duration: number }>;
  captions: Array<{ text: string; startTime: number; endTime: number }>;
  musicUrl: string;
  narrationAudioUrl?: string;
}

// Fallback FFmpeg (quando Remotion falhar)
async function generateVideoWithFFmpeg(
  jobId: string,
  images: Array<{ url: string; duration: number }>,
  captions: Array<{ text: string; startTime: number; endTime: number }>,
  musicPath?: string
): Promise<string> {
  const videoPath = path.join(outputDir, `${jobId}.mp4`);
  
  console.log('🎬 Usando fallback FFmpeg...');

  // Download images
  for (let i = 0; i < images.length; i++) {
    const imgPath = images[i].url.startsWith('/') 
      ? path.join(uploadsDir, path.basename(images[i].url))
      : images[i].url;
    const destPath = path.join(tempDir, `img_${jobId}_${i}.jpg`);
    
    try {
      const content = await readFile(imgPath);
      await writeFile(destPath, content);
    } catch (e) {
      const response = await fetch(images[i].url);
      const buffer = await response.arrayBuffer();
      await writeFile(destPath, Buffer.from(buffer));
    }
  }

  // Build FFmpeg command (sem legendas)
  let inputArgs = '';
  images.forEach((img, i) => {
    inputArgs += ` -loop 1 -t ${img.duration / 1000} -i "${path.join(tempDir, `img_${jobId}_${i}.jpg`)}"`;
  });

  // Verificar se música existe
  let hasAudio = false;
  if (musicPath) {
    try {
      await readFile(musicPath);
      inputArgs += ` -i "${musicPath}"`;
      hasAudio = true;
    } catch (e) {
      console.log('⚠️ Arquivo de música não encontrado, gerando áudio mudo...');
      // Criar áudio mudo
      const silentPath = path.join(tempDir, `silent_${jobId}.mp3`);
      try {
        await execAsync(`ffmpeg -f lavfi -i "anullsrc=r=44100:cl=stereo" -t 1 -q:a 0 "${silentPath}"`);
        inputArgs += ` -i "${silentPath}"`;
        hasAudio = true;
      } catch (e) {
        console.error('❌ Erro ao criar áudio mudo:', e);
      }
    }
  }

  let scaleFilters = '';
  for (let i = 0; i < images.length; i++) {
    scaleFilters += `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}];`;
  }

  let concatInputs = '';
  for (let i = 0; i < images.length; i++) {
    concatInputs += `[v${i}]`;
  }

  const filterComplex = `${scaleFilters}${concatInputs}concat=n=${images.length}:v=1:a=0[outv]`;
  const audioMap = hasAudio ? `-map "[outv]" -map ${images.length}:a` : `-map "[outv]"`;
  const cmd = `ffmpeg -y${inputArgs} -filter_complex "${filterComplex}" ${audioMap} -c:v libx264 -c:a aac -shortest -pix_fmt yuv420p -preset ultrafast "${videoPath}"`;

  console.log('Executando FFmpeg...');
  console.log('Command:', cmd);
  await execAsync(cmd, { maxBuffer: 300 * 1024 * 1024, timeout: 300 });
  
  // Cleanup
  for (let i = 0; i < images.length; i++) {
    await unlink(path.join(tempDir, `img_${jobId}_${i}.jpg`)).catch(() => {});
  }

  return videoPath;
}

// Nova função usando Remotion
async function generateVideoWithRemotion(
  jobId: string,
  params: RenderRequest
): Promise<string> {
  const outputLocation = path.join(outputDir, `${jobId}.mp4`);
  
  console.log('🎬 Iniciando render com Remotion...');

  try {
    // Copiar imagens para pasta temp com nomes simples
    const localImages: Array<{ url: string; duration: number }> = [];
    for (let i = 0; i < params.images.length; i++) {
      const img = params.images[i];
      const filename = `job_${jobId}_img_${i}.jpg`;
      const localPath = path.join(tempDir, filename);
      
      // Copiar imagem do uploads
      const imgSourcePath = img.url.startsWith('/') 
        ? path.join(uploadsDir, path.basename(img.url))
        : null;
        
      if (imgSourcePath) {
        const content = await readFile(imgSourcePath);
        await writeFile(localPath, content);
      } else {
        const response = await fetch(img.url);
        const buffer = await response.arrayBuffer();
        await writeFile(localPath, Buffer.from(buffer));
      }
      
      // Usar URL HTTP via nosso endpoint /temp
      localImages.push({
        url: `http://localhost:${PORT}/temp/${filename}`,
        duration: img.duration,
      });
    }

    // Copiar música (se existir)
    let musicHttpUrl: string | undefined;
    if (params.musicUrl) {
      const musicFilename = `job_${jobId}_music.mp3`;
      const localMusicPath = path.join(tempDir, musicFilename);
      const musicSourcePath = params.musicUrl.startsWith('/')
        ? path.join(publicDir, params.musicUrl)
        : null;
        
      if (musicSourcePath) {
        try {
          const content = await readFile(musicSourcePath);
          await writeFile(localMusicPath, content);
          musicHttpUrl = `http://localhost:${PORT}/temp/${musicFilename}`;
        } catch (e) {
          console.log('⚠️ Arquivo de música não encontrado, continuando sem música...');
        }
      } else {
        try {
          const response = await fetch(params.musicUrl);
          const buffer = await response.arrayBuffer();
          await writeFile(localMusicPath, Buffer.from(buffer));
          musicHttpUrl = `http://localhost:${PORT}/temp/${musicFilename}`;
        } catch (e) {
          console.log('⚠️ Falha ao baixar música, continuando sem música...');
        }
      }
    }

    // Bundle do projeto Remotion (apenas na primeira vez)
    if (!bundledCode) {
      console.log('📦 Bundleando Remotion...');
      bundledCode = await bundle({
        entryPoint: path.join(remotionDir, 'src', 'index.tsx'),
        webpackOverride: (config) => config,
      });
    }

    // Calcular duração total em frames
    const totalDurationMs = params.images.reduce((acc, img) => acc + img.duration, 0);
    const durationInFrames = Math.ceil((totalDurationMs / 1000) * 30);

    // Preparar props
    const inputProps = {
      images: localImages,
      captions: params.captions || [],
      musicUrl: musicHttpUrl,
      narrationAudio: params.narrationAudioUrl 
        ? `http://localhost:${PORT}/temp/job_${jobId}_narration.mp3` 
        : undefined,
      style: {
        font: 'Inter, system-ui, sans-serif',
        fontSize: 56,
        color: '#FFFFFF',
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'bottom',
        animation: 'fade',
        transition: 'fade',
      },
      durationInFrames,
    };

    console.log('🎞️ Selecionando composição...');
    const composition = await selectComposition({
      serveUrl: bundledCode,
      id: 'DynamicVideo',
      inputProps,
    });

    console.log('🎥 Renderizando vídeo com legendas...');
    await renderMedia({
      composition,
      serveUrl: bundledCode,
      codec: 'h264',
      outputLocation,
      inputProps,
      concurrency: 4,
      timeoutInMilliseconds: 300000,
      onProgress: ({ progress }) => {
        console.log(`Progresso: ${Math.round(progress * 100)}%`);
      },
    });

    console.log('✅ Renderização Remotion concluída!');
    
    // Cleanup temp files
    for (let i = 0; i < params.images.length; i++) {
      await unlink(path.join(tempDir, `job_${jobId}_img_${i}.jpg`)).catch(() => {});
    }
    if (musicHttpUrl) {
      await unlink(path.join(tempDir, `job_${jobId}_music.mp3`)).catch(() => {});
    }
    
    return outputLocation;
    
  } catch (error) {
    console.error('❌ Erro no Remotion:', error);
    console.log('⚠️ Tentando fallback com FFmpeg (sem legendas)...');
    
    // Fallback para FFmpeg
    let musicPath: string | undefined;
    if (params.musicUrl) {
      const musicFilePath = path.join(tempDir, `music_${jobId}.mp3`);
      const musicSourcePath = params.musicUrl.startsWith('/')
        ? path.join(publicDir, params.musicUrl)
        : null;
      
      if (musicSourcePath) {
        try {
          const content = await readFile(musicSourcePath);
          await writeFile(musicFilePath, content);
          musicPath = musicFilePath;
        } catch (e) {
          console.log('⚠️ Arquivo de música não encontrado');
        }
      }
    }
    
    return generateVideoWithFFmpeg(jobId, params.images, params.captions, musicPath);
  }
}

// Endpoint de render
app.post('/api/render', async (req, res) => {
  try {
    const { images, captions, musicUrl, narrationAudioUrl } = req.body as RenderRequest;
    console.log(`📨 Render request: ${images?.length || 0} images, ${captions?.length || 0} captions`);

    if (!images || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const jobId = uuidv4();
    console.log(`🆔 Job ID: ${jobId}`);

    const videoPath = await generateVideoWithRemotion(jobId, {
      images,
      captions: captions || [],
      musicUrl,
      narrationAudioUrl,
    });

    const stats = await readFile(videoPath).then(buf => ({ size: buf.length }));
    console.log(`✅ Sucesso: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    res.json({ 
      jobId, 
      status: 'completed', 
      videoUrl: `/generated/${jobId}.mp4`,
      size: stats.size,
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to render video',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'render-server',
    remotion: 'enabled',
    ffmpeg: 'fallback-available',
  });
});

app.listen(PORT, () => {
  console.log(`\n🎬 Render Server com Remotion`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});
