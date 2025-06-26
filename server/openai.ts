import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PriceAnalysisResult {
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketAnalysis: string;
  recommendations: string[];
  confidence: number;
  sources: string[];
}

export async function analyzePrices(product: string, quantity: number, unitPrice: number): Promise<PriceAnalysisResult> {
  try {
    const prompt = `
Analise o preço do seguinte produto para compra pública no Brasil:

Produto: ${product}
Quantidade: ${quantity} unidades
Preço unitário informado: R$ ${unitPrice.toFixed(2)}
Valor total: R$ ${(quantity * unitPrice).toFixed(2)}

Por favor, forneça uma análise detalhada incluindo:
1. Preço médio de mercado para este produto
2. Faixa de preços (mínimo e máximo) típica
3. Análise se o preço está adequado, alto ou baixo
4. Recomendações para otimização
5. Fontes ou referências de mercado

Responda em formato JSON seguindo esta estrutura:
{
  "averagePrice": número do preço médio unitário,
  "priceRange": {
    "min": preço mínimo unitário,
    "max": preço máximo unitário
  },
  "marketAnalysis": "análise detalhada do mercado e posicionamento do preço",
  "recommendations": ["lista", "de", "recomendações"],
  "confidence": número de 0 a 1 indicando confiança na análise,
  "sources": ["fontes", "de", "referência"]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em análise de preços para compras públicas no Brasil. Forneça análises precisas e baseadas em dados de mercado reais."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      averagePrice: result.averagePrice || unitPrice,
      priceRange: {
        min: result.priceRange?.min || unitPrice * 0.8,
        max: result.priceRange?.max || unitPrice * 1.2
      },
      marketAnalysis: result.marketAnalysis || "Análise não disponível",
      recommendations: result.recommendations || [],
      confidence: result.confidence || 0.5,
      sources: result.sources || ["Análise baseada em dados de mercado"]
    };
  } catch (error) {
    console.error("Erro na análise de preços:", error);
    
    // Fallback em caso de erro
    return {
      averagePrice: unitPrice,
      priceRange: {
        min: unitPrice * 0.8,
        max: unitPrice * 1.2
      },
      marketAnalysis: "Não foi possível realizar análise de mercado no momento. Verifique se o preço está adequado comparando com fornecedores similares.",
      recommendations: [
        "Consulte múltiplos fornecedores",
        "Verifique preços em portais de transparência",
        "Compare com licitações similares"
      ],
      confidence: 0.3,
      sources: ["Estimativa baseada em fórmula padrão"]
    };
  }
}

export async function generateQuotationReport(
  product: string,
  quantity: number,
  unitPrice: number,
  priceAnalysis: PriceAnalysisResult,
  municipalityName: string
): Promise<string> {
  try {
    const totalValue = quantity * unitPrice;
    const averageTotal = quantity * priceAnalysis.averagePrice;
    const difference = totalValue - averageTotal;
    const percentageDiff = ((difference / averageTotal) * 100);

    const prompt = `
Gere um relatório completo de cotação para compra pública com os seguintes dados:

DADOS DA COTAÇÃO:
- Produto: ${product}
- Quantidade: ${quantity} unidades
- Preço unitário: R$ ${unitPrice.toFixed(2)}
- Valor total: R$ ${totalValue.toFixed(2)}
- Município: ${municipalityName}

ANÁLISE DE PREÇOS:
- Preço médio de mercado: R$ ${priceAnalysis.averagePrice.toFixed(2)}
- Valor total médio: R$ ${averageTotal.toFixed(2)}
- Diferença: R$ ${difference.toFixed(2)} (${percentageDiff.toFixed(1)}%)
- Faixa de preços: R$ ${priceAnalysis.priceRange.min.toFixed(2)} - R$ ${priceAnalysis.priceRange.max.toFixed(2)}
- Confiança da análise: ${(priceAnalysis.confidence * 100).toFixed(0)}%

ANÁLISE DE MERCADO:
${priceAnalysis.marketAnalysis}

RECOMENDAÇÕES:
${priceAnalysis.recommendations.map(rec => `- ${rec}`).join('\n')}

Gere um relatório executivo estruturado e profissional adequado para documentação de processo licitatório.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em elaboração de relatórios para compras públicas. Gere relatórios técnicos, detalhados e adequados para processos licitatórios."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
    });

    return response.choices[0].message.content || "Relatório não pôde ser gerado";
  } catch (error) {
    console.error("Erro na geração do relatório:", error);
    
    const totalValue = quantity * unitPrice;
    const averageTotal = quantity * priceAnalysis.averagePrice;
    const difference = totalValue - averageTotal;
    const percentageDiff = ((difference / averageTotal) * 100);
    
    return `
RELATÓRIO DE COTAÇÃO

DADOS BÁSICOS:
- Produto: ${product}
- Quantidade: ${quantity} unidades
- Preço unitário: R$ ${unitPrice.toFixed(2)}
- Valor total: R$ ${totalValue.toFixed(2)}
- Município: ${municipalityName}

ANÁLISE DE PREÇOS:
- Preço médio de mercado: R$ ${priceAnalysis.averagePrice.toFixed(2)}
- Diferença em relação à média: R$ ${difference.toFixed(2)} (${percentageDiff.toFixed(1)}%)
- Situação: ${percentageDiff > 10 ? 'ACIMA DA MÉDIA' : percentageDiff < -10 ? 'ABAIXO DA MÉDIA' : 'DENTRO DA MÉDIA'}

RECOMENDAÇÕES:
${priceAnalysis.recommendations.map(rec => `- ${rec}`).join('\n')}

OBSERVAÇÕES:
${priceAnalysis.marketAnalysis}
`;
  }
}