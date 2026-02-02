import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { jobQueue } from '@/lib/jobQueue';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, text, musicId, narrationAudioUrl } = body;

    console.log('Video API received:', JSON.stringify({ imagesCount: images?.length, text: text?.substring(0, 50), musicId }));

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'Images are required' },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!musicId) {
      return NextResponse.json(
        { error: 'Music ID is required' },
        { status: 400 }
      );
    }

    // Create job synchronously
    const jobId = uuidv4();
    jobQueue.set(jobId, {
      status: 'queued',
      progress: 0,
    });

    // Process synchronously (waits for completion)
    await processVideoJob(jobId, { images, text, musicId, narrationAudioUrl });

    // Return the completed job
    const job = jobQueue.get(jobId);
    console.log('Job result:', job?.status, job?.error);

    if (job?.status === 'completed') {
      return NextResponse.json({ jobId, ...job });
    } else {
      return NextResponse.json(
        { jobId, error: job?.error || 'Generation failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: `Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

async function processVideoJob(
  jobId: string,
  params: {
    images: Array<{ url: string; duration: number }>;
    text: string;
    musicId: string;
    narrationAudioUrl?: string;
  }
) {
  // Simulate processing steps with delays for feedback
  jobQueue.set(jobId, { status: 'processing', progress: 10 });
  await sleep(500);

  // Step 1: Generate captions from text
  jobQueue.set(jobId, { status: 'processing', progress: 25 });
  const captions = generateCaptionsFromText(params.text, params.images);
  await sleep(300);

  // Step 2: Call Remotion to render video
  jobQueue.set(jobId, { status: 'processing', progress: 50 });
  const videoUrl = await callRemotionRenderer({
    images: params.images,
    captions,
    musicId: params.musicId,
    narrationAudioUrl: params.narrationAudioUrl,
  });
  await sleep(500);

  // Step 3: Upload rendered video to storage (simulated)
  jobQueue.set(jobId, { status: 'processing', progress: 80 });
  await sleep(300);

  // Complete
  jobQueue.set(jobId, {
    status: 'completed',
    progress: 100,
    videoUrl: videoUrl || `/generated/${jobId}.mp4`,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateCaptionsFromText(
  text: string,
  images: Array<{ url: string; duration: number }>
): Array<{ text: string; startTime: number; endTime: number }> {
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const totalDuration = images.reduce((acc, img) => acc + img.duration, 0);
  const durationPerSentence = totalDuration / Math.max(sentences.length, 1);
  
  let currentTime = 0;
  return sentences.map((sentence, index) => {
    const startTime = currentTime;
    const endTime = currentTime + durationPerSentence;
    currentTime = endTime;
    
    return {
      text: sentence.trim(),
      startTime: Math.floor(startTime),
      endTime: Math.floor(endTime),
    };
  });
}

async function callRemotionRenderer(params: {
  images: Array<{ url: string; duration: number }>;
  captions: Array<{ text: string; startTime: number; endTime: number }>;
  musicId: string;
  narrationAudioUrl?: string;
}): Promise<string> {
  // Find music URL from music ID
  const musicUrls: Record<string, string> = {
    'sad-motivational': '/musics/sad-motivational-pop-rock-background-434657.mp3',
    'fun-upbeat': '/musics/fun-upbeat-energetic-pop-rock-345251.mp3',
    'ambient-1': '/musics/ambient-1.mp3',
    'ambient-2': '/musics/ambient-2.mp3',
    'upbeat-1': '/musics/upbeat-1.mp3',
    'upbeat-2': '/musics/upbeat-2.mp3',
    'cinematic-1': '/musics/cinematic-1.mp3',
    'cinematic-2': '/musics/cinematic-2.mp3',
    'corporate-1': '/musics/corporate-1.mp3',
    'corporate-2': '/musics/corporate-2.mp3',
  };

  const musicUrl = musicUrls[params.musicId] || musicUrls['ambient-1'];

  console.log('Chamando render server com', params.images.length, 'imagens...');

  const response = await fetch('http://localhost:3001/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      images: params.images,
      captions: params.captions,
      musicUrl,
      narrationAudioUrl: params.narrationAudioUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Render failed: ${error}`);
  }

  const data = await response.json();
  console.log('Render completo:', data.videoUrl);

  return data.videoUrl;
}

// GET endpoint to check job status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID is required' },
      { status: 400 }
    );
  }

  const job = jobQueue.get(jobId);
  
  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(job);
}
