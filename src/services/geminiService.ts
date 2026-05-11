import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
    if (aiInstance) return aiInstance;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined. Please configure it in the Secrets panel.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
};

export const getEmbedding = async (text: string) => {
    const ai = getAI();
    // Using gemini-embedding-2-preview as recommended in the skill
    const result = await ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: [text]
    });
    
    if (!result.embeddings || result.embeddings.length === 0) {
        throw new Error("Failed to generate embedding");
    }
    
    return result.embeddings[0].values;
};

export const generateResponse = async (prompt: string, context: string) => {
    const ai = getAI();
    
    const fullPrompt = `You are a helpful assistant. Use the provided context to answer the user's question accurately.
    
Context:
${context}

User Question: ${prompt}

Answer:`;

    // Using gemini-3.1-pro-preview for complex reasoning tasks as per skill
    const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [fullPrompt]
    });

    return response.text || "No response generated.";
};
