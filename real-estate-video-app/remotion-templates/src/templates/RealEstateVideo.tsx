import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

interface Caption {
  text: string;
  startTime: number;
  duration: number;
}

interface Props {
  images: string[];
  narrationAudioUrl?: string;
  musicUrl?: string;
  captions?: Caption[];
  title?: string;
}

export const RealEstateVideo: React.FC<Props> = ({
  images,
  narrationAudioUrl,
  musicUrl,
  captions = [],
  title,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const imageDuration = durationInFrames / images.length;

  // DEBUG
  console.log('🎬 RealEstateVideo props:', { 
    title, 
    captionsCount: captions.length,
    captions: captions.slice(0, 2),
    imagesCount: images.length 
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {narrationAudioUrl && <Audio src={narrationAudioUrl} volume={1} />}
      {musicUrl && <Audio src={musicUrl} volume={0.3} />}

      {/* Imagens */}
      {images.map((url, i) => (
        <Sequence
          key={i}
          from={Math.round(i * imageDuration)}
          durationInFrames={Math.round(imageDuration)}
        >
          <Img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Sequence>
      ))}

      {/* TÍTULO - Apenas texto, sem fundo escuro */}
      {title && (
        <Sequence from={0} durationInFrames={fps * 2}>
          <TitleCard title={title} />
        </Sequence>
      )}

      {/* LEGENDAS */}
      {captions.map((cap, i) => {
        const startFrame = Math.round(cap.startTime * fps);
        const durationFrames = Math.round(cap.duration * fps);
        
        return (
          <Sequence
            key={`caption-${i}`}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <Caption text={cap.text} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Título com fade suave
const TitleCard: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Fade in/out suave
  const opacity = interpolate(
    frame,
    [0, 15, fps * 1.5, fps * 2],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: '10%',
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity,
        zIndex: 50,
      }}
    >
      <h1
        style={{
          color: 'white',
          fontSize: 72,
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '20px 40px',
          margin: 0,
          textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'inline-block',
          borderRadius: 20,
        }}
      >
        {title}
      </h1>
    </div>
  );
};

// Legenda estilizada
const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 10, 50, 60], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '15%',
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: '25px 45px',
          borderRadius: 16,
          border: '2px solid rgba(255,255,255,0.3)',
        }}
      >
        <p
          style={{
            color: 'white',
            fontSize: 44,
            margin: 0,
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

export default RealEstateVideo;
