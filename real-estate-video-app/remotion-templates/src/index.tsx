import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { DynamicVideo } from './templates/DynamicVideo';
import { RealEstateVideo } from './templates/RealEstateVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DynamicVideo"
        component={DynamicVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          images: [],
          captions: [],
          musicUrl: '',
          style: {
            font: 'Inter, system-ui, sans-serif',
            fontSize: 48,
            color: '#FFFFFF',
            backgroundColor: 'rgba(0,0,0,0.6)',
            position: 'bottom',
            animation: 'fade',
            transition: 'fade',
          },
        }}
        calculateMetadata={({ props }) => {
          // Calcular duração baseado nas imagens e captions
          const images = props.images || [];
          const captions = props.captions || [];
          
          // Duração total das imagens em ms
          const imagesDuration = images.reduce((acc: number, img: any) => 
            acc + (img.duration || 4000), 0);
          
          // Duração máxima das captions em ms
          let maxCaptionTime = 0;
          captions.forEach((cap: any) => {
            const endTime = cap.endTime || ((cap.startTime || 0) + (cap.duration || 3000));
            if (endTime > maxCaptionTime) maxCaptionTime = endTime;
          });
          
          // Usar o maior valor + margem de 1 segundo
          const totalDurationMs = Math.max(imagesDuration, maxCaptionTime) + 1000;
          const durationInFrames = Math.ceil((totalDurationMs / 1000) * 30);
          
          console.log('📊 DynamicVideo duration calculated:', {
            imagesDuration,
            maxCaptionTime,
            totalDurationMs,
            durationInFrames,
            captionsCount: captions.length,
          });
          
          return { durationInFrames };
        }}
      />
      <Composition
        id="RealEstateVideo"
        component={RealEstateVideo as any}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          images: [],
          title: '',
          captions: [],
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);

export default RemotionRoot;
