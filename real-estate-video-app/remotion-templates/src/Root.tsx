import React from 'react';
import { Composition, calculateMetadata } from 'remotion';
import { RealEstateVideo } from './templates/RealEstateVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RealEstateVideo"
        component={RealEstateVideo as any}
        durationInFrames={300} // Aumentado para 10 segundos
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          images: ['https://via.placeholder.com/1080x1920'],
          title: '',
          captions: [],
        }}
        calculateMetadata={({ props }) => {
          // Calcular duração baseado nas captions
          const captions = props.captions || [];
          let maxTime = 3; // Mínimo 3 segundos
          
          captions.forEach((cap: any) => {
            const endTime = (cap.startTime || 0) + (cap.duration || 0);
            if (endTime > maxTime) maxTime = endTime;
          });
          
          // Adicionar 1 segundo de margem
          const durationInFrames = Math.ceil((maxTime + 1) * 30);
          
          console.log('📊 Duração calculada:', durationInFrames, 'frames');
          
          return {
            durationInFrames,
          };
        }}
      />
    </>
  );
};

export default RemotionRoot;
