import { useVideoConfig, useAnimatedImage, interpolate, spring, Sequence } from '@remotion/react';
import { useRef, useState, useEffect } from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

interface LuxuryShowcaseProps {
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice: string;
  propertyArea: string;
  propertyRooms: string;
  propertyFeatures: string[];
  agentName: string;
  agentPhone: string;
  agentEmail: string;
}

export const LuxuryShowcase: React.FC<LuxuryShowcaseProps> = ({
  propertyTitle,
  propertyAddress,
  propertyPrice,
  propertyArea,
  propertyRooms,
  propertyFeatures = [],
  agentName,
  agentPhone,
  agentEmail,
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a35 100%)' }}>
      {/* Vídeo de fundo / Slideshow de imagens */}
      <Sequence from={0} duration={durationInFrames}>
        <BackgroundSlideshow />
      </Sequence>

      {/* Overlay escuro */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, rgba(15,15,35,0.95) 0%, rgba(15,15,35,0.7) 50%, rgba(15,15,35,0.3) 100%)',
      }} />

      {/* Conteúdo principal */}
      <div style={{
        position: 'absolute',
        left: 60,
        top: 0,
        bottom: 0,
        width: '45%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 0',
      }}>
        {/* Badge */}
        <Sequence from={30}>
          <div style={{
            background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
            padding: '12px 24px',
            borderRadius: 30,
            display: 'inline-block',
            marginBottom: 30,
          }}>
            <span style={{ fontSize: 20, fontWeight: 'bold', color: '#0f0f23' }}>
              ✨ Imóvel Premium
            </span>
          </div>
        </Sequence>

        {/* Título */}
        <Sequence from={60}>
          <h1 style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.1,
          }}>
            {propertyTitle}
          </h1>
        </Sequence>

        {/* Endereço */}
        <Sequence from={90}>
          <p style={{
            fontSize: 28,
            color: '#d4af37',
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            📍 {propertyAddress}
          </p>
        </Sequence>

        {/* Preço */}
        <Sequence from={120}>
          <div style={{
            marginTop: 30,
            padding: '20px 30px',
            background: 'rgba(212, 175, 55, 0.15)',
            borderRadius: 16,
            border: '2px solid #d4af37',
          }}>
            <span style={{ fontSize: 18, color: '#d4af37' }}>PREÇO</span>
            <p style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#ffffff',
              margin: '10px 0 0 0',
            }}>
              {propertyPrice}
            </p>
          </div>
        </Sequence>

        {/* Especificações */}
        <Sequence from={150}>
          <div style={{
            display: 'flex',
            gap: 40,
            marginTop: 40,
          }}>
            <SpecItem icon="📐" label="Área" value={propertyArea} />
            <SpecItem icon="🛏️" label="Suítes" value={propertyRooms} />
          </div>
        </Sequence>

        {/* Features */}
        <Sequence from={180}>
          <div style={{
            marginTop: 40,
          }}>
            <p style={{ fontSize: 20, color: '#888', marginBottom: 16 }}>
              Comodidades
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {propertyFeatures.map((feature, i) => (
                <span key={i} style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '10px 20px',
                  borderRadius: 20,
                  color: '#fff',
                  fontSize: 18,
                }}>
                  ✓ {feature}
                </span>
              ))}
            </div>
          </div>
        </Sequence>

        {/* Contato do agente */}
        <Sequence from={240}>
          <div style={{
            marginTop: 50,
            padding: 30,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 20,
          }}>
            <p style={{ fontSize: 20, color: '#888', marginBottom: 16 }}>
              Fale com o corretor
            </p>
            <p style={{ fontSize: 32, fontWeight: 'bold', color: '#d4af37', margin: 0 }}>
              {agentName}
            </p>
            <p style={{ fontSize: 24, color: '#fff', marginTop: 10 }}>
              📞 {agentPhone}
            </p>
            <p style={{ fontSize: 20, color: '#888', marginTop: 5 }}>
              ✉️ {agentEmail}
            </p>
          </div>
        </Sequence>
      </div>

      {/* Logo no canto */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        right: 40,
        fontSize: 24,
        color: '#d4af37',
      }}>
        LUXURY HOMES
      </div>
    </AbsoluteFill>
  );
};

const BackgroundSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: currentSlide === i ? 1 : 0,
            transition: 'opacity 1s ease',
            background: i % 2 === 0
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          }}
        />
      ))}
    </div>
  );
};

const SpecItem: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ fontSize: 32 }}>{icon}</span>
    <div>
      <p style={{ fontSize: 16, color: '#888', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 24, color: '#fff', margin: 0, fontWeight: 'bold' }}>{value}</p>
    </div>
  </div>
);
