# 🎬 Real Estate Video Generator

App para criar vídeos profissionais de anúncios de imóveis usando [Remotion](https://remotion.dev/).

## ✨ Templates Disponíveis

### 1. Property Showcase (1080x1920)
- **Formato:** Vertical (9:16)
- **Ideal para:** Instagram Stories, TikTok, Reels
- **Duração:** 10 segundos (300 frames)
- **Características:** Animações suaves, cards de informações, CTA no final

### 2. Luxury Showcase (1920x1080)
- **Formato:** Horizontal (16:9)
- **Ideal para:** YouTube, apresentações, site
- **Duração:** 14 segundos (420 frames)
- **Características:** Estilo premium, slides de imagens, informações detalhadas

### 3. Quick Tour (1080x1920)
- **Formato:** Vertical (9:16)
- **Ideal para:** Anúncios rápidos, ofertas especiais
- **Duração:** 6 segundos (180 frames)
- **Características:** Estilo dinâmico, batida de coração no preço, indicadores de swipe

## 🚀 Como Usar

### Instalação

```bash
cd real-estate-video
npm install
```

### Desenvolvimento

```bash
# Iniciar servidor de preview
npm run dev
```

### Renderização

```bash
# Renderizar Property Showcase
npm run build -- --compositionId=property-showcase --output=property-showcase.mp4

# Renderizar Luxury Showcase
npm run build -- --compositionId=luxury-showcase --output=luxury-showcase.mp4

# Renderizar Quick Tour
npm run build -- --compositionId=quick-tour --output=quick-tour.mp4
```

## 📝 Personalização

### Editando Propriedades Default

No arquivo `src/Root.tsx`, você pode alterar as props padrão:

```typescript
<Composition
  id="property-showcase"
  component={PropertyShowcase}
  durationInFrames={300}
  fps={30}
  width={1080}
  height={1920}
  defaultProps={{
    propertyTitle: 'Seu Título',
    propertyAddress: 'Seu Endereço',
    propertyPrice: 'R$ 1.000.000',
    // ... mais propriedades
  }}
/>
```

### Adicionando Imagens

Coloque suas imagens na pasta `public/` e referencie-as nos templates:

```typescript
<Img src={staticFile('imagem.jpg')} />
```

## 🎨 Customização de Cores

Edite os arquivos de template para alterar:
- Gradientes de fundo
- Cores de destaque
- Fontes e tamanhos
- Animações

## 📱 Formatos Recomendados

| Plataforma | Template | Resolução |
|------------|----------|-----------|
| Instagram Reels | Property Showcase | 1080x1920 |
| TikTok | Property Showcase | 1080x1920 |
| YouTube Shorts | Property Showcase | 1080x1920 |
| YouTube | Luxury Showcase | 1920x1080 |
| Site | Luxury Showcase | 1920x1080 |
| Anúncios | Quick Tour | 1080x1920 |

## 🛠️ Tecnologias

- [Remotion](https://remotion.dev/) - Vídeos via React
- React + TypeScript
- Framer Motion - Animações

## 📄 Licença

MIT
