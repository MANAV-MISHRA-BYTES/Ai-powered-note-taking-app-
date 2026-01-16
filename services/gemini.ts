
import { GoogleGenAI } from "@google/genai";

// Initialize GoogleGenAI using the process.env.API_KEY directly as required by guidelines.
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Suggests the next content using gemini-3-flash-preview.
 * Removed maxOutputTokens to prevent potential response blocking.
 */
export const suggestNextContent = async (context: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `I am writing a note. Based on the following content, suggest the next 2-3 sentences to continue the thought naturally. Maintain the tone and style. 
    Content: "${context}"`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
};

/**
 * Summarizes the note content using gemini-3-flash-preview.
 */
export const summarizeNote = async (noteContent: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Please provide a professional summary of the following note content. 
    Include:
    1. A one-sentence high-level summary.
    2. Key action items (if any).
    3. Three main takeaways.
    
    Content: "${noteContent}"`,
    config: {
      temperature: 0.3,
    }
  });
  return response.text;
};

/**
 * Refines text tone using gemini-3-flash-preview.
 */
export const refineText = async (text: string, tone: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Rewrite the following text to have a ${tone} tone. Keep the core meaning identical but improve flow and vocabulary.
    Text: "${text}"`,
    config: {
      temperature: 0.6,
    }
  });
  return response.text;
};

/**
 * Analyzes multimodal image input using gemini-3-flash-preview.
 * Extracts mimeType from the data URL for accurate processing.
 */
export const analyzeImage = async (base64Image: string, prompt: string) => {
  const ai = getAIClient();
  
  // Extract the mimeType and base64 data parts from the data URL
  const mimeTypeMatch = base64Image.match(/^data:([^;]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
  const data = base64Image.split(',')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data, mimeType } },
        { text: prompt || "Analyze this image. If there is text, transcribe it. If it's a diagram, explain it. If it's a photo, describe the subjects." }
      ]
    }
  });
  return response.text;
};