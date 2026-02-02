import { Composition } from '@remotion/react';
import { PropertyShowcase } from './templates/PropertyShowcase';
import { LuxuryShowcase } from './templates/LuxuryShowcase';
import { QuickTour } from './templates/QuickTour';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="property-showcase"
        component={PropertyShowcase}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          propertyTitle: 'Apartamento de Luxo',
          propertyAddress: 'Av. Paulista, 1000 - São Paulo, SP',
          propertyPrice: 'R$ 2.500.000',
          propertyArea: '120m²',
          propertyRooms: '3 quartos',
          propertyBathrooms: '2 banheiros',
          propertyGarage: '2 vagas',
          description: 'Apartamento reformado com acabamento de alto padrão',
          images: [],
        }}
      />

      <Composition
        id="luxury-showcase"
        component={LuxuryShowcase}
        durationInFrames={420}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          propertyTitle: 'Mansão à Venda',
          propertyAddress: 'Alameda Santos, 500 - Jardins',
          propertyPrice: 'R$ 8.900.000',
          propertyArea: '450m²',
          propertyRooms: '5 suítes',
          propertyFeatures: ['Piscina', 'Home Theater', 'Academia', 'Jardim'],
          agentName: 'João Silva',
          agentPhone: '(11) 99999-9999',
          agentEmail: 'joao@imobiliaria.com',
        }}
      />

      <Composition
        id="quick-tour"
        component={QuickTour}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          propertyTitle: 'Casa em Condomínio',
          propertyAddress: 'Residencial Green Park',
          propertyPrice: 'R$ 890.000',
          highlightFeatures: ['Segurança 24h', 'Áreas verdes', 'Academia'],
        }}
      />
    </>
  );
};
