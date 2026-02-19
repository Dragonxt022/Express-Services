
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client using the API key strictly from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * Generates a short, professional description for a beauty service.
   */
  async generateServiceDescription(serviceName: string, category: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Escreva uma descrição atraente e profissional para um serviço de "${serviceName}" na categoria "${category}" para um aplicativo de delivery de serviços de beleza. A descrição deve ser curta (máximo 150 caracteres) e focar em qualidade e bem-estar.`,
      });
      return response.text || "Descrição não disponível.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Qualidade e excelência em cada detalhe do seu atendimento.";
    }
  },

  /**
   * Analyzes business stats and returns a strategic insight.
   */
  async analyzeBusinessInsights(stats: any) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Aja como um consultor de negócios experiente em marketplaces. Analise estes dados de faturamento e volume: ${JSON.stringify(stats)}. Dê uma sugestão estratégica curta e um "forecast" (previsão) de crescimento para o próximo mês em português.`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Continue monitorando o volume de transações para identificar novos padrões de consumo.";
    }
  }
};
