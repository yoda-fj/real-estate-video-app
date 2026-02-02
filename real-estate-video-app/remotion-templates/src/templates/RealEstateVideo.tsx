import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Easing,
} from '@remotion/react';

interface Caption {
  text: string;
  startTime: number; // em segundos
  duration: number; // em segundos
}

interface RealEstateVideoProps {
  images: string[];
  narrationAudioUrl?: string;
  musicUrl?: string;
  captions?: Caption[];
  title?: string;
}

export const RealEstateVideo: React.FC<RealEstateVideoProps> = ({
  images,
  narrationAudioUrl,
  musicUrl,
  captions = [],
  title,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Duração de cada imagem (distribuí igualmente)
  const imageDuration = durationInFrames / images.length;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Áudio de narração */}
      {narrationAudioUrl && (
        <Audio src={narrationAudioUrl} volume={1} />
      )}

      {/* Música de fundo */}
      {musicUrl && (
        <Audio src={musicUrl} volume={0.3} />
      )}

      {/* Slides de imagens */}
      {images.map((imageUrl, index) => {
        const startFrame = index * imageDuration;
        const endFrame = (index + 1) * imageDuration;

        return (
          <Sequence
            key={index}
            from={Math.round(startFrame)}
            durationInFrames={Math.round(imageDuration)}
          >
            <ImageSlide
              imageUrl={imageUrl}
              index={index}
              totalImages={images.length}
            />
          </Sequence>
        );
      })}

      {/* Legendas/Captions */}
      {captions.map((caption, index) => {
        const startFrame = caption.startTime * fps;
        const durationFrames = caption.duration * fps;

        return (
          <Sequence
            key={`caption-${index}`}
            from={Math.round(startFrame)}
            durationInFrames={Math.round(durationFrames)}
          >
            <CaptionOverlay text={caption.text} />
          </Sequence>
        );
      })}

      {/* Título inicial */}
      {title && (
        <Sequence from={0} durationInFrames={fps * 3}>
          <TitleOverlay title={title} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

// Componente de slide individual
const ImageSlide: React.FC<{
  imageUrl: string;
  index: number;
  totalImages: number;
}> = ({ imageUrl, index, totalImages }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // Animação de zoom sutil (Ken Burns effect)
  const zoomProgress = frame / durationInFrames;
  const scale = interpolate(zoomProgress, [0, 1], [1, 1.1], {
    easing: Easing.linear,
  });

  // Fade in/out
  const opacity = interpolate(
    frame,
    [0, 10, durationInFrames - 10, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <Img
        src={imageUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      
      {/* Overlay gradiente para melhorar legibilidade de texto */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
        }}
      />
    </AbsoluteFill>
  );
};

// Componente de legenda
const CaptionOverlay: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();

  // Animação de entrada
  const translateY = interpolate(frame, [0, 15], [30, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: '15%',
      }}
    >
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          opacity,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '20px 30px',
          borderRadius: '12px',
          backdropFilter: 'blur(8px)',
          maxWidth: '85%',
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#fff',
            fontSize: '36px',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 500,
            textAlign: 'center',
            lineHeight: 1.4,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Componente de título inicial
const TitleOverlay: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animação de fade in/out
  const opacity = interpolate(
    frame,
    [0, 10, fps * 2, fps * 3],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <h1
        style={{
          color: '#fff',
          fontSize: '64px',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 700,
          textAlign: 'center',
          padding: '0 40px',
          textShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        {title}
      </h1>
    </AbsoluteFill>
  );
};

export default RealEstateVideo;
