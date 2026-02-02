import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { DynamicVideo } from './templates/DynamicVideo';

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
      />
    </>
  );
};

registerRoot(RemotionRoot);

export default RemotionRoot;
