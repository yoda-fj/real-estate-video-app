import { useVideoConfig, useAnimatedImage, interpolate, spring, Sequence } from '@remotion/react';
import { useRef, useState, useEffect } from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

interface QuickTourProps {
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice: string;
  highlightFeatures: string[];
}

export const QuickTour: React.FC<QuickTourProps> = ({
  propertyTitle,
  propertyAddress,
  propertyPrice,
  highlightFeatures = [],
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  // Animação de batida de coração
  const heartBeat = interpolate(
    Math.floor(durationInFrames / fps * 1000) % 2000,
    [0, 500, 1000, 1500, 2000],
    [1, 1.1, 1, 1.1, 1]
  );

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* Vídeo de fundo */}
      <Sequence from={0} duration={durationInFrames}>
        <BackgroundVideo />
      </Sequence>

      {/* Gradiente inferior para texto */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
      }} />

      {/* Título */}
      <Sequence from={10} duration={60}>
        <div style={{
          position: 'absolute',
          bottom: 400,
          left: 40,
          right: 40,
        }}>
          <h1 style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#fff',
            margin: 0,
            textShadow: '2px 2px 10px rgba(0,0,0,0.5)',
          }}>
            {propertyTitle}
          </h1>
          <p style={{
            fontSize: 28,
            color: '#ff6b6b',
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            📍 {propertyAddress}
          </p>
        </div>
      </Sequence>

      {/* Preço */}
      <Sequence from={50} duration={80}>
        <div style={{
          position: 'absolute',
          bottom: 280,
          left: 40,
          right: 40,
          transform: `scale(${heartBeat})`,
        }}>
          <span style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: '#4ade80',
            textShadow: '2px 2px 10px rgba(0,0,0,0.5)',
          }}>
            {propertyPrice}
          </span>
        </div>
      </Sequence>

      {/* Features highlights */}
      <Sequence from={100} duration={60}>
        <div style={{
          position: 'absolute',
          bottom: 160,
          left: 40,
          right: 40,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          {highlightFeatures.map((feature, i) => (
            <span key={i} style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              padding: '12px 20px',
              borderRadius: 30,
              color: '#fff',
              fontSize: 22,
              border: '1px solid rgba(255,255,255,0.3)',
            }}>
              {feature}
            </span>
          ))}
        </div>
      </Sequence>

      {/* CTA */}
      <Sequence from={140}>
        <div style={{
          position: 'absolute',
          bottom: 60,
          left: 40,
          right: 40,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a5a)',
            padding: '24px',
            borderRadius: 16,
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(255,107,107,0.4)',
          }}>
            <p style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: '#fff',
              margin: 0,
            }}>
              🔥 Corra! Agende sua visita!
              <span style={{
                display: 'block',
                fontSize: 18,
                color: 'rgba(255,255,255,0.9)',
                marginTop: 8,
              }}>
                Última oferta disponível
              </span>
            </p>
          </div>
        </div>
      </Sequence>

      {/* Música/Som indicator */}
      <div style={{
        position: 'absolute',
        top: 40,
        right: 40,
        background: 'rgba(0,0,0,0.5)',
        padding: '10px 20px',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontSize: 24 }}>🔊</span>
        <span style={{ color: '#fff', fontSize: 18 }}>Som original</span>
      </div>

      {/* Swipe indicator */}
      <Sequence from={20} duration={140}>
        <div style={{
          position: 'absolute',
          top: '50%',
          right: 20,
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 30 }}>👆</span>
          </div>
          <span style={{ color: '#fff', fontSize: 14 }}>Puxe para ver mais</span>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

const BackgroundVideo = () => {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const backgrounds = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  ];

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {backgrounds.map((bg, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: slide === i ? 1 : 0,
            transition: 'opacity 0.8s ease',
            background: bg,
          }}
        />
      ))}
      {/* Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.03) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,255,255,0.03) 50px)',
      }} />
    </div>
  );
};
