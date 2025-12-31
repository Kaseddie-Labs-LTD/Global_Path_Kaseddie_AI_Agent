
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { VERIFIER_SYSTEM_INSTRUCTION, PHOTO_ENHANCEMENT_INSTRUCTION } from "../constants";
import { VerificationResult } from "../types";

export const verifyDocument = async (base64Data: string, mimeType: string): Promise<VerificationResult> => {
  // Always initialize with named parameter and process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Analyze this document for visa validity according to the system instructions." }
        ]
      },
      config: {
        systemInstruction: VERIFIER_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            valid: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            issues: { type: Type.ARRAY, items: { type: Type.STRING } },
            extractedData: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                expiry: { type: Type.STRING },
                documentType: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Verification error:", error);
    return {
      valid: false,
      confidence: 0,
      issues: ["Technical error during document processing."],
    };
  }
};

export const enhanceSelfie = async (base64Data: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: PHOTO_ENHANCEMENT_INSTRUCTION }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return base64Data;
  } catch (error) {
    console.error("Enhancement error:", error);
    return base64Data;
  }
};

export const generateJobVisual = async (jobTitle: string, location: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `A professional, high-quality, cinematic photograph representing the workplace for a ${jobTitle} in ${location}. 
  Modern atmosphere, clean lighting, wide shot, 4k resolution, no text or people's faces.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
};
