import React, { useMemo } from 'react';
import {
  useVideoConfig,
  useCurrentFrame,
  Audio,
  Img,
  AbsoluteFill,
  interpolate,
  Easing,
  useCurrentScale,
} from 'remotion';

interface DynamicVideoProps {
  images: Array<{
    url: string;
    duration: number;
  }>;
  captions: Array<{
    text: string;
    startTime: number;
    endTime: number;
  }>;
  narrationAudio?: string;
  musicUrl: string;
  style: {
    font: string;
    fontSize: number;
    color: string;
    backgroundColor: string;
    position: 'bottom' | 'center' | 'top';
    animation: 'fade' | 'slide' | 'typewriter';
    transition: 'slide' | 'fade' | 'zoom';
  };
}

// Constantes para animações
const FADE_IN_FRAMES = 15; // 0.5s @ 30fps
const FADE_OUT_FRAMES = 15;
const TRANSITION_FRAMES = 20; // ~0.67s para transição entre imagens

export const DynamicVideo: React.FC<DynamicVideoProps> = ({
  images,
  captions,
  narrationAudio,
  musicUrl,
  style,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Tempo atual em ms
  const currentTimeMs = useMemo(() => (frame / fps) * 1000, [frame, fps]);

  // Calcular informações da imagem atual com base no tempo
  const currentImageInfo = useMemo(() => {
    let accumulatedTime = 0;
    
    for (let i = 0; i < images.length; i++) {
      const imageStartTime = accumulatedTime;
      const imageEndTime = accumulatedTime + images[i].duration;
      
      if (currentTimeMs >= imageStartTime && currentTimeMs < imageEndTime) {
        const progressInImage = (currentTimeMs - imageStartTime) / images[i].duration;
        const frameInImage = (currentTimeMs - imageStartTime) / 1000 * fps;
        return {
          index: i,
          progress: progressInImage,
          frameInImage,
          isFirst: i === 0,
          isLast: i === images.length - 1,
        };
      }
      
      accumulatedTime += images[i].duration;
    }
    
    // Última imagem
    return {
      index: images.length - 1,
      progress: 1,
      frameInImage: images[images.length - 1]?.duration / 1000 * fps || 0,
      isFirst: images.length === 1,
      isLast: true,
    };
  }, [currentTimeMs, images, fps]);

  // Encontrar legenda atual
  const currentCaption = useMemo(() => {
    return captions.find(
      (c) => currentTimeMs >= c.startTime && currentTimeMs < c.endTime
    );
  }, [currentTimeMs, captions]);

  // Calcular opacidade da legenda com fade suave
  const captionStyle = useMemo(() => {
    if (!currentCaption) {
      return { opacity: 0, transform: 'translateY(20px)' };
    }
    
    const captionDuration = currentCaption.endTime - currentCaption.startTime;
    const timeInCaption = currentTimeMs - currentCaption.startTime;
    const fadeDuration = Math.min(400, captionDuration * 0.2); // 20% do tempo ou max 400ms
    
    let opacity = 1;
    let translateY = 0;
    
    // Fade in
    if (timeInCaption < fadeDuration) {
      opacity = timeInCaption / fadeDuration;
      translateY = 20 * (1 - opacity);
    }
    // Fade out
    else if (timeInCaption > captionDuration - fadeDuration) {
      opacity = (captionDuration - timeInCaption) / fadeDuration;
      translateY = -10 * (1 - opacity);
    }
    
    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      transform: `translateY(${translateY}px)`,
    };
  }, [currentCaption, currentTimeMs]);

  // Estilo da posição da legenda
  const captionPositionStyle = useMemo(() => {
    switch (style.position) {
      case 'top':
        return { top: '10%' };
      case 'center':
        return { top: '50%', transform: `translateY(-50%) ${captionStyle.transform}` };
      case 'bottom':
      default:
        return { bottom: '15%' };
    }
  }, [style.position, captionStyle.transform]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Background Music */}
      {musicUrl && (
        <Audio 
          src={musicUrl} 
          volume={0.5}
          startFrom={0}
        />
      )}

      {/* Narration Audio */}
      {narrationAudio && (
        <Audio 
          src={narrationAudio} 
          volume={1}
        />
      )}

      {/* Images com transições suaves */}
      {images.map((image, index) => {
        const imageInfo = (() => {
          let accumulatedTime = 0;
          for (let i = 0; i < images.length; i++) {
            const imageStartTime = accumulatedTime;
            const imageEndTime = accumulatedTime + images[i].duration;
            if (currentTimeMs >= imageStartTime && currentTimeMs < imageEndTime) {
              return {
                currentIndex: i,
                startTime: imageStartTime,
                endTime: imageEndTime,
              };
            }
            accumulatedTime += images[i].duration;
          }
          return {
            currentIndex: images.length - 1,
            startTime: accumulatedTime - images[images.length - 1].duration,
            endTime: accumulatedTime,
          };
        })();

        const isCurrent = index === imageInfo.currentIndex;
        const isPrev = index === imageInfo.currentIndex - 1;
        const isNext = index === imageInfo.currentIndex + 1;
        
        // Tempo desde o início desta imagem
        const timeSinceImageStart = currentTimeMs - imageInfo.startTime;
        const timeUntilImageEnd = imageInfo.endTime - currentTimeMs;
        
        // Calcular opacidade baseada nas transições
        let opacity = 0;
        let transform = 'translateX(0) scale(1)';
        
        if (isCurrent) {
          // Imagem atual sempre visível
          opacity = 1;
          
          // Transição suave no início
          if (timeSinceImageStart < 300) {
            const fadeProgress = timeSinceImageStart / 300;
            
            if (style.transition === 'fade') {
              opacity = fadeProgress;
            } else if (style.transition === 'slide') {
              const slideX = (1 - fadeProgress) * 100;
              transform = `translateX(${slideX}px) scale(1)`;
            } else if (style.transition === 'zoom') {
              const scale = 1 + (1 - fadeProgress) * 0.1;
              opacity = fadeProgress;
              transform = `scale(${scale})`;
            }
          }
          
          // Transição suave no final (preparar próxima)
          if (timeUntilImageEnd < 300 && !imageInfo.currentIndex === images.length - 1) {
            const fadeProgress = timeUntilImageEnd / 300;
            
            if (style.transition === 'fade') {
              opacity = fadeProgress;
            } else if (style.transition === 'slide') {
              const slideX = (1 - fadeProgress) * -50;
              transform = `translateX(${slideX}px) scale(1)`;
            } else if (style.transition === 'zoom') {
              const scale = 1 - (1 - fadeProgress) * 0.05;
              opacity = fadeProgress;
              transform = `scale(${scale})`;
            }
          }
        } else if (isPrev && timeSinceImageStart < 300) {
          // Imagem anterior saindo
          const fadeProgress = timeSinceImageStart / 300;
          
          if (style.transition === 'fade') {
            opacity = 1 - fadeProgress;
          } else if (style.transition === 'slide') {
            opacity = 1 - fadeProgress * 0.5;
            const slideX = fadeProgress * -100;
            transform = `translateX(${slideX}px) scale(1)`;
          } else if (style.transition === 'zoom') {
            opacity = 1 - fadeProgress;
            const scale = 1 - fadeProgress * 0.1;
            transform = `scale(${scale})`;
          }
        }

        // Só renderizar se tiver visibilidade
        if (opacity <= 0.01) return null;

        return (
          <AbsoluteFill
            key={index}
            style={{
              opacity,
              transform,
              transition: 'none', // Remotion controla frame a frame
            }}
          >
            <Img
              src={image.url}
              alt={`Slide ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </AbsoluteFill>
        );
      })}

      {/* Gradient Overlay - sempre presente para melhor legibilidade */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.6) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Caption com fade suave */}
      {currentCaption && captionStyle.opacity > 0.01 && (
        <AbsoluteFill
          style={{
            ...captionPositionStyle,
            display: 'flex',
            justifyContent: 'center',
            alignItems: style.position === 'center' ? 'center' : 'flex-start',
            padding: '0 48px',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: style.backgroundColor || 'rgba(0,0,0,0.65)',
              padding: '24px 40px',
              borderRadius: '20px',
              maxWidth: '85%',
              opacity: captionStyle.opacity,
              transform: style.position === 'center' 
                ? `translateY(-50%) ${captionStyle.transform}` 
                : captionStyle.transform,
              transition: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <p
              style={{
                fontFamily: style.font || 'Inter, system-ui, sans-serif',
                fontSize: style.fontSize || 52,
                color: style.color || '#FFFFFF',
                textAlign: 'center',
                margin: 0,
                lineHeight: 1.4,
                fontWeight: 600,
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                letterSpacing: '0.3px',
              }}
            >
              {currentCaption.text}
            </p>
          </div>
        </AbsoluteFill>
      )}

      {/* Indicador de progresso sutil (dots) */}
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          bottom: '5%',
          top: 'auto',
          height: '20px',
          pointerEvents: 'none',
        }}
      >
        {images.map((_, index) => {
          const isActive = index === currentImageInfo.index;
          const isPast = index < currentImageInfo.index;
          
          return (
            <div
              key={index}
              style={{
                width: isActive ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: isActive 
                  ? 'rgba(255,255,255,0.9)' 
                  : isPast 
                    ? 'rgba(255,255,255,0.4)' 
                    : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default DynamicVideo;
