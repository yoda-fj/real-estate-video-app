/**
 * MiniMax API Service for AI script generation
 * Documentação: https://www.minimaxi.com/document
 */

export interface ScriptGenerationParams {
  propertyDescription: string;
  targetAudience?: string;
  style?: 'professional' | 'casual' | 'luxury' | 'family';
  duration?: number; // in seconds
  language?: string;
}

export interface ScriptResult {
  script: string;
  highlights: string[];
  suggestedDuration: number;
}

const MINIMAX_API_URL = 'https://api.minimaxi.chat/v1/text/chatcompletion_v2';

export class MiniMaxService {
  private apiKey: string;
  private groupId: string;

  constructor() {
    this.apiKey = process.env.MINIMAX_API_KEY || '';
    this.groupId = process.env.MINIMAX_GROUP_ID || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ MINIMAX_API_KEY não configurada. Usando modo mock.');
    }
  }

  /**
   * Gera um script profissional para vídeo de imóvel
   */
  async generateScript(params: ScriptGenerationParams): Promise<ScriptResult> {
    const { 
      propertyDescription, 
      targetAudience = 'compradores gerais',
      style = 'professional',
      duration = 60,
      language = 'pt-BR'
    } = params;

    // Se não tiver API key, retorna mock
    if (!this.apiKey) {
      return this.getMockScript(params);
    }

    try {
      const prompt = this.buildPrompt(propertyDescription, targetAudience, style, duration, language);
      
      const response = await fetch(MINIMAX_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'MiniMax-Text-01',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em marketing imobiliário que cria scripts persuasivos para vídeos de vendas de imóveis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`MiniMax API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const generatedText = data.choices?.[0]?.message?.content || '';
      
      return this.parseScriptResponse(generatedText, duration);
    } catch (error) {
      console.error('Erro ao gerar script:', error);
      // Fallback para mock em caso de erro
      return this.getMockScript(params);
    }
  }

  private buildPrompt(
    description: string, 
    targetAudience: string, 
    style: string, 
    duration: number,
    language: string
  ): string {
    const styleGuide: Record<string, string> = {
      professional: 'tom profissional e confiável, focado em detalhes técnicos e qualidade',
      casual: 'tom descontraído e amigável, como uma conversa entre amigos',
      luxury: 'tom sofisticado e exclusivo, destacando elegância e prestígio',
      family: 'tom acolhedor e familiar, enfatizando conforto e segurança'
    };

    return `Crie um script para vídeo de imóvel com as seguintes características:

DESCRIÇÃO DO IMÓVEL:
${description}

PÚBLICO-ALVO: ${targetAudience}
ESTILO: ${styleGuide[style] || styleGuide.professional}
DURAÇÃO: aproximadamente ${duration} segundos
IDIOMA: ${language === 'pt-BR' ? 'Português do Brasil' : language}

O script deve:
1. Ter uma introdução cativante (5-10 segundos)
2. Destacar os principais diferenciais do imóvel
3. Incluir uma chamada para ação no final
4. Ser natural e fluido para narração
5. Ter duração compatível com ${duration} segundos quando narrado

Retorne no formato:
SCRIPT: [o script completo aqui]
HIGHLIGHTS: [bullet points dos principais destaques, separados por vírgula]
DURAÇÃO_SUGERIDA: [tempo em segundos]`;
  }

  private parseScriptResponse(text: string, defaultDuration: number): ScriptResult {
    const scriptMatch = text.match(/SCRIPT:\s*([\s\S]*?)(?=HIGHLIGHTS:|$)/i);
    const highlightsMatch = text.match(/HIGHLIGHTS:\s*([\s\S]*?)(?=DURAÇÃO_SUGERIDA:|$)/i);
    const durationMatch = text.match(/DURAÇÃO_SUGERIDA:\s*(\d+)/i);

    const script = scriptMatch ? scriptMatch[1].trim() : text;
    const highlightsText = highlightsMatch ? highlightsMatch[1].trim() : '';
    const highlights = highlightsText
      .split(/[,\n]/)
      .map(h => h.trim())
      .filter(h => h.length > 0);

    return {
      script,
      highlights: highlights.length > 0 ? highlights : ['Imóvel exclusivo', 'Excelente localização', 'Ótimo investimento'],
      suggestedDuration: durationMatch ? parseInt(durationMatch[1]) : defaultDuration,
    };
  }

  private getMockScript(params: ScriptGenerationParams): ScriptResult {
    const { propertyDescription, style = 'professional' } = params;
    
    const scripts: Record<string, string> = {
      professional: `Bem-vindo a este excelente imóvel. Localizado em uma das melhores regiões da cidade, oferece conforto, segurança e sofisticação. Com ambientes amplos e bem iluminados, é perfeito para quem busca qualidade de vida. Não perca esta oportunidade única. Entre em contato agora mesmo e agende sua visita.`,
      casual: `Olha só que lugar incrível! Esse imóvel tem tudo que você precisa: espaço, conforto e uma localização que facilita sua vida. Imagina morar aqui? Vem conhecer pessoalmente, você vai se apaixonar!`,
      luxury: `Apresentamos um ícone de sofisticação e exclusividade. Cada detalhe foi cuidadosamente pensado para oferecer o máximo de elegância. Uma residência que transcende o comum e eleva o conceito de luxo. Uma oportunidade rara no mercado.`,
      family: `Um lar para criar memórias inesquecíveis. Este imóvel oferece o espaço perfeito para sua família crescer com segurança e aconchego. Quartos confortáveis, áreas de convivência acolhedoras e tudo que você precisa para o bem-estar dos seus.`,
    };

    return {
      script: scripts[style] || scripts.professional,
      highlights: [
        'Localização privilegiada',
        'Acabamento de alto padrão',
        'Espaço ideal para sua necessidade',
        'Excelente custo-benefício'
      ],
      suggestedDuration: 60,
    };
  }
}

// Singleton instance
export const minimaxService = new MiniMaxService();
