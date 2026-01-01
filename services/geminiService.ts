import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please set it in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzePaperDraft = async (text: string): Promise<AnalysisResult> => {
  const ai = createClient();
  
  const prompt = `
    You are an expert academic research assistant. 
    Analyze the following text, which is a draft or segment of a research paper.
    
    Your task is to:
    1. Summarize the core research topic in 1-2 sentences.
    2. Generate 4-6 distinct, high-quality search queries that I can use on Semantic Scholar to find relevant papers to cite.
    3. For each query, provide a brief rationale for why this search is relevant (e.g., "To find foundational work on X" or "To find recent advancements in Y").

    Input Text:
    """
    ${text.slice(0, 30000)} 
    """
    (Text truncated to first 30k chars if longer)
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: "A concise summary of the research paper draft." },
      searchQueries: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "The search string to use." },
            rationale: { type: Type.STRING, description: "Why this query is useful." },
          },
          required: ["query", "rationale"],
        },
      },
    },
    required: ["summary", "searchQueries"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
