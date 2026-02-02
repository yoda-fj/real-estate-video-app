import React from 'react';
import { Composition } from 'remotion';
import { DynamicVideo } from './templates/DynamicVideo';

// Root component for Remotion Studio
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DynamicVideo"
        component={DynamicVideo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          images: [
            { url: 'https://via.placeholder.com/1080x1920/667eea/ffffff?text=Image+1', duration: 3000 },
            { url: 'https://via.placeholder.com/1080x1920/764ba2/ffffff?text=Image+2', duration: 3000 },
          ],
          captions: [
            { text: 'Bem-vindo ao seu novo lar', startTime: 0, endTime: 3000 },
            { text: 'Ambiente moderno e aconchegante', startTime: 3000, endTime: 6000 },
          ],
          musicUrl: '/musics/fun-upbeat-energetic-pop-rock-345251.mp3',
          style: {
            font: 'Inter',
            fontSize: 48,
            color: '#FFFFFF',
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'bottom',
            animation: 'fade',
            transition: 'fade',
          },
        }}
      />
    </>
  );
};

export default RemotionRoot;
