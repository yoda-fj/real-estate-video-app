import { useVideoConfig, useAnimatedImage, interpolate, spring, delay, Sequence } from '@remotion/react';
import { useRef, useState, useEffect } from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

interface PropertyShowcaseProps {
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice: string;
  propertyArea: string;
  propertyRooms: string;
  propertyBathrooms: string;
  propertyGarage: string;
  description: string;
  images: string[];
}

export const PropertyShowcase: React.FC<PropertyShowcaseProps> = ({
  propertyTitle,
  propertyAddress,
  propertyPrice,
  propertyArea,
  propertyRooms,
  propertyBathrooms,
  propertyGarage,
  description,
  images = [],
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const progress = useRef(0);

  // Animações
  const titleOpacity = interpolate(progress.current, [0, 30], [0, 1]);
  const titleY = interpolate(progress.current, [0, 30], [50, 0]);

  const priceScale = spring({ fps, frame: 60, delay: 30 });
  const infoOpacity = interpolate(progress.current, [90, 120], [0, 1]);

  const descriptionOpacity = interpolate(progress.current, [150, 180], [0, 1]);

  const contactOpacity = interpolate(progress.current, [240, 270], [0, 1]);

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
      {/* Header com título e preço */}
      <Sequence from={0} duration={100}>
        <div style={{
          position: 'absolute',
          top: 120,
          left: 40,
          right: 40,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}>
          <h1 style={{
            fontSize: 56,
            fontWeight: 'bold',
            color: '#ffffff',
            margin: 0,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            {propertyTitle}
          </h1>
          <p style={{
            fontSize: 28,
            color: '#a0a0a0',
            marginTop: 16,
          }}>
            {propertyAddress}
          </p>
        </div>
      </Sequence>

      {/* Preço */}
      <Sequence from={40}>
        <div style={{
          position: 'absolute',
          top: 320,
          left: 40,
          transform: `scale(${priceScale})`,
        }}>
          <span style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#4ade80',
          }}>
            {propertyPrice}
          </span>
        </div>
      </Sequence>

      {/* Cards de informações */}
      <Sequence from={90}>
        <div style={{
          position: 'absolute',
          top: 450,
          left: 40,
          right: 40,
          display: 'flex',
          gap: 20,
          opacity: infoOpacity,
        }}>
          <InfoCard icon="📐" label="Área" value={propertyArea} />
          <InfoCard icon="🛏️" label="Quartos" value={propertyRooms} />
          <InfoCard icon="🚿" label="Banheiros" value={propertyBathrooms} />
          <InfoCard icon="🚗" label="Vagas" value={propertyGarage} />
        </div>
      </Sequence>

      {/* Descrição */}
      <Sequence from={150}>
        <div style={{
          position: 'absolute',
          top: 620,
          left: 40,
          right: 40,
          opacity: descriptionOpacity,
        }}>
          <p style={{
            fontSize: 32,
            color: '#e0e0e0',
            lineHeight: 1.5,
          }}>
            {description}
          </p>
        </div>
      </Sequence>

      {/* CTA final */}
      <Sequence from={240}>
        <div style={{
          position: 'absolute',
          bottom: 200,
          left: 40,
          right: 40,
          opacity: contactOpacity,
          textAlign: 'center',
        }}>
          <div style={{
            background: '#4ade80',
            padding: '30px 60px',
            borderRadius: 20,
            display: 'inline-block',
          }}>
            <p style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: '#1a1a2e',
              margin: 0,
            }}>
              📞 Entre em contato!
            </p>
            <p style={{
              fontSize: 28,
              color: '#1a1a2e',
              marginTop: 10,
            }}>
              (11) 1234-5678
            </p>
          </div>
        </div>
      </Sequence>

      {/* Logo/Brand */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: 40,
        fontSize: 24,
        color: '#666',
      }}>
        Sua Imobiliária
      </div>
    </AbsoluteFill>
  );
};

const InfoCard: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    padding: 24,
    borderRadius: 16,
    flex: 1,
    textAlign: 'center',
  }}>
    <div style={{ fontSize: 40, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 24, color: '#fff', fontWeight: 'bold' }}>{value}</div>
    <div style={{ fontSize: 18, color: '#a0a0a0' }}>{label}</div>
  </div>
);
