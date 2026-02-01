
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const editImageWithGemini = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/png'
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Extract base64 data without the prefix
  const base64Data = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No response generated from AI.");
    }

    let resultImageUrl = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        resultImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!resultImageUrl) {
      // Sometimes the model might return text instead of an image if it fails to process
      const textResponse = response.text;
      if (textResponse) {
        throw new Error(`AI returned text instead of an image: ${textResponse}`);
      }
      throw new Error("The AI did not return a modified image. Try a different prompt.");
    }

    return resultImageUrl;
  } catch (error: any) {
    console.error("Gemini Image Edit Error:", error);
    throw new Error(error.message || "An unexpected error occurred during image editing.");
  }
};
